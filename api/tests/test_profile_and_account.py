import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.rate_limit import limiter
from app.models import Consent, User
from app.services.email_service import memory_provider
from tests.helpers import BRAND, PASSWORD, balance, verified_member

pytestmark = pytest.mark.usefixtures("seeded")


@pytest.fixture(autouse=True)
def _reset() -> None:
    memory_provider.outbox.clear()
    limiter.reset()


def patch(client: TestClient, body: dict) -> dict:
    res = client.patch("/api/v1/me/profile", params=BRAND, json=body)
    assert res.status_code == 200, res.text
    return res.json()


def test_profile_fields_earn_points_once(client: TestClient) -> None:
    verified_member(client)
    first = patch(client, {"city": "Lille", "pet": {"name": "Filou"}})
    assert first["points_awarded"] == 30  # city 10 + pet name 20
    again = patch(client, {"city": "Arras", "pet": {"name": "Rex"}})
    assert again["points_awarded"] == 0
    cleared_then_refilled = patch(client, {"city": None})
    assert cleared_then_refilled["points_awarded"] == 0
    assert patch(client, {"city": "Lens"})["points_awarded"] == 0
    assert again["profile"]["pet"]["name"] == "Rex"


def test_complete_profile_bonus(client: TestClient) -> None:
    verified_member(client)
    data = patch(
        client,
        {
            "birth_date": "1990-05-04",
            "city": "Lille",
            "has_dog": True,
            "pet": {
                "name": "Filou",
                "age_years": 4,
                "size": "medium",
                "breed": "Beagle",
                "food_preferences": "Poulet",
            },
        },
    )
    assert data["points_awarded"] == 10 + 10 + 10 + 20 + 10 + 10 + 10 + 10 + 50
    actions = client.get("/api/v1/loyalty/earning-actions", params=BRAND).json()
    assert all(a["done"] for a in actions["profile"])
    assert {g["type"] for g in actions["games"]} == {"dog_race", "roulette"}


def test_invalid_profile_input_is_refused(client: TestClient) -> None:
    verified_member(client)
    res = client.patch("/api/v1/me/profile", params=BRAND, json={"pet": {"age_years": -3}})
    assert res.status_code == 422
    res = client.patch("/api/v1/me/profile", params=BRAND, json={"is_admin": True})
    assert res.status_code == 422


def test_marketing_consent_can_be_granted_and_withdrawn(client: TestClient, db: Session) -> None:
    verified_member(client)
    assert client.post("/api/v1/me/consents/marketing_brand/grant").status_code == 200
    active = {c["type"]: c["active"] for c in client.get("/api/v1/me/consents").json()}
    assert active == {"participation_terms": True, "marketing_brand": True}
    assert client.post("/api/v1/me/consents/marketing_brand/withdraw").status_code == 200
    active = {c["type"]: c["active"] for c in client.get("/api/v1/me/consents").json()}
    assert active["marketing_brand"] is False
    assert client.post("/api/v1/me/consents/participation_terms/withdraw").status_code == 400
    # History is kept: initial refusal, grant (now withdrawn)
    assert len(db.scalars(select(Consent).where(Consent.type == "marketing_brand")).all()) == 2


def test_export_contains_the_members_data(client: TestClient) -> None:
    verified_member(client)
    patch(client, {"pet": {"name": "Filou"}})
    data = client.get("/api/v1/me/export").json()
    assert data["account"]["email"] == "membre@example.com"
    assert data["pets"][0]["name"] == "Filou"
    assert sum(p["amount"] for p in data["points"]) == balance(client)


def test_account_deletion_anonymises_and_logs_out(client: TestClient, db: Session) -> None:
    verified_member(client)
    assert client.delete("/api/v1/me").status_code == 200
    assert client.get("/api/v1/me").status_code == 401
    user = db.scalar(select(User).where(User.status == "deleted"))
    assert user is not None and user.email is None and user.password_hash is None
    login = client.post("/api/v1/auth/login", json={"email": "membre@example.com", "password": PASSWORD})
    assert login.status_code == 401
