"""Points wallet as a ledger.

`LoyaltyAccount.balance` is a cached sum kept consistent in the same transaction as each
`PointTransaction` (row lock on the account). The ledger stays the source of truth:
SUM(amount) always equals balance, and every point can be explained.

The UNIQUE (account_id, source_type, source_id) constraint makes crediting idempotent: the
same business event (a registration, a game session, a profile field...) can never be
credited twice, whatever the retries or concurrent requests.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models._common import CreatedAt, Json, UuidPk, tz


class LoyaltyAccount(Base):
    __tablename__ = "loyalty_accounts"
    __table_args__ = (
        UniqueConstraint("user_id", "brand_id"),
        CheckConstraint("balance >= 0", name="balance_not_negative"),
    )

    id: Mapped[UuidPk]
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    brand_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("brands.id", ondelete="RESTRICT"))
    balance: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[CreatedAt]
    updated_at: Mapped[datetime | None] = mapped_column(tz())


class PointTransaction(Base):
    __tablename__ = "point_transactions"
    __table_args__ = (
        UniqueConstraint("account_id", "source_type", "source_id"),
        CheckConstraint("amount <> 0", name="amount_not_zero"),
    )

    id: Mapped[UuidPk]
    account_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("loyalty_accounts.id", ondelete="CASCADE"), index=True
    )
    amount: Mapped[int] = mapped_column(Integer)
    balance_after: Mapped[int] = mapped_column(Integer)
    # earn | spend | adjust
    type: Mapped[str] = mapped_column(String(20))
    # registration | email_verified | profile | game | reward_redemption | admin
    source_type: Mapped[str] = mapped_column(String(40))
    source_id: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[CreatedAt]


class EarningRule(Base):
    """A point-earning action shown in "Gagner des points". Adding a new paid action is a
    new row (plus, for profile fields, the field itself), never a React change."""

    __tablename__ = "earning_rules"
    __table_args__ = (
        UniqueConstraint("brand_id", "code"),
        CheckConstraint("points >= 0", name="points_positive"),
    )

    id: Mapped[UuidPk]
    brand_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("brands.id", ondelete="CASCADE"))
    # e.g. profile.first_name, profile.pet.name, profile.complete, game.dog_race
    code: Mapped[str] = mapped_column(String(60))
    # profile_field | profile_complete | game
    kind: Mapped[str] = mapped_column(String(30))
    label: Mapped[str] = mapped_column(String(120))
    description: Mapped[str | None] = mapped_column(String(300))
    points: Mapped[int] = mapped_column(Integer)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    config: Mapped[Json]
