"""Accounts, sessions and one-time tokens.

- Passwords: Argon2id (app.core.security), never stored nor logged in clear.
- Sessions: random opaque token in an HttpOnly cookie, only its keyed hash in DB, so
  logout / password reset revoke them immediately (unlike a stateless JWT).
- Email verification / password reset: random single-use tokens with an expiry; only
  their keyed hash is stored.
"""

import uuid
from dataclasses import dataclass
from datetime import timedelta

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import utcnow
from app.core.errors import AppError, Conflict, Unauthorized
from app.core.security import hash_password, hash_token, new_token, verify_password
from app.models import AuthToken, Campaign, User, UserProfile, UserSession
from app.services import analytics_service, consent_service, loyalty_service, visitor_service


def normalize_email(email: str) -> str:
    return email.strip().lower()


# --------------------------------------------------------------------------- sessions


def create_session(db: Session, user: User) -> str:
    token = new_token()
    db.add(
        UserSession(
            user_id=user.id,
            token_hash=hash_token(token),
            expires_at=utcnow() + timedelta(hours=get_settings().session_ttl_hours),
        )
    )
    return token


def user_from_session_token(db: Session, token: str) -> User | None:
    row = db.scalar(select(UserSession).where(UserSession.token_hash == hash_token(token)))
    if row is None or row.revoked_at is not None or row.expires_at <= utcnow():
        return None
    user = db.get(User, row.user_id)
    if user is None or user.status == "deleted":
        return None
    return user


def revoke_session(db: Session, token: str) -> None:
    row = db.scalar(select(UserSession).where(UserSession.token_hash == hash_token(token)))
    if row is not None and row.revoked_at is None:
        row.revoked_at = utcnow()


def revoke_all_sessions(db: Session, user_id: uuid.UUID) -> None:
    db.execute(
        update(UserSession)
        .where(UserSession.user_id == user_id, UserSession.revoked_at.is_(None))
        .values(revoked_at=utcnow())
    )


# --------------------------------------------------------------------------- one-time tokens


def issue_token(db: Session, user: User, purpose: str) -> str:
    settings = get_settings()
    ttl = (
        timedelta(hours=settings.email_verification_ttl_hours)
        if purpose == "verify_email"
        else timedelta(minutes=settings.password_reset_ttl_minutes)
    )
    # A new link invalidates the previous unused ones of the same purpose.
    db.execute(
        update(AuthToken)
        .where(AuthToken.user_id == user.id, AuthToken.purpose == purpose, AuthToken.used_at.is_(None))
        .values(used_at=utcnow())
    )
    token = new_token()
    db.add(
        AuthToken(user_id=user.id, purpose=purpose, token_hash=hash_token(token), expires_at=utcnow() + ttl)
    )
    return token


def consume_token(db: Session, token: str, purpose: str) -> User:
    """Atomically mark the token used (UPDATE ... WHERE used_at IS NULL): a link clicked
    twice at the same time is only accepted once."""
    now = utcnow()
    user_id = db.execute(
        update(AuthToken)
        .where(
            AuthToken.token_hash == hash_token(token),
            AuthToken.purpose == purpose,
            AuthToken.used_at.is_(None),
            AuthToken.expires_at > now,
        )
        .values(used_at=now)
        .returning(AuthToken.user_id)
    ).scalar()
    if user_id is None:
        raise AppError(
            "invalid_or_expired_token",
            "Ce lien n'est plus valide. Il a peut-être expiré ou déjà été utilisé.",
        )
    user = db.get(User, user_id)
    if user is None or user.status == "deleted":
        raise AppError("invalid_or_expired_token", "Ce lien n'est plus valide.")
    return user


# --------------------------------------------------------------------------- registration


@dataclass
class Registration:
    user: User
    campaign: Campaign
    verification_token: str
    points_awarded: int
    session_token: str | None


def register(
    db: Session,
    *,
    campaign: Campaign,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    consents: dict[str, bool],
    anon_token: str | None = None,
) -> Registration:
    email = normalize_email(email)
    if db.scalar(select(User.id).where(User.email == email)) is not None:
        raise Conflict("email_taken", "Un compte existe déjà avec cette adresse email. Connectez-vous.")

    user = User(
        email=email,
        password_hash=hash_password(password),
        status="pending_email_verification",
        registration_campaign_id=campaign.id,
    )
    db.add(user)
    try:
        db.flush()
    except IntegrityError as exc:  # concurrent registration with the same email
        db.rollback()
        raise Conflict(
            "email_taken", "Un compte existe déjà avec cette adresse email. Connectez-vous."
        ) from exc
    db.add(UserProfile(user_id=user.id, first_name=first_name, last_name=last_name))
    consent_service.record_registration_consents(
        db, user.id, campaign, consents, source=f"register:{campaign.slug}"
    )
    loyalty_service.get_or_create_account(db, user.id, campaign.brand_id)

    visitor = visitor_service.find_visitor(db, anon_token)
    if visitor is not None:
        visitor_service.attach_anonymous_history_to_user(db, visitor, user.id)

    points = 0
    if campaign.registration_points_on == "registration":
        points = _credit_registration_points(db, user, campaign)

    token = issue_token(db, user, "verify_email")
    # Journeys where the member lands in the club right away (the gamified one) open a
    # session immediately; the others wait for the email confirmation.
    session_token = create_session(db, user) if campaign.config.get("session_on_registration") else None
    analytics_service.track(
        db,
        "registration_completed",
        brand_id=campaign.brand_id,
        campaign_id=campaign.id,
        visitor_id=visitor.id if visitor else None,
        user_id=user.id,
        marketing_opt_in=bool(consents.get("marketing_brand")),
    )
    return Registration(user, campaign, token, points, session_token)


def _credit_registration_points(db: Session, user: User, campaign: Campaign) -> int:
    tx = loyalty_service.credit(
        db,
        user_id=user.id,
        brand_id=campaign.brand_id,
        amount=campaign.registration_points,
        source_type="registration",
        source_id=str(user.id),
        description="Bienvenue au club",
    )
    if tx is None:
        return 0
    analytics_service.track(
        db,
        "points_earned",
        brand_id=campaign.brand_id,
        campaign_id=campaign.id,
        user_id=user.id,
        points=tx.amount,
    )
    return tx.amount


def verify_email(db: Session, token: str) -> tuple[User, int, Campaign | None]:
    user = consume_token(db, token, "verify_email")
    campaign = db.get(Campaign, user.registration_campaign_id) if user.registration_campaign_id else None
    return user, _mark_email_verified(db, user, campaign), campaign


def _mark_email_verified(db: Session, user: User, campaign: Campaign | None) -> int:
    """Activate the account once; returns the registration points credited at that moment."""
    if user.email_verified_at is not None:
        return 0
    user.email_verified_at = utcnow()
    user.status = "active"
    points = 0
    if campaign is not None and campaign.registration_points_on == "email_verified":
        # Points only once the email is proven: discourages throw-away accounts.
        points = _credit_registration_points(db, user, campaign)
    analytics_service.track(
        db,
        "email_verified",
        brand_id=campaign.brand_id if campaign else None,
        campaign_id=campaign.id if campaign else None,
        user_id=user.id,
    )
    return points


# --------------------------------------------------------------------------- login / password


def authenticate(db: Session, email: str, password: str) -> User:
    user = db.scalar(select(User).where(User.email == normalize_email(email)))
    # verify_password runs even for unknown emails (same timing, no enumeration).
    if not verify_password(password, user.password_hash if user else None) or user is None:
        raise Unauthorized("invalid_credentials", "Email ou mot de passe incorrect.")
    if user.status == "deleted":
        raise Unauthorized("invalid_credentials", "Email ou mot de passe incorrect.")
    if user.email_verified_at is None:
        raise AppError(
            "email_not_verified",
            "Confirmez d'abord votre adresse email grâce au lien que nous vous avons envoyé.",
            status_code=403,
        )
    user.last_login_at = utcnow()
    return user


def request_password_reset(db: Session, email: str) -> tuple[User, str] | None:
    user = db.scalar(select(User).where(User.email == normalize_email(email), User.status != "deleted"))
    if user is None:
        return None
    return user, issue_token(db, user, "reset_password")


def reset_password(db: Session, token: str, new_password: str) -> User:
    user = consume_token(db, token, "reset_password")
    user.password_hash = hash_password(new_password)
    # The reset link proves control of the address.
    campaign = db.get(Campaign, user.registration_campaign_id) if user.registration_campaign_id else None
    _mark_email_verified(db, user, campaign)
    revoke_all_sessions(db, user.id)
    return user
