"""Scan recording and double-scan control.

Every scan is stored. Whether it validates a *participation* depends on the campaign's
scan_policy, expressed as an eligibility key. The participation insert relies on
`ON CONFLICT (campaign_id, eligibility_key) DO NOTHING`: the database decides, so two
simultaneous scans can never both validate.
"""

import uuid
from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.db import utcnow
from app.core.errors import AppError, NotFound
from app.models import Campaign, Participation, Scan, User, Visitor
from app.services import analytics_service, campaign_service, visitor_service

MESSAGES = {
    "accepted": "Scan validé.",
    "already_used": "Ce QR Code a déjà été utilisé pour cette opération.",
    "campaign_inactive": "Cette opération n'est pas active pour le moment.",
}


@dataclass
class ScanResult:
    scan: Scan
    campaign: Campaign
    participation: Participation | None

    @property
    def eligible(self) -> bool:
        return self.scan.status == "accepted"

    @property
    def message(self) -> str:
        return MESSAGES[self.scan.status]


def eligibility_key(
    campaign: Campaign, *, gtin: str, serial: str | None, player: str, scan_id: uuid.UUID
) -> str:
    policy = campaign.scan_policy
    if policy == "unlimited":
        return f"scan:{scan_id}"
    if policy == "single_use" and serial:
        return f"code:{gtin}:{serial}"
    if policy == "once_per_campaign":
        return player
    if policy == "once_per_day":
        return f"{player}:day:{utcnow().date().isoformat()}"
    # once_per_user, and single_use on a non-serialised QR (cannot be more precise)
    return f"{player}:gtin:{gtin}"


def record_scan(
    db: Session,
    *,
    gtin: str,
    anon_token: str,
    serial: str | None = None,
    campaign_slug: str | None = None,
    source: str = "gs1_resolver",
    idempotency_key: str | None = None,
    user: User | None = None,
) -> ScanResult:
    gtin14 = campaign_service.normalize_gtin(gtin)
    if not campaign_service.gtin_check_digit_is_valid(gtin14):
        raise AppError("invalid_gtin", "Ce code produit n'est pas valide.")
    mapping = campaign_service.find_gtin(db, gtin14)
    if mapping is None:
        raise NotFound("unknown_gtin", "Ce produit ne participe à aucune opération.")
    campaign = mapping.campaign
    if campaign_slug is not None and campaign_slug != campaign.slug:
        raise AppError("gtin_campaign_mismatch", "Ce produit ne correspond pas à cette opération.")

    visitor = visitor_service.get_or_create_visitor(db, anon_token)

    if idempotency_key:
        existing = db.scalar(select(Scan).where(Scan.idempotency_key == idempotency_key))
        if existing is not None:
            if existing.visitor_id != visitor.id:
                raise AppError("idempotency_conflict", "Requête déjà utilisée.", status_code=409)
            return _result_for(db, existing, campaign)

    scan_id = uuid.uuid4()
    running = campaign_service.is_running(campaign)
    scan = Scan(
        id=scan_id,
        gtin=gtin14,
        serial=serial,
        campaign_id=campaign.id,
        visitor_id=visitor.id,
        user_id=user.id if user else visitor.user_id,
        source=source,
        destination=campaign.destination_path,
        status="campaign_inactive" if not running else "accepted",
        idempotency_key=idempotency_key,
    )
    try:
        # Savepoint: a concurrent retry with the same idempotency key loses the race on
        # the UNIQUE constraint and gets the winner's scan back instead of an error.
        with db.begin_nested():
            db.add(scan)
    except IntegrityError:
        existing = db.scalar(select(Scan).where(Scan.idempotency_key == idempotency_key))
        if existing is None:
            raise
        db.commit()
        return _result_for(db, existing, campaign)

    participation = None
    if running:
        participation = _claim_participation(db, campaign, scan, visitor, user, serial)
        if participation is None:
            scan.status = "already_used"

    analytics_service.track(
        db,
        "qr_scanned" if scan.status == "accepted" else "scan_rejected",
        brand_id=campaign.brand_id,
        campaign_id=campaign.id,
        visitor_id=visitor.id,
        user_id=scan.user_id,
        gtin=gtin14,
        status=scan.status,
        source=source,
    )
    db.commit()
    return ScanResult(scan=scan, campaign=campaign, participation=participation)


def _claim_participation(
    db: Session, campaign: Campaign, scan: Scan, visitor: Visitor, user: User | None, serial: str | None
) -> Participation | None:
    owner_id = user.id if user else visitor.user_id
    player = f"user:{owner_id}" if owner_id else f"visitor:{visitor.id}"
    key = eligibility_key(campaign, gtin=scan.gtin, serial=serial, player=player, scan_id=scan.id)
    participation_id = db.execute(
        insert(Participation)
        .values(
            id=uuid.uuid4(),
            campaign_id=campaign.id,
            eligibility_key=key,
            visitor_id=visitor.id,
            user_id=owner_id,
            scan_id=scan.id,
        )
        .on_conflict_do_nothing(index_elements=[Participation.campaign_id, Participation.eligibility_key])
        .returning(Participation.id)
    ).scalar()
    return db.get(Participation, participation_id) if participation_id else None


def _result_for(db: Session, scan: Scan, campaign: Campaign) -> ScanResult:
    participation = db.scalar(select(Participation).where(Participation.scan_id == scan.id))
    return ScanResult(scan=scan, campaign=campaign, participation=participation)


def get_visitor_scan(db: Session, scan_id: uuid.UUID, visitor: Visitor) -> Scan:
    scan = db.get(Scan, scan_id)
    if scan is None or scan.visitor_id != visitor.id:
        raise NotFound("scan_not_found", "Scan introuvable. Scannez à nouveau le QR Code.")
    return scan
