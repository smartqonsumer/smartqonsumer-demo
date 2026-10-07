import re
import uuid

from fastapi.testclient import TestClient

from app.services.email_service import memory_provider

PASSWORD = "Un-mot-de-passe-solide"
BRAND = {"brand": "croquin"}


def last_token(kind: str) -> str:
    email = next(e for e in reversed(memory_provider.outbox) if e.kind == kind)
    match = re.search(r"token=([\w-]+)", email.text)
    assert match
    return match.group(1)


def verified_member(client: TestClient, email: str = "membre@example.com") -> str:
    """Scenario B shortcut: simple-club registration + email verification (logged in)."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "campaign_slug": "croquin-simple-loyalty",
            "first_name": "Nicolas",
            "last_name": "Demo",
            "email": email,
            "password": PASSWORD,
            "consents": {"participation_terms": True},
        },
        headers={"X-Anon-Token": str(uuid.uuid4())},
    )
    assert res.status_code == 201, res.text
    verified = client.post("/api/v1/auth/verify-email", json={"token": last_token("verify_email")})
    assert verified.status_code == 200
    return email


def balance(client: TestClient) -> int:
    return int(client.get("/api/v1/loyalty/summary", params=BRAND).json()["balance"])
