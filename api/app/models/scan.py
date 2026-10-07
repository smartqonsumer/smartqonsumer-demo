"""Scan tracking, ported from smartqonsumer-poc-qr-scan-checker.

Three distinct notions, so that a new scan never implies a new reward:
- Visitor: an anonymous browser (random token kept client-side, only its hash is stored);
- Scan: a technical event, always recorded, carries the eligibility verdict;
- Participation: the business validation of a scan for a campaign. Its UNIQUE
  (campaign_id, eligibility_key) constraint is the final authority against double use,
  even under concurrent requests. The key is derived from the campaign scan policy.
"""

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base
from app.models._common import CreatedAt, UuidPk, tz

SCAN_STATUSES = ("accepted", "already_used", "campaign_inactive")


class Visitor(Base):
    __tablename__ = "visitors"

    id: Mapped[UuidPk]
    anon_token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    created_at: Mapped[CreatedAt]
    last_seen_at: Mapped[datetime] = mapped_column(tz())


class Scan(Base):
    __tablename__ = "scans"
    __table_args__ = (CheckConstraint(f"status IN {SCAN_STATUSES}", name="status"),)

    id: Mapped[UuidPk]
    gtin: Mapped[str] = mapped_column(String(14), index=True)
    serial: Mapped[str | None] = mapped_column(String(20))
    campaign_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("campaigns.id", ondelete="CASCADE"), index=True)
    visitor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("visitors.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"))
    source: Mapped[str] = mapped_column(String(30))
    destination: Mapped[str] = mapped_column(String(200))
    status: Mapped[str] = mapped_column(String(30))
    # Client-generated key: retrying the very same request returns the same scan.
    idempotency_key: Mapped[str | None] = mapped_column(String(80), unique=True)
    created_at: Mapped[CreatedAt]


class Participation(Base):
    __tablename__ = "participations"
    __table_args__ = (UniqueConstraint("campaign_id", "eligibility_key"),)

    id: Mapped[UuidPk]
    campaign_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("campaigns.id", ondelete="CASCADE"))
    eligibility_key: Mapped[str] = mapped_column(String(160))
    visitor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("visitors.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), index=True)
    scan_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("scans.id", ondelete="CASCADE"))
    created_at: Mapped[CreatedAt]
