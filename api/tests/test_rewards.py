import threading
import uuid

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.core.rate_limit import limiter
from app.models import PromoCode, Reward, RewardRedemption, User
from app.services import loyalty_service, reward_service
from app.services.email_service import memory_provider
from tests.helpers import BRAND, balance, verified_member

pytestmark = pytest.mark.usefixtures("seeded")


@pytest.fixture(autouse=True)
def _reset() -> None:
    memory_provider.outbox.clear()
    limiter.reset()


def reward_id(client: TestClient, slug: str) -> str:
    return next(r["id"] for r in client.get("/api/v1/rewards", params=BRAND).json() if r["slug"] == slug)


def give_points(db: Session, email: str, amount: int) -> User:
    user = db.scalar(select(User).where(User.email == email))
    assert user is not None
    brand_id = db.scalar(select(Reward.brand_id))
    assert brand_id is not None
    loyalty_service.credit(
        db,
        user_id=user.id,
        brand_id=brand_id,
        amount=amount,
        source_type="test",
        source_id=str(uuid.uuid4()),
        description="t",
    )
    db.commit()
    return user


def test_redeem_debits_points_and_returns_a_demo_code(client: TestClient, db: Session) -> None:
    verified_member(client)  # 100 points
    res = client.post(f"/api/v1/rewards/{reward_id(client, 'livraison-offerte')}/redeem")
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["code"].startswith("DEMO-CROQ-LIV-")
    assert data["balance"] == 0 and balance(client) == 0
    mine = client.get("/api/v1/rewards/my").json()
    assert [m["code"] for m in mine] == [data["code"]]
    assert mine[0]["status"] == "assigned"
    assert db.scalar(select(PromoCode.status).where(PromoCode.code == data["code"])) == "assigned"
    assert memory_provider.outbox[-1].subject.startswith("Croquin")


def test_insufficient_balance_is_a_clear_refusal(client: TestClient) -> None:
    verified_member(client)
    res = client.post(f"/api/v1/rewards/{reward_id(client, 'reduction-20')}/redeem")
    assert res.status_code == 409
    assert res.json()["error"] == {
        "code": "insufficient_points",
        "message": "Il vous manque 400 points pour cette récompense.",
        "details": {"missing": 400},
    }
    assert balance(client) == 100


def test_idempotent_retry_does_not_debit_twice(client: TestClient) -> None:
    verified_member(client)
    rid = reward_id(client, "livraison-offerte")
    headers = {"Idempotency-Key": "redeem-1"}
    first = client.post(f"/api/v1/rewards/{rid}/redeem", headers=headers).json()
    retry = client.post(f"/api/v1/rewards/{rid}/redeem", headers=headers).json()
    assert retry["code"] == first["code"]
    assert balance(client) == 0


def test_rollback_when_out_of_stock_keeps_the_points(client: TestClient, db: Session) -> None:
    verified_member(client)
    db.execute(update(PromoCode).values(status="used"))
    db.commit()
    res = client.post(f"/api/v1/rewards/{reward_id(client, 'livraison-offerte')}/redeem")
    assert res.status_code == 409
    assert res.json()["error"]["code"] == "out_of_stock"
    assert balance(client) == 100
    assert db.scalar(select(func.count()).select_from(RewardRedemption)) == 0


def test_concurrent_redemptions_never_share_a_code(client: TestClient, db: Session) -> None:
    email = verified_member(client)
    user = give_points(db, email, 900)  # 1000 points: 10 redemptions possible
    rid = uuid.UUID(reward_id(client, "livraison-offerte"))
    barrier = threading.Barrier(10)
    codes: list[str] = []

    def worker() -> None:
        with SessionLocal() as session:
            member = session.get(User, user.id)
            assert member is not None
            barrier.wait()
            redemption = reward_service.redeem(session, user=member, reward_id=rid, idempotency_key=None)
            session.commit()
            code = session.get(PromoCode, redemption.promo_code_id)
            assert code is not None
            codes.append(code.code)

    threads = [threading.Thread(target=worker) for _ in range(10)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert len(codes) == 10 and len(set(codes)) == 10
    assert balance(client) == 0
    assert loyalty_service.ledger_sum(db, user.id, db.scalar(select(Reward.brand_id))) == 0  # type: ignore[arg-type]


def test_overdraft_is_impossible_under_concurrency(client: TestClient, db: Session) -> None:
    email = verified_member(client)  # 100 points: one redemption only
    user = db.scalar(select(User).where(User.email == email))
    assert user is not None
    rid = uuid.UUID(reward_id(client, "livraison-offerte"))
    barrier = threading.Barrier(5)
    results: list[str] = []

    def worker() -> None:
        with SessionLocal() as session:
            member = session.get(User, user.id)
            assert member is not None
            barrier.wait()
            try:
                reward_service.redeem(session, user=member, reward_id=rid, idempotency_key=None)
                session.commit()
                results.append("ok")
            except loyalty_service.InsufficientPoints:
                results.append("refused")

    threads = [threading.Thread(target=worker) for _ in range(5)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert sorted(results) == ["ok"] + ["refused"] * 4
    assert balance(client) == 0
