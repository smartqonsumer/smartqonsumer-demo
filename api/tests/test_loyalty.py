import threading

import pytest
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.db import SessionLocal
from app.models import Brand, PointTransaction
from app.services import loyalty_service
from app.services.loyalty_service import InsufficientPoints
from tests.conftest import make_user


def _credit(db: Session, user, brand: Brand, amount: int, source_id: str = "e1"):  # type: ignore[no-untyped-def]
    return loyalty_service.credit(
        db,
        user_id=user.id,
        brand_id=brand.id,
        amount=amount,
        source_type="test",
        source_id=source_id,
        description="test",
    )


def test_credit_updates_balance_and_ledger(db: Session, seeded: Brand) -> None:
    user = make_user(db)
    _credit(db, user, seeded, 100, "a")
    _credit(db, user, seeded, 20, "b")
    db.commit()
    assert loyalty_service.balance(db, user.id, seeded.id) == 120
    assert loyalty_service.ledger_sum(db, user.id, seeded.id) == 120


def test_same_event_is_never_credited_twice(db: Session, seeded: Brand) -> None:
    user = make_user(db)
    assert _credit(db, user, seeded, 100, "registration") is not None
    assert _credit(db, user, seeded, 100, "registration") is None
    db.commit()
    assert loyalty_service.balance(db, user.id, seeded.id) == 100


def test_debit_and_insufficient_balance(db: Session, seeded: Brand) -> None:
    user = make_user(db)
    _credit(db, user, seeded, 100)
    tx = loyalty_service.debit(
        db,
        user_id=user.id,
        brand_id=seeded.id,
        amount=60,
        source_type="redeem",
        source_id="r1",
        description="x",
    )
    assert tx.amount == -60 and tx.balance_after == 40
    with pytest.raises(InsufficientPoints) as exc:
        loyalty_service.debit(
            db,
            user_id=user.id,
            brand_id=seeded.id,
            amount=50,
            source_type="redeem",
            source_id="r2",
            description="x",
        )
    assert exc.value.details["missing"] == 10
    db.commit()
    assert loyalty_service.balance(db, user.id, seeded.id) == 40


def test_concurrent_credits_of_one_event_only_count_once(db: Session, seeded: Brand) -> None:
    user = make_user(db)
    barrier = threading.Barrier(6)

    def worker() -> None:
        with SessionLocal() as session:
            barrier.wait()
            loyalty_service.credit(
                session,
                user_id=user.id,
                brand_id=seeded.id,
                amount=100,
                source_type="registration",
                source_id=str(user.id),
                description="Inscription",
            )
            session.commit()

    threads = [threading.Thread(target=worker) for _ in range(6)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    assert loyalty_service.balance(db, user.id, seeded.id) == 100
    assert db.scalar(select(func.count()).select_from(PointTransaction)) == 1


def test_next_reward_is_the_cheapest_unaffordable_one(db: Session, seeded: Brand) -> None:
    reward = loyalty_service.next_reward(db, seeded.id, 120)
    assert reward is not None and reward.cost_points == 250
