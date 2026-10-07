"""Points ledger. Every movement goes through `credit` / `debit`, which:
1. lock the account row (SELECT ... FOR UPDATE) to serialise movements on one wallet;
2. refuse a second movement for the same (source_type, source_id) — idempotent crediting;
3. write the PointTransaction and update the cached balance in the caller's transaction.

They never commit: the caller commits together with the business change (registration,
game session, redemption...), so points and their cause are always consistent.
"""

import uuid

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.orm import Session

from app.core.db import utcnow
from app.core.errors import AppError
from app.models import LoyaltyAccount, PointTransaction, Reward


class InsufficientPoints(AppError):
    status_code = 409


def get_or_create_account(db: Session, user_id: uuid.UUID, brand_id: uuid.UUID) -> LoyaltyAccount:
    db.execute(
        insert(LoyaltyAccount)
        .values(id=uuid.uuid4(), user_id=user_id, brand_id=brand_id, balance=0)
        .on_conflict_do_nothing(index_elements=[LoyaltyAccount.user_id, LoyaltyAccount.brand_id])
    )
    account = db.scalar(
        select(LoyaltyAccount).where(LoyaltyAccount.user_id == user_id, LoyaltyAccount.brand_id == brand_id)
    )
    assert account is not None
    return account


def _lock_account(db: Session, user_id: uuid.UUID, brand_id: uuid.UUID) -> LoyaltyAccount:
    account = get_or_create_account(db, user_id, brand_id)
    locked = db.scalar(
        select(LoyaltyAccount)
        .where(LoyaltyAccount.id == account.id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    assert locked is not None
    return locked


def _already_recorded(db: Session, account: LoyaltyAccount, source_type: str, source_id: str) -> bool:
    return (
        db.scalar(
            select(PointTransaction.id).where(
                PointTransaction.account_id == account.id,
                PointTransaction.source_type == source_type,
                PointTransaction.source_id == source_id,
            )
        )
        is not None
    )


def credit(
    db: Session,
    *,
    user_id: uuid.UUID,
    brand_id: uuid.UUID,
    amount: int,
    source_type: str,
    source_id: str,
    description: str,
) -> PointTransaction | None:
    """Credit points once per business event. Returns None if that event was already credited."""
    if amount <= 0:
        return None
    account = _lock_account(db, user_id, brand_id)
    if _already_recorded(db, account, source_type, source_id):
        return None
    account.balance += amount
    account.updated_at = utcnow()
    tx = PointTransaction(
        account_id=account.id,
        amount=amount,
        balance_after=account.balance,
        type="earn",
        source_type=source_type,
        source_id=source_id,
        description=description,
    )
    db.add(tx)
    db.flush()
    return tx


def debit(
    db: Session,
    *,
    user_id: uuid.UUID,
    brand_id: uuid.UUID,
    amount: int,
    source_type: str,
    source_id: str,
    description: str,
) -> PointTransaction:
    if amount <= 0:
        raise ValueError("debit amount must be positive")
    account = _lock_account(db, user_id, brand_id)
    if _already_recorded(db, account, source_type, source_id):
        raise AppError("already_processed", "Cette opération a déjà été prise en compte.", status_code=409)
    if account.balance < amount:
        raise InsufficientPoints(
            "insufficient_points",
            f"Il vous manque {amount - account.balance} points pour cette récompense.",
            missing=amount - account.balance,
        )
    account.balance -= amount
    account.updated_at = utcnow()
    tx = PointTransaction(
        account_id=account.id,
        amount=-amount,
        balance_after=account.balance,
        type="spend",
        source_type=source_type,
        source_id=source_id,
        description=description,
    )
    db.add(tx)
    db.flush()
    return tx


def balance(db: Session, user_id: uuid.UUID, brand_id: uuid.UUID) -> int:
    value = db.scalar(
        select(LoyaltyAccount.balance).where(
            LoyaltyAccount.user_id == user_id, LoyaltyAccount.brand_id == brand_id
        )
    )
    return value or 0


def ledger_sum(db: Session, user_id: uuid.UUID, brand_id: uuid.UUID) -> int:
    value = db.scalar(
        select(func.coalesce(func.sum(PointTransaction.amount), 0))
        .join(LoyaltyAccount, PointTransaction.account_id == LoyaltyAccount.id)
        .where(LoyaltyAccount.user_id == user_id, LoyaltyAccount.brand_id == brand_id)
    )
    return int(value or 0)


def transactions(
    db: Session, user_id: uuid.UUID, brand_id: uuid.UUID, limit: int = 50
) -> list[PointTransaction]:
    return list(
        db.scalars(
            select(PointTransaction)
            .join(LoyaltyAccount, PointTransaction.account_id == LoyaltyAccount.id)
            .where(LoyaltyAccount.user_id == user_id, LoyaltyAccount.brand_id == brand_id)
            .order_by(PointTransaction.created_at.desc(), PointTransaction.id)
            .limit(limit)
        )
    )


def next_reward(db: Session, brand_id: uuid.UUID, current: int) -> Reward | None:
    """Cheapest catalogue reward the member cannot afford yet (drives the progress bar)."""
    return db.scalar(
        select(Reward)
        .where(
            Reward.brand_id == brand_id,
            Reward.active.is_(True),
            Reward.redeemable.is_(True),
            Reward.cost_points > current,
        )
        .order_by(Reward.cost_points)
        .limit(1)
    )
