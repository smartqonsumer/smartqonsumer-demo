import re
from datetime import timedelta

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.core.rate_limit import limiter
from app.models import AuthToken, Consent, User
from app.services import loyalty_service
from app.services.email_service import memory_provider
from tests.conftest import anon

pytestmark = pytest.mark.usefixtures("seeded")

PASSWORD = "Un-mot-de-passe-solide"
CONSENTS = {"participation_terms": True, "marketing_brand": False}


@pytest.fixture(autouse=True)
def _fresh_outbox_and_limits() -> None:
    memory_provider.outbox.clear()
    limiter.reset()


def register(
    client: TestClient, email: str = "nina@example.com", campaign: str = "croquin-simple-loyalty", **extra
):  # type: ignore[no-untyped-def]
    body = {
        "campaign_slug": campaign,
        "first_name": "Nina",
        "last_name": "Martin",
        "email": email,
        "password": PASSWORD,
        "consents": CONSENTS,
        **extra,
    }
    return client.post("/api/v1/auth/register", json=body, headers={"X-Anon-Token": anon()})


def last_token(kind: str) -> str:
    email = next(e for e in reversed(memory_provider.outbox) if e.kind == kind)
    match = re.search(r"token=([\w-]+)", email.text)
    assert match
    return match.group(1)


def test_registration_creates_a_pending_account_and_sends_a_verification_email(
    client: TestClient, db: Session
) -> None:
    res = register(client)
    assert res.status_code == 201, res.text
    data = res.json()
    assert data["user"]["status"] == "pending_email_verification"
    assert data["logged_in"] is False
    assert data["points_awarded"] == 0  # simple club: points once the email is verified
    assert "password" not in res.text and "hash" not in res.text
    assert [e.kind for e in memory_provider.outbox] == ["verify_email"]
    user = db.scalar(select(User).where(User.email == "nina@example.com"))
    assert user is not None and user.password_hash and PASSWORD not in user.password_hash
    consents = db.scalars(select(Consent).where(Consent.user_id == user.id)).all()
    assert {(c.type, c.granted, c.text_version) for c in consents} == {
        ("participation_terms", True, "2026-10-v1"),
        ("marketing_brand", False, "2026-10-v1"),
    }


def test_required_consent_is_mandatory(client: TestClient) -> None:
    res = register(client, consents={"participation_terms": False, "marketing_brand": True})
    assert res.status_code == 422
    assert res.json()["error"]["code"] == "consent_required"


def test_duplicate_email_is_refused(client: TestClient) -> None:
    register(client)
    res = register(client, email="NINA@example.com")
    assert res.status_code == 409


def test_weak_password_is_refused(client: TestClient) -> None:
    res = register(client, password="court")
    assert res.status_code == 422


def test_login_requires_a_verified_email(client: TestClient) -> None:
    register(client)
    res = client.post("/api/v1/auth/login", json={"email": "nina@example.com", "password": PASSWORD})
    assert res.status_code == 403
    assert res.json()["error"]["code"] == "email_not_verified"


def test_email_verification_activates_credits_points_once_and_logs_in(
    client: TestClient, db: Session
) -> None:
    register(client)
    token = last_token("verify_email")
    res = client.post("/api/v1/auth/verify-email", json={"token": token})
    assert res.status_code == 200, res.text
    assert res.json()["points_awarded"] == 100
    assert res.json()["user"]["email_verified"] is True
    assert client.get("/api/v1/me").json()["status"] == "active"
    # Single use
    again = client.post("/api/v1/auth/verify-email", json={"token": token})
    assert again.status_code == 400
    assert again.json()["error"]["code"] == "invalid_or_expired_token"
    user = db.scalar(select(User).where(User.email == "nina@example.com"))
    assert user is not None
    assert loyalty_service.balance(db, user.id, _brand_id(db)) == 100


def _brand_id(db: Session):  # type: ignore[no-untyped-def]
    from app.models import Brand

    return db.scalar(select(Brand.id))


def test_verification_token_is_stored_hashed_and_expires(client: TestClient, db: Session) -> None:
    register(client)
    token = last_token("verify_email")
    stored = db.scalars(select(AuthToken.token_hash)).all()
    assert token not in stored
    db.execute(update(AuthToken).values(expires_at=AuthToken.created_at - timedelta(minutes=1)))
    db.commit()
    res = client.post("/api/v1/auth/verify-email", json={"token": token})
    assert res.json()["error"]["code"] == "invalid_or_expired_token"


def test_login_logout_and_protected_route(client: TestClient) -> None:
    register(client)
    client.post("/api/v1/auth/verify-email", json={"token": last_token("verify_email")})
    client.post("/api/v1/auth/logout")
    assert client.get("/api/v1/me").status_code == 401

    bad = client.post(
        "/api/v1/auth/login", json={"email": "nina@example.com", "password": "mauvais-mot-de-passe"}
    )
    assert bad.status_code == 401
    res = client.post("/api/v1/auth/login", json={"email": "Nina@Example.com", "password": PASSWORD})
    assert res.status_code == 200
    cookie = res.headers["set-cookie"].lower()
    assert "httponly" in cookie and "samesite=lax" in cookie
    assert client.get("/api/v1/me").json()["first_name"] == "Nina"


def test_login_is_rate_limited_per_account(client: TestClient) -> None:
    for _ in range(10):
        client.post("/api/v1/auth/login", json={"email": "x@example.com", "password": "nope-nope-nope"})
    res = client.post("/api/v1/auth/login", json={"email": "x@example.com", "password": "nope-nope-nope"})
    assert res.status_code == 429


def test_password_reset_flow(client: TestClient) -> None:
    register(client)
    unknown = client.post("/api/v1/auth/forgot-password", json={"email": "personne@example.com"})
    known = client.post("/api/v1/auth/forgot-password", json={"email": "nina@example.com"})
    assert unknown.json() == known.json()  # no user enumeration
    token = last_token("reset_password")
    new_password = "Nouveau-mot-de-passe-42"
    assert (
        client.post(
            "/api/v1/auth/reset-password", json={"token": token, "password": new_password}
        ).status_code
        == 200
    )
    reused = client.post("/api/v1/auth/reset-password", json={"token": token, "password": new_password})
    assert reused.status_code == 400
    assert (
        client.post(
            "/api/v1/auth/login", json={"email": "nina@example.com", "password": PASSWORD}
        ).status_code
        == 401
    )
    assert (
        client.post(
            "/api/v1/auth/login", json={"email": "nina@example.com", "password": new_password}
        ).status_code
        == 200
    )


def test_gamified_registration_logs_in_and_credits_points_immediately(client: TestClient) -> None:
    res = register(client, campaign="croquin-dog-race")
    data = res.json()
    assert data["logged_in"] is True
    assert data["points_awarded"] == 100
    assert data["destination_path"] == "/club/"
    assert client.get("/api/v1/me").status_code == 200
