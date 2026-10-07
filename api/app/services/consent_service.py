"""Consent records. Definitions (type, wording, version, required) come from the campaign
configuration; every decision is stored with the version of the text that was shown.
This provides the technical mechanisms; the legal wording itself must be validated by
the brand's counsel."""

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.db import utcnow
from app.core.errors import AppError, NotFound
from app.models import Campaign, Consent


def definitions(campaign: Campaign) -> list[dict[str, Any]]:
    return list((campaign.config or {}).get("consents", []))


def record_registration_consents(
    db: Session, user_id: uuid.UUID, campaign: Campaign, decisions: dict[str, bool], source: str
) -> None:
    known = {d["type"]: d for d in definitions(campaign)}
    unknown = set(decisions) - set(known)
    if unknown:
        raise AppError("unknown_consent", "Consentement inconnu.")
    for definition in known.values():
        granted = bool(decisions.get(definition["type"], False))
        if definition.get("required") and not granted:
            raise AppError(
                "consent_required",
                "Vous devez accepter le règlement et le traitement de vos données pour participer.",
                status_code=422,
            )
        db.add(
            Consent(
                user_id=user_id,
                campaign_id=campaign.id,
                type=definition["type"],
                text_version=definition["version"],
                granted=granted,
                source=source,
            )
        )


def current(db: Session, user_id: uuid.UUID) -> list[Consent]:
    """Latest decision per consent type."""
    rows = db.scalars(select(Consent).where(Consent.user_id == user_id).order_by(Consent.created_at.desc()))
    latest: dict[str, Consent] = {}
    for row in rows:
        latest.setdefault(row.type, row)
    return list(latest.values())


def withdraw(db: Session, user_id: uuid.UUID, consent_type: str) -> Consent:
    row = next((c for c in current(db, user_id) if c.type == consent_type), None)
    if row is None:
        raise NotFound("consent_not_found", "Consentement introuvable.")
    if consent_type == "participation_terms":
        raise AppError(
            "consent_not_withdrawable",
            "Ce consentement est nécessaire au compte. Pour le retirer, supprimez votre compte.",
        )
    if row.granted and row.withdrawn_at is None:
        row.withdrawn_at = utcnow()
    return row


def grant(db: Session, user_id: uuid.UUID, consent_type: str, campaign: Campaign | None) -> Consent:
    definition = (
        next((d for d in definitions(campaign) if d["type"] == consent_type), None) if campaign else None
    )
    if definition is None:
        raise NotFound("consent_not_found", "Consentement introuvable.")
    consent = Consent(
        user_id=user_id,
        campaign_id=campaign.id if campaign else None,
        type=consent_type,
        text_version=definition["version"],
        granted=True,
        source="account_settings",
    )
    db.add(consent)
    return consent
