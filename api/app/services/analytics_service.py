"""Provider-agnostic business events (funnel: scan → game → registration → reward).

Events are added to the caller's DB session, so they are committed atomically with the
business change they describe. A different provider (PostHog, a warehouse...) can be
plugged in later by forwarding from here; nothing else depends on the provider.
"""

import uuid
from typing import Any

from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Event

EVENT_NAMES = frozenset(
    {
        "qr_scanned",
        "scan_rejected",
        "campaign_started",
        "game_started",
        "game_completed",
        "game_won",
        "registration_started",
        "registration_completed",
        "email_verified",
        "login",
        "profile_completed",
        "profile_updated",
        "points_earned",
        "reward_redeemed",
        "promo_code_issued",
        "consent_withdrawn",
        "account_deleted",
    }
)


def track(
    db: Session,
    name: str,
    *,
    brand_id: uuid.UUID | None = None,
    campaign_id: uuid.UUID | None = None,
    visitor_id: uuid.UUID | None = None,
    user_id: uuid.UUID | None = None,
    **properties: Any,
) -> None:
    if name not in EVENT_NAMES:
        raise ValueError(f"Unknown analytics event: {name}")
    if get_settings().analytics_provider == "none":
        return
    db.add(
        Event(
            name=name,
            brand_id=brand_id,
            campaign_id=campaign_id,
            visitor_id=visitor_id,
            user_id=user_id,
            properties={k: v for k, v in properties.items() if v is not None},
        )
    )
