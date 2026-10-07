from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.db import utcnow
from app.core.errors import NotFound
from app.models import Brand, Campaign, Gtin


def get_campaign(db: Session, slug: str) -> Campaign:
    campaign = db.scalar(select(Campaign).options(joinedload(Campaign.brand)).where(Campaign.slug == slug))
    if campaign is None:
        raise NotFound("campaign_not_found", "Cette opération n'existe pas.")
    return campaign


def get_brand(db: Session, slug: str) -> Brand:
    brand = db.scalar(select(Brand).where(Brand.slug == slug))
    if brand is None:
        raise NotFound("brand_not_found", "Cette marque n'existe pas.")
    return brand


def find_gtin(db: Session, gtin: str) -> Gtin | None:
    return db.scalar(
        select(Gtin)
        .options(joinedload(Gtin.campaign).joinedload(Campaign.brand))
        .where(Gtin.gtin == normalize_gtin(gtin))
    )


def is_running(campaign: Campaign, now: datetime | None = None) -> bool:
    now = now or utcnow()
    if not campaign.active:
        return False
    if campaign.start_at is not None and now < campaign.start_at:
        return False
    return campaign.end_at is None or now <= campaign.end_at


def normalize_gtin(value: str) -> str:
    """GTIN-8/12/13/14 → 14 digits, as in a GS1 Digital Link /01/ path."""
    return value.strip().zfill(14)


def gtin_check_digit_is_valid(gtin14: str) -> bool:
    if len(gtin14) != 14 or not gtin14.isdigit():
        return False
    digits = [int(c) for c in gtin14]
    total = sum(d * (3 if i % 2 == 0 else 1) for i, d in enumerate(digits[:13]))
    return (10 - total % 10) % 10 == digits[13]
