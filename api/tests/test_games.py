import threading
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.core.rate_limit import limiter
from app.models import Game, GameSession, PointTransaction, User
from app.services import game_service
from app.services.email_service import memory_provider
from seeds.demo import GTIN_DOG_RACE
from tests.helpers import BRAND, balance, verified_member

pytestmark = pytest.mark.usefixtures("seeded")


@pytest.fixture(autouse=True)
def _reset() -> None:
    memory_provider.outbox.clear()
    limiter.reset()


def scan(client: TestClient, token: str) -> str:
    res = client.post("/api/v1/scans", json={"gtin": GTIN_DOG_RACE}, headers={"X-Anon-Token": token})
    return str(res.json()["scan_id"])


def play_welcome(client: TestClient, token: str, scan_id: str | None, choice: str = "filou"):  # type: ignore[no-untyped-def]
    body = {
        "campaign_slug": "croquin-dog-race",
        "choice": choice,
        **({"scan_id": scan_id} if scan_id else {}),
    }
    return client.post("/api/v1/games/dog-race/play", json=body, headers={"X-Anon-Token": token})


def set_game(db: Session, campaign_slug: str, game_type: str, **config: object) -> None:
    from app.models import Campaign

    game = db.scalar(
        select(Game).join(Campaign).where(Campaign.slug == campaign_slug, Game.type == game_type)
    )
    assert game is not None
    game.config = {**game.config, **config}
    db.commit()


def test_welcome_race_is_won_with_probability_one_and_chosen_dog_wins(client: TestClient) -> None:
    token = str(uuid.uuid4())
    res = play_welcome(client, token, scan(client, token))
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["won"] is True
    assert data["outcome"]["winner_dog"] == data["outcome"]["chosen_dog"] == "filou"
    assert data["pending_claim"] is True


def test_probability_zero_never_wins(client: TestClient, db: Session) -> None:
    set_game(db, "croquin-dog-race", "dog_race", win_probability=0.0)
    token = str(uuid.uuid4())
    data = play_welcome(client, token, scan(client, token)).json()
    assert data["won"] is False
    assert data["outcome"]["winner_dog"] != data["outcome"]["chosen_dog"]


def test_welcome_game_requires_an_accepted_scan_of_this_browser(client: TestClient) -> None:
    token = str(uuid.uuid4())
    assert play_welcome(client, token, None).json()["error"]["code"] == "scan_required"
    other_scan = scan(client, str(uuid.uuid4()))
    assert play_welcome(client, token, other_scan).status_code == 404


def test_welcome_game_can_be_played_only_once(client: TestClient) -> None:
    token = str(uuid.uuid4())
    scan_id = scan(client, token)
    assert play_welcome(client, token, scan_id).status_code == 200
    again = play_welcome(client, token, scan_id)
    assert again.status_code == 409
    assert again.json()["error"]["code"] == "play_limit_reached"


def test_invalid_dog_choice_is_refused(client: TestClient) -> None:
    token = str(uuid.uuid4())
    assert play_welcome(client, token, scan(client, token), choice="rex").status_code == 400


def test_member_games_require_login(client: TestClient) -> None:
    res = client.post("/api/v1/games/roulette/play", json={"campaign_slug": "croquin-simple-loyalty"})
    assert res.status_code == 401


def test_roulette_credits_the_drawn_segment_once_and_limits_to_one_play_per_day(client: TestClient) -> None:
    verified_member(client)
    before = balance(client)
    res = client.post("/api/v1/games/roulette/play", json={"campaign_slug": "croquin-simple-loyalty"})
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["points_awarded"] in (10, 20, 50, 100)
    assert data["outcome"]["label"] == f"+{data['points_awarded']}"
    assert balance(client) == before + data["points_awarded"]
    again = client.post("/api/v1/games/roulette/play", json={"campaign_slug": "croquin-simple-loyalty"})
    assert again.status_code == 409
    assert again.json()["error"]["message"] == "Vous avez déjà joué aujourd'hui. Vous pourrez rejouer demain."
    games = client.get("/api/v1/games", params=BRAND).json()
    assert {g["type"]: g["can_play"] for g in games} == {"dog_race": True, "roulette": False}


def test_member_dog_race_win_credits_configured_points(client: TestClient) -> None:
    verified_member(client)
    before = balance(client)
    res = client.post(
        "/api/v1/games/dog-race/play", json={"campaign_slug": "croquin-simple-loyalty", "choice": "praline"}
    )
    assert res.json()["won"] is True
    assert balance(client) == before + 50


def test_concurrent_plays_respect_the_limit(client: TestClient, db: Session) -> None:
    email = verified_member(client)
    user = db.scalar(select(User).where(User.email == email))
    assert user is not None
    barrier = threading.Barrier(6)
    outcomes: list[str] = []

    def worker() -> None:
        with SessionLocal() as session:
            member = session.get(User, user.id)
            barrier.wait()
            try:
                game_service.play(
                    session,
                    game_type="roulette",
                    campaign_slug="croquin-simple-loyalty",
                    user=member,
                    anon_token=None,
                    scan_id=None,
                    choice=None,
                )
                outcomes.append("played")
            except game_service.PlayLimitReached:
                outcomes.append("refused")

    threads = [threading.Thread(target=worker) for _ in range(6)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert sorted(outcomes) == ["played"] + ["refused"] * 5
    assert db.scalar(select(func.count()).select_from(GameSession)) == 1
    assert (
        db.scalar(
            select(func.count()).select_from(PointTransaction).where(PointTransaction.source_type == "game")
        )
        == 1
    )


def test_max_count_limit(client: TestClient, db: Session) -> None:
    from app.models import Campaign

    game = db.scalar(
        select(Game).join(Campaign).where(Campaign.slug == "croquin-simple-loyalty", Game.type == "roulette")
    )
    assert game is not None
    game.play_limit, game.max_plays = "max_count", 2
    db.commit()
    verified_member(client)
    codes = [
        client.post(
            "/api/v1/games/roulette/play", json={"campaign_slug": "croquin-simple-loyalty"}
        ).status_code
        for _ in range(3)
    ]
    assert codes == [200, 200, 409]
