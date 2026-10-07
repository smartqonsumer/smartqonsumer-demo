import uuid
from datetime import datetime

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models._common import CreatedAt, Json, UuidPk, tz

SCAN_POLICIES = ("single_use", "once_per_user", "once_per_day", "once_per_campaign", "unlimited")
JOURNEYS = ("gamified", "simple")


class Brand(Base):
    """A brand using the SmartQonsumer engine. `theme` is consumed by the frontend design
    system; `config` holds brand-level settings (legal URLs, sender name...)."""

    __tablename__ = "brands"

    id: Mapped[UuidPk]
    slug: Mapped[str] = mapped_column(String(64), unique=True)
    name: Mapped[str] = mapped_column(String(120))
    logo_url: Mapped[str | None] = mapped_column(String(500))
    theme: Mapped[Json]
    config: Mapped[Json]
    created_at: Mapped[CreatedAt]

    campaigns: Mapped[list["Campaign"]] = relationship(back_populates="brand")


class Campaign(Base):
    """An acquisition operation. Every business rule a marketer may want to tune lives here
    (or in the related Game / Reward / EarningRule rows), never in the UI code."""

    __tablename__ = "campaigns"
    __table_args__ = (
        CheckConstraint(f"scan_policy IN {SCAN_POLICIES}", name="scan_policy"),
        CheckConstraint(f"journey IN {JOURNEYS}", name="journey"),
        CheckConstraint("registration_points >= 0", name="registration_points_positive"),
        CheckConstraint(
            "registration_points_on IN ('registration', 'email_verified')", name="registration_points_on"
        ),
    )

    id: Mapped[UuidPk]
    brand_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("brands.id", ondelete="RESTRICT"), index=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True)
    name: Mapped[str] = mapped_column(String(160))
    journey: Mapped[str] = mapped_column(String(20))
    destination_path: Mapped[str] = mapped_column(String(200))
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    start_at: Mapped[datetime | None] = mapped_column(tz())
    end_at: Mapped[datetime | None] = mapped_column(tz())
    scan_policy: Mapped[str] = mapped_column(String(30), default="once_per_user")
    registration_points: Mapped[int] = mapped_column(Integer, default=0)
    registration_points_on: Mapped[str] = mapped_column(String(20), default="email_verified")
    # Reward granted (for free) to whoever wins the campaign's welcome game and registers.
    welcome_reward_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("rewards.id", ondelete="SET NULL"))
    # Texts, consent wording/versions and other presentation settings.
    config: Mapped[Json]
    created_at: Mapped[CreatedAt]

    brand: Mapped[Brand] = relationship(back_populates="campaigns")
    gtins: Mapped[list["Gtin"]] = relationship(back_populates="campaign")


class Gtin(Base):
    """GTIN → campaign mapping on the SmartQonsumer side. The resolver holds its own
    GTIN → URL mapping; the two only share the GTIN value."""

    __tablename__ = "gtins"

    id: Mapped[UuidPk]
    gtin: Mapped[str] = mapped_column(String(14), unique=True)
    brand_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("brands.id", ondelete="RESTRICT"))
    campaign_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("campaigns.id", ondelete="RESTRICT"), index=True
    )
    label: Mapped[str] = mapped_column(String(200))
    created_at: Mapped[CreatedAt]

    campaign: Mapped[Campaign] = relationship(back_populates="gtins")
