"""GDPR mechanisms: access (export), rectification (profile), erasure (anonymisation),
consent withdrawal (consent_service) and retention (purge of stale anonymous data).

These are technical means; the applicable retention periods and the exact scope of
erasure must come from a legally validated policy (configurable here).
"""

from datetime import timedelta
from typing import Any

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import utcnow
from app.models import (
    Consent,
    Event,
    GameSession,
    LoyaltyAccount,
    Pet,
    PointTransaction,
    PromoCode,
    Reward,
    RewardRedemption,
    Scan,
    User,
    Visitor,
)
from app.services import analytics_service, auth_service


def _iso(value: Any) -> Any:
    return value.isoformat() if hasattr(value, "isoformat") else value


def export(db: Session, user: User) -> dict[str, Any]:
    profile = user.profile
    accounts = db.scalars(select(LoyaltyAccount).where(LoyaltyAccount.user_id == user.id)).all()
    return {
        "account": {
            "email": user.email,
            "status": user.status,
            "created_at": _iso(user.created_at),
            "email_verified_at": _iso(user.email_verified_at),
            "last_login_at": _iso(user.last_login_at),
        },
        "profile": {
            "first_name": profile.first_name if profile else None,
            "last_name": profile.last_name if profile else None,
            "birth_date": _iso(profile.birth_date) if profile else None,
            "city": profile.city if profile else None,
            "has_dog": profile.has_dog if profile else None,
            "dog_count": profile.dog_count if profile else None,
        },
        "pets": [
            {
                "name": p.name,
                "species": p.species,
                "age_years": p.age_years,
                "size": p.size,
                "breed": p.breed,
                "food_preferences": p.food_preferences,
            }
            for p in user.pets
        ],
        "consents": [
            {
                "type": c.type,
                "version": c.text_version,
                "granted": c.granted,
                "date": _iso(c.created_at),
                "withdrawn_at": _iso(c.withdrawn_at),
                "source": c.source,
            }
            for c in db.scalars(
                select(Consent).where(Consent.user_id == user.id).order_by(Consent.created_at)
            )
        ],
        "points": [
            {"amount": t.amount, "description": t.description, "date": _iso(t.created_at)}
            for a in accounts
            for t in db.scalars(
                select(PointTransaction)
                .where(PointTransaction.account_id == a.id)
                .order_by(PointTransaction.created_at)
            )
        ],
        "rewards": [
            {
                "reward": r.title,
                "code": c.code,
                "date": _iso(rr.created_at),
                "expires_at": _iso(rr.expires_at),
            }
            for rr, r, c in db.execute(
                select(RewardRedemption, Reward, PromoCode)
                .join(Reward, RewardRedemption.reward_id == Reward.id)
                .join(PromoCode, RewardRedemption.promo_code_id == PromoCode.id)
                .where(RewardRedemption.user_id == user.id)
            ).all()
        ],
        "scans": [
            {"gtin": s.gtin, "date": _iso(s.created_at), "status": s.status}
            for s in db.scalars(select(Scan).where(Scan.user_id == user.id).order_by(Scan.created_at))
        ],
        "games": [
            {"won": g.won, "points": g.points_awarded, "date": _iso(g.created_at)}
            for g in db.scalars(select(GameSession).where(GameSession.user_id == user.id))
        ],
    }


def anonymise(db: Session, user: User) -> None:
    """Erase personal data, keep non-identifying business records (ledger, redemptions,
    scans) so that accounting and statistics stay consistent."""
    user.email = None
    user.password_hash = None
    user.status = "deleted"
    user.deleted_at = utcnow()
    if user.profile is not None:
        db.delete(user.profile)
    db.execute(delete(Pet).where(Pet.user_id == user.id))
    auth_service.revoke_all_sessions(db, user.id)
    for consent in db.scalars(
        select(Consent).where(Consent.user_id == user.id, Consent.withdrawn_at.is_(None))
    ):
        consent.withdrawn_at = utcnow()
    for visitor in db.scalars(select(Visitor).where(Visitor.user_id == user.id)):
        visitor.user_id = None
    analytics_service.track(db, "account_deleted", user_id=user.id)


def purge_stale_anonymous_data(db: Session) -> int:
    """Delete anonymous visitors (and their scans, by cascade) never linked to an account
    and unseen for ANONYMOUS_DATA_RETENTION_DAYS."""
    limit = utcnow() - timedelta(days=get_settings().anonymous_data_retention_days)
    ids = list(db.scalars(select(Visitor.id).where(Visitor.user_id.is_(None), Visitor.last_seen_at < limit)))
    if ids:
        db.execute(delete(Event).where(Event.visitor_id.in_(ids), Event.user_id.is_(None)))
        db.execute(delete(Visitor).where(Visitor.id.in_(ids)))
    db.commit()
    return len(ids)
