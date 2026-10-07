import uuid
from datetime import date, datetime

from sqlalchemy import Boolean, CheckConstraint, Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base
from app.models._common import CreatedAt, UuidPk, tz

USER_STATUSES = ("pending_email_verification", "active", "deleted")
TOKEN_PURPOSES = ("verify_email", "reset_password")


class User(Base):
    __tablename__ = "users"
    __table_args__ = (CheckConstraint(f"status IN {USER_STATUSES}", name="status"),)

    id: Mapped[UuidPk]
    # Always stored lower-cased (normalised in the service layer); NULL once anonymised.
    email: Mapped[str | None] = mapped_column(String(254), unique=True)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    status: Mapped[str] = mapped_column(String(40), default="pending_email_verification")
    email_verified_at: Mapped[datetime | None] = mapped_column(tz())
    last_login_at: Mapped[datetime | None] = mapped_column(tz())
    deleted_at: Mapped[datetime | None] = mapped_column(tz())
    created_at: Mapped[CreatedAt]

    profile: Mapped["UserProfile"] = relationship(back_populates="user", uselist=False)
    pets: Mapped[list["Pet"]] = relationship(back_populates="user", order_by="Pet.created_at")

    @property
    def email_verified(self) -> bool:
        return self.email_verified_at is not None


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    first_name: Mapped[str | None] = mapped_column(String(80))
    last_name: Mapped[str | None] = mapped_column(String(80))
    birth_date: Mapped[date | None] = mapped_column(Date)
    city: Mapped[str | None] = mapped_column(String(120))
    has_dog: Mapped[bool | None] = mapped_column(Boolean)
    dog_count: Mapped[int | None] = mapped_column(Integer)

    user: Mapped[User] = relationship(back_populates="profile")


class Pet(Base):
    __tablename__ = "pets"

    id: Mapped[UuidPk]
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    species: Mapped[str] = mapped_column(String(20), default="dog")
    name: Mapped[str | None] = mapped_column(String(80))
    age_years: Mapped[int | None] = mapped_column(Integer)
    size: Mapped[str | None] = mapped_column(String(20))
    breed: Mapped[str | None] = mapped_column(String(80))
    food_preferences: Mapped[str | None] = mapped_column(String(300))
    created_at: Mapped[CreatedAt]

    user: Mapped[User] = relationship(back_populates="pets")


class Consent(Base):
    """Append-only consent log. A withdrawal sets `withdrawn_at`; a new grant adds a row,
    so the history of what was accepted (and in which wording) is never lost."""

    __tablename__ = "consents"

    id: Mapped[UuidPk]
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    campaign_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("campaigns.id", ondelete="SET NULL"))
    type: Mapped[str] = mapped_column(String(40))
    text_version: Mapped[str] = mapped_column(String(40))
    granted: Mapped[bool] = mapped_column(Boolean)
    source: Mapped[str] = mapped_column(String(40))
    created_at: Mapped[CreatedAt]
    withdrawn_at: Mapped[datetime | None] = mapped_column(tz())


class AuthToken(Base):
    """Single-use, short-lived token (email verification, password reset). Only the SHA-256
    of the random token is stored: a database leak does not expose usable links."""

    __tablename__ = "auth_tokens"
    __table_args__ = (CheckConstraint(f"purpose IN {TOKEN_PURPOSES}", name="purpose"),)

    id: Mapped[UuidPk]
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    purpose: Mapped[str] = mapped_column(String(30))
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(tz())
    used_at: Mapped[datetime | None] = mapped_column(tz())
    created_at: Mapped[CreatedAt]


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[UuidPk]
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True)
    expires_at: Mapped[datetime] = mapped_column(tz())
    revoked_at: Mapped[datetime | None] = mapped_column(tz())
    created_at: Mapped[CreatedAt]
