"""Reward catalogue, promo code stock and redemptions.

A redemption debits points (PointTransaction), reserves one PromoCode and records the
RewardRedemption in ONE database transaction: either all three exist, or none.
Unique constraints guarantee a code is never handed out twice and a debit maps to a
single redemption.
"""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models._common import CreatedAt, UuidPk, tz

PROMO_STATUSES = ("available", "assigned", "used", "expired")


class Reward(Base):
    __tablename__ = "rewards"
    __table_args__ = (
        UniqueConstraint("brand_id", "slug"),
        CheckConstraint("cost_points >= 0", name="cost_points_positive"),
    )

    id: Mapped[UuidPk]
    brand_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("brands.id", ondelete="CASCADE"))
    slug: Mapped[str] = mapped_column(String(80))
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str | None] = mapped_column(String(400))
    cost_points: Mapped[int] = mapped_column(Integer)
    # In the catalogue (exchangeable for points) or only granted (e.g. welcome gift).
    redeemable: Mapped[bool] = mapped_column(Boolean, default=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    # pool = pre-created codes in promo_codes; external = provided by a partner system later.
    code_source: Mapped[str] = mapped_column(String(20), default="pool")
    valid_days: Mapped[int | None] = mapped_column(Integer)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[CreatedAt]


class PromoCode(Base):
    __tablename__ = "promo_codes"
    __table_args__ = (CheckConstraint(f"status IN {PROMO_STATUSES}", name="status"),)

    id: Mapped[UuidPk]
    reward_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rewards.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(60), unique=True)
    status: Mapped[str] = mapped_column(String(20), default="available")
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False)
    expires_at: Mapped[datetime | None] = mapped_column(tz())
    assigned_at: Mapped[datetime | None] = mapped_column(tz())
    used_at: Mapped[datetime | None] = mapped_column(tz())
    created_at: Mapped[CreatedAt]


class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"
    # One redemption per business origin: a points exchange request (idempotency key)
    # or a won game session.
    __table_args__ = (UniqueConstraint("source", "source_ref"),)

    id: Mapped[UuidPk]
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    reward_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("rewards.id", ondelete="RESTRICT"))
    promo_code_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("promo_codes.id"), unique=True)
    point_transaction_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("point_transactions.id"), unique=True
    )
    # points | game_win
    source: Mapped[str] = mapped_column(String(20))
    source_ref: Mapped[str] = mapped_column(String(160))
    cost_points: Mapped[int] = mapped_column(Integer)
    expires_at: Mapped[datetime | None] = mapped_column(tz())
    created_at: Mapped[CreatedAt]
