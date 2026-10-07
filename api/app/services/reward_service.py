"""Rewards: catalogue, promo code reservation and redemption.

`redeem` debits the points, reserves a promo code (SELECT ... FOR UPDATE SKIP LOCKED, so
concurrent redemptions never get the same code) and records the RewardRedemption within
the caller's transaction. Any failure (out of stock...) raises before commit, so the
whole operation is rolled back: never points without reward, never reward without debit.
"""

import uuid
from datetime import timedelta

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.core.db import utcnow
from app.core.errors import AppError, NotFound
from app.models import Brand, PointTransaction, PromoCode, Reward, RewardRedemption, User
from app.services import analytics_service, loyalty_service


class OutOfStock(AppError):
    status_code = 409


def _available_codes_filter(reward_id: uuid.UUID):  # type: ignore[no-untyped-def]
    return (
        PromoCode.reward_id == reward_id,
        PromoCode.status == "available",
        or_(PromoCode.expires_at.is_(None), PromoCode.expires_at > utcnow()),
    )


def catalogue(db: Session, brand: Brand) -> list[tuple[Reward, int]]:
    rewards = db.scalars(
        select(Reward)
        .where(Reward.brand_id == brand.id, Reward.active.is_(True), Reward.redeemable.is_(True))
        .order_by(Reward.cost_points, Reward.sort_order)
    ).all()
    return [
        (r, db.scalar(select(func.count()).select_from(PromoCode).where(*_available_codes_filter(r.id))) or 0)
        for r in rewards
    ]


def grant(
    db: Session,
    *,
    user: User,
    reward: Reward,
    source: str,
    source_ref: str,
    point_transaction: PointTransaction | None = None,
) -> RewardRedemption:
    existing = db.scalar(
        select(RewardRedemption).where(
            RewardRedemption.source == source, RewardRedemption.source_ref == source_ref
        )
    )
    if existing is not None:
        return existing
    if reward.code_source != "pool":
        # Hook for a partner system providing codes on demand (not needed for the POC).
        raise AppError(
            "code_source_unavailable", "Cette récompense n'est pas disponible pour le moment.", 503
        )
    code = db.scalar(
        select(PromoCode)
        .where(*_available_codes_filter(reward.id))
        .order_by(PromoCode.created_at, PromoCode.code)
        .limit(1)
        .with_for_update(skip_locked=True)
    )
    if code is None:
        raise OutOfStock(
            "out_of_stock", "Cette récompense est victime de son succès : plus aucun code disponible."
        )
    now = utcnow()
    code.status = "assigned"
    code.assigned_at = now
    expires_at = code.expires_at
    if reward.valid_days:
        validity = now + timedelta(days=reward.valid_days)
        expires_at = min(expires_at, validity) if expires_at else validity
    redemption = RewardRedemption(
        user_id=user.id,
        reward_id=reward.id,
        promo_code_id=code.id,
        point_transaction_id=point_transaction.id if point_transaction else None,
        source=source,
        source_ref=source_ref,
        cost_points=-point_transaction.amount if point_transaction else 0,
        expires_at=expires_at,
    )
    db.add(redemption)
    db.flush()
    analytics_service.track(
        db, "promo_code_issued", brand_id=reward.brand_id, user_id=user.id, reward=reward.slug, source=source
    )
    return redemption


def redeem(db: Session, *, user: User, reward_id: uuid.UUID, idempotency_key: str | None) -> RewardRedemption:
    reward = db.get(Reward, reward_id)
    if reward is None or not reward.active or not reward.redeemable:
        raise NotFound("reward_not_found", "Cette récompense n'est pas disponible.")
    source_ref = f"{user.id}:{idempotency_key or uuid.uuid4()}"
    existing = db.scalar(
        select(RewardRedemption).where(
            RewardRedemption.source == "points", RewardRedemption.source_ref == source_ref
        )
    )
    if existing is not None:  # same request retried: same code, no second debit
        return existing
    tx = loyalty_service.debit(
        db,
        user_id=user.id,
        brand_id=reward.brand_id,
        amount=reward.cost_points,
        source_type="reward_redemption",
        source_id=source_ref,
        description=f"Échange : {reward.title}",
    )
    redemption = grant(
        db, user=user, reward=reward, source="points", source_ref=source_ref, point_transaction=tx
    )
    analytics_service.track(
        db,
        "reward_redeemed",
        brand_id=reward.brand_id,
        user_id=user.id,
        reward=reward.slug,
        cost=reward.cost_points,
    )
    return redemption


def my_rewards(db: Session, user: User) -> list[tuple[RewardRedemption, Reward, PromoCode]]:
    rows = db.execute(
        select(RewardRedemption, Reward, PromoCode)
        .join(Reward, RewardRedemption.reward_id == Reward.id)
        .join(PromoCode, RewardRedemption.promo_code_id == PromoCode.id)
        .where(RewardRedemption.user_id == user.id)
        .order_by(RewardRedemption.created_at.desc())
    ).all()
    return [(r[0], r[1], r[2]) for r in rows]
