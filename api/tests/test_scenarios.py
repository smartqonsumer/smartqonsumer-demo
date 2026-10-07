"""End-to-end business scenarios A and B at the API level (the browser part is covered
by the Playwright suite of web/)."""

import re
import uuid

import pytest
from fastapi.testclient import TestClient

from app.core.rate_limit import limiter
from app.services.email_service import memory_provider
from seeds.demo import GTIN_DOG_RACE, GTIN_SIMPLE
from tests.helpers import BRAND, PASSWORD, balance, last_token

pytestmark = pytest.mark.usefixtures("seeded")


@pytest.fixture(autouse=True)
def _reset() -> None:
    memory_provider.outbox.clear()
    limiter.reset()


def test_scenario_a_gamified_club(client: TestClient) -> None:
    anon = {"X-Anon-Token": str(uuid.uuid4())}
    codes = {c["journey"]: c for c in client.get("/api/v1/qr-codes").json()}
    assert codes["gamified"]["gtin"] == GTIN_DOG_RACE

    scan = client.post(
        "/api/v1/scans", json={"gtin": GTIN_DOG_RACE, "campaign_slug": "croquin-dog-race"}, headers=anon
    ).json()
    assert scan["eligible"] and scan["destination_path"] == "/club-croquin/"

    race = client.post(
        "/api/v1/games/dog-race/play",
        json={"campaign_slug": "croquin-dog-race", "scan_id": scan["scan_id"], "choice": "praline"},
        headers=anon,
    ).json()
    assert race["won"] and race["pending_claim"]

    reg = client.post(
        "/api/v1/auth/register",
        json={
            "campaign_slug": "croquin-dog-race",
            "first_name": "Nicolas",
            "last_name": "Demo",
            "email": "nicolas@example.com",
            "password": PASSWORD,
            "consents": {"participation_terms": True, "marketing_brand": True},
            "game_session_id": race["game_session_id"],
        },
        headers=anon,
    ).json()
    assert reg["logged_in"] and reg["points_awarded"] == 100
    assert reg["reward_title"] == "Friandise offerte"
    assert {e.kind for e in memory_provider.outbox} == {"verify_email", "reward_confirmation"}

    # The same win cannot be claimed twice (another account, same browser)
    client.post("/api/v1/auth/logout")
    second = client.post(
        "/api/v1/auth/register",
        json={
            "campaign_slug": "croquin-dog-race",
            "first_name": "Bis",
            "last_name": "Demo",
            "email": "bis@example.com",
            "password": PASSWORD,
            "consents": {"participation_terms": True},
            "game_session_id": race["game_session_id"],
        },
        headers=anon,
    ).json()
    assert second["reward_title"] is None
    client.post("/api/v1/auth/logout")
    # Back in the club through the confirmation link of the first account.
    assert balance_after_verify(client) == 100

    gifts = client.get("/api/v1/rewards/my").json()
    assert gifts[0]["code"].startswith("DEMO-CROQ-GIFT-") and gifts[0]["source"] == "game_win"

    profile = client.patch(
        "/api/v1/me/profile", params=BRAND, json={"pet": {"name": "Filou", "age_years": 3}}
    ).json()
    assert profile["points_awarded"] == 30 and balance(client) == 130

    reward_id = next(
        r["id"] for r in client.get("/api/v1/rewards", params=BRAND).json() if r["cost_points"] == 100
    )
    redeemed = client.post(f"/api/v1/rewards/{reward_id}/redeem").json()
    assert redeemed["balance"] == 30
    assert redeemed["code"] in {r["code"] for r in client.get("/api/v1/rewards/my").json()}


def balance_after_verify(client: TestClient) -> int:
    email = next(e for e in memory_provider.outbox if e.kind == "verify_email" and "nicolas" in e.to.lower())
    match = re.search(r"token=([\w-]+)", email.text)
    assert match
    client.post("/api/v1/auth/verify-email", json={"token": match.group(1)})
    return balance(client)


def test_scenario_b_simple_club(client: TestClient) -> None:
    anon = {"X-Anon-Token": str(uuid.uuid4())}
    scan = client.post("/api/v1/scans", json={"gtin": GTIN_SIMPLE}, headers=anon).json()
    assert scan["eligible"] and scan["destination_path"] == "/club-croquin-simple/"
    landing = client.get("/api/v1/campaigns/croquin-simple-loyalty").json()
    assert landing["journey"] == "simple" and landing["registration_points_on"] == "email_verified"

    reg = client.post(
        "/api/v1/auth/register",
        json={
            "campaign_slug": "croquin-simple-loyalty",
            "first_name": "Nina",
            "last_name": "Martin",
            "email": "nina@example.com",
            "password": PASSWORD,
            "consents": {"participation_terms": True},
        },
        headers=anon,
    ).json()
    assert not reg["logged_in"] and reg["user"]["status"] == "pending_email_verification"
    assert client.get("/api/v1/me").status_code == 401

    verified = client.post("/api/v1/auth/verify-email", json={"token": last_token("verify_email")}).json()
    assert verified["points_awarded"] == 100
    client.post("/api/v1/auth/logout")
    assert (
        client.post(
            "/api/v1/auth/login", json={"email": "nina@example.com", "password": PASSWORD}
        ).status_code
        == 200
    )
    assert balance(client) == 100

    actions = client.get("/api/v1/loyalty/earning-actions", params=BRAND).json()
    assert actions["profile"] and {g["slug"] for g in actions["games"]} == {"dog-race", "roulette"}

    client.patch("/api/v1/me/profile", params=BRAND, json={"city": "Lille"})
    race = client.post(
        "/api/v1/games/dog-race/play", json={"campaign_slug": "croquin-simple-loyalty", "choice": "filou"}
    ).json()
    wheel = client.post(
        "/api/v1/games/roulette/play", json={"campaign_slug": "croquin-simple-loyalty"}
    ).json()
    expected = 100 + 10 + race["points_awarded"] + wheel["points_awarded"]
    assert balance(client) == expected
    history = client.get("/api/v1/loyalty/transactions", params=BRAND).json()
    assert sum(t["amount"] for t in history) == expected

    reward_id = next(
        r["id"] for r in client.get("/api/v1/rewards", params=BRAND).json() if r["cost_points"] == 100
    )
    code = client.post(f"/api/v1/rewards/{reward_id}/redeem").json()["code"]
    assert code in {r["code"] for r in client.get("/api/v1/rewards/my").json()}
