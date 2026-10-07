import threading
import uuid
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.db import SessionLocal, utcnow
from app.models import Campaign, Participation, Scan
from app.services import scan_service
from seeds.demo import GTIN_DOG_RACE, GTIN_SIMPLE
from tests.conftest import anon

pytestmark = pytest.mark.usefixtures("seeded")


def post_scan(client: TestClient, token: str, gtin: str = GTIN_DOG_RACE, **body: object) -> dict:
    res = client.post("/api/v1/scans", json={"gtin": gtin, **body}, headers={"X-Anon-Token": token})
    assert res.status_code == 200, res.text
    return res.json()


def set_policy(db: Session, slug: str, policy: str) -> None:
    campaign = db.scalar(select(Campaign).where(Campaign.slug == slug))
    assert campaign is not None
    campaign.scan_policy = policy
    db.commit()


def test_first_scan_is_accepted_and_routes_to_the_campaign(client: TestClient) -> None:
    data = post_scan(client, anon())
    assert data["eligible"] is True
    assert data["status"] == "accepted"
    assert data["campaign_slug"] == "croquin-dog-race"
    assert data["destination_path"] == "/club-croquin/"


def test_second_scan_by_same_visitor_is_refused_with_a_functional_message(client: TestClient) -> None:
    token = anon()
    post_scan(client, token)
    again = post_scan(client, token)
    assert again["eligible"] is False
    assert again["status"] == "already_used"
    assert again["message"] == "Ce QR Code a déjà été utilisé pour cette opération."


def test_every_scan_is_recorded_even_when_not_eligible(client: TestClient, db: Session) -> None:
    token = anon()
    for _ in range(3):
        post_scan(client, token)
    assert db.scalar(select(func.count()).select_from(Scan)) == 3
    assert db.scalar(select(func.count()).select_from(Participation)) == 1


def test_other_visitor_and_other_product_are_independent(client: TestClient) -> None:
    token = anon()
    assert post_scan(client, token)["eligible"]
    assert post_scan(client, anon())["eligible"]
    assert post_scan(client, token, gtin=GTIN_SIMPLE)["eligible"]


def test_unlimited_policy_accepts_every_scan(client: TestClient, db: Session) -> None:
    set_policy(db, "croquin-dog-race", "unlimited")
    token = anon()
    assert all(post_scan(client, token)["eligible"] for _ in range(3))


def test_single_use_serialised_qr_is_usable_once_whoever_scans_it(client: TestClient, db: Session) -> None:
    set_policy(db, "croquin-dog-race", "single_use")
    assert post_scan(client, anon(), serial="ABC123")["eligible"]
    assert not post_scan(client, anon(), serial="ABC123")["eligible"]
    assert post_scan(client, anon(), serial="ABC124")["eligible"]


def test_once_per_day_policy_keys_on_the_date(db: Session) -> None:
    campaign = db.scalar(select(Campaign).where(Campaign.slug == "croquin-dog-race"))
    assert campaign is not None
    campaign.scan_policy = "once_per_day"
    key = scan_service.eligibility_key(
        campaign, gtin=GTIN_DOG_RACE, serial=None, player="visitor:x", scan_id=uuid.uuid4()
    )
    assert key == f"visitor:x:day:{utcnow().date().isoformat()}"


def test_inactive_campaign_records_scan_but_is_not_eligible(client: TestClient, db: Session) -> None:
    campaign = db.scalar(select(Campaign).where(Campaign.slug == "croquin-dog-race"))
    assert campaign is not None
    campaign.end_at = utcnow() - timedelta(days=1)
    db.commit()
    data = post_scan(client, anon())
    assert data == {**data, "eligible": False, "status": "campaign_inactive"}


def test_unknown_and_invalid_gtin(client: TestClient) -> None:
    headers = {"X-Anon-Token": anon()}
    unknown = client.post("/api/v1/scans", json={"gtin": "09506000164991"}, headers=headers)
    assert unknown.status_code == 404
    assert unknown.json()["error"]["code"] == "unknown_gtin"
    invalid = client.post("/api/v1/scans", json={"gtin": "09506000164909"}, headers=headers)
    assert invalid.json()["error"]["code"] == "invalid_gtin"


def test_missing_anon_token_is_rejected(client: TestClient) -> None:
    res = client.post("/api/v1/scans", json={"gtin": GTIN_DOG_RACE})
    assert res.status_code == 400
    assert res.json()["error"]["code"] == "invalid_anon_token"


def test_idempotency_key_replays_the_same_scan(client: TestClient, db: Session) -> None:
    token = anon()
    headers = {"X-Anon-Token": token, "Idempotency-Key": "scan-retry-1"}
    first = client.post("/api/v1/scans", json={"gtin": GTIN_DOG_RACE}, headers=headers).json()
    retry = client.post("/api/v1/scans", json={"gtin": GTIN_DOG_RACE}, headers=headers).json()
    assert retry["scan_id"] == first["scan_id"]
    assert retry["eligible"] is True
    assert db.scalar(select(func.count()).select_from(Scan)) == 1


def test_concurrent_scans_validate_only_one_participation() -> None:
    token = anon()
    results: list[bool] = []
    barrier = threading.Barrier(8)

    def worker() -> None:
        with SessionLocal() as session:
            barrier.wait()
            results.append(scan_service.record_scan(session, gtin=GTIN_DOG_RACE, anon_token=token).eligible)

    threads = [threading.Thread(target=worker) for _ in range(8)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert sorted(results) == [False] * 7 + [True]


def test_demo_qr_codes_point_to_the_resolver(client: TestClient) -> None:
    codes = client.get("/api/v1/qr-codes").json()
    assert {c["journey"] for c in codes} == {"gamified", "simple"}
    assert all(c["resolver_url"].endswith(f"/01/{c['gtin']}") for c in codes)


def test_public_campaign_never_exposes_the_win_probability(client: TestClient) -> None:
    data = client.get("/api/v1/campaigns/croquin-dog-race").json()
    assert data["brand"]["slug"] == "croquin"
    assert data["games"][0]["type"] == "dog_race"
    assert "win_probability" not in str(data)
    assert [c["required"] for c in data["consents"]] == [True, False]
