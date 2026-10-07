from fastapi import APIRouter, BackgroundTasks, Request, Response

from app.api.deps import AnonToken, DbSession, client_key
from app.core.config import get_settings
from app.core.rate_limit import limiter
from app.models import Campaign, User
from app.schemas.auth import (
    ForgotPasswordRequest,
    LoginRequest,
    RegistrationResponse,
    ResendVerificationRequest,
    ResetPasswordRequest,
    TokenRequest,
    UserCreate,
    UserPublic,
    VerifyEmailResponse,
)
from app.schemas.common import Message
from app.services import analytics_service, auth_service, campaign_service, game_service
from app.services.email_service import EmailService

router = APIRouter(prefix="/auth", tags=["auth"])

CLUB_PATH = "/club/"
GENERIC_EMAIL_SENT = "Si un compte correspond à cette adresse, un email vient de vous être envoyé."


def user_public(user: User) -> UserPublic:
    profile = user.profile
    return UserPublic(
        id=user.id,
        email=user.email or "",
        status=user.status,
        email_verified=user.email_verified,
        first_name=profile.first_name if profile else None,
        last_name=profile.last_name if profile else None,
    )


def set_session_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        settings.session_cookie_name,
        token,
        max_age=settings.session_ttl_hours * 3600,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        domain=settings.session_cookie_domain or None,
        path="/",
    )


def clear_session_cookie(response: Response) -> None:
    settings = get_settings()
    response.delete_cookie(
        settings.session_cookie_name, domain=settings.session_cookie_domain or None, path="/"
    )


def _registration_campaign(db: DbSession, user: User) -> Campaign | None:
    return db.get(Campaign, user.registration_campaign_id) if user.registration_campaign_id else None


def _mailer(campaign: Campaign | None) -> EmailService:
    """Emails are signed with the brand the member signed up with."""
    return EmailService(campaign.brand.name if campaign else "SmartQonsumer")


def _sensitive(request: Request, action: str) -> None:
    limiter.hit(f"{action}:{client_key(request)}", get_settings().rate_limit_sensitive_per_hour, 3600)


@router.post("/register", response_model=RegistrationResponse, status_code=201)
def register(
    body: UserCreate,
    request: Request,
    response: Response,
    db: DbSession,
    background: BackgroundTasks,
    anon_token: AnonToken = None,
) -> RegistrationResponse:
    _sensitive(request, "register")
    campaign = campaign_service.get_campaign(db, body.campaign_slug)
    registration = auth_service.register(
        db,
        campaign=campaign,
        email=body.email,
        password=body.password,
        first_name=body.first_name,
        last_name=body.last_name,
        consents=body.consents,
        anon_token=anon_token,
    )
    claim = None
    if body.game_session_id is not None:
        claim = game_service.claim_welcome_win(
            db, game_session_id=body.game_session_id, user=registration.user, anon_token=anon_token
        )
    db.commit()

    email = registration.user.email or ""
    mailer = EmailService(campaign.brand.name)
    background.add_task(
        mailer.verify_email, email, body.first_name, registration.verification_token, campaign.slug
    )
    if claim is not None and claim.reward_title:
        background.add_task(mailer.reward_confirmation, email, claim.reward_title)
    if registration.session_token:
        set_session_cookie(response, registration.session_token)

    db.refresh(registration.user)
    return RegistrationResponse(
        user=user_public(registration.user),
        logged_in=registration.session_token is not None,
        email_verification_required=True,
        points_awarded=registration.points_awarded + (claim.points if claim else 0),
        reward_title=claim.reward_title if claim else None,
        destination_path=CLUB_PATH if registration.session_token else campaign.destination_path,
    )


@router.post("/verify-email", response_model=VerifyEmailResponse)
def verify_email(body: TokenRequest, response: Response, db: DbSession) -> VerifyEmailResponse:
    user, points, _campaign = auth_service.verify_email(db, body.token)
    # The link proved control of the mailbox: open the session ("Accéder à mon espace").
    token = auth_service.create_session(db, user)
    db.commit()
    set_session_cookie(response, token)
    return VerifyEmailResponse(user=user_public(user), points_awarded=points, destination_path=CLUB_PATH)


@router.post("/resend-verification", response_model=Message)
def resend_verification(
    body: ResendVerificationRequest, request: Request, db: DbSession, background: BackgroundTasks
) -> Message:
    _sensitive(request, "resend")
    user = db.query(User).filter(User.email == auth_service.normalize_email(body.email)).one_or_none()
    if user is not None and user.email_verified_at is None and user.status != "deleted":
        token = auth_service.issue_token(db, user, "verify_email")
        db.commit()
        campaign = _registration_campaign(db, user)
        background.add_task(
            _mailer(campaign).verify_email,
            user.email or "",
            user.profile.first_name if user.profile else None,
            token,
            campaign.slug if campaign else None,
        )
    return Message(message=GENERIC_EMAIL_SENT)


@router.post("/login", response_model=UserPublic)
def login(body: LoginRequest, request: Request, response: Response, db: DbSession) -> UserPublic:
    settings = get_settings()
    # Two keys: per client (spraying) and per account (targeted brute force).
    limiter.hit(f"login-ip:{client_key(request)}", settings.rate_limit_login_per_15min * 3, 900)
    limiter.hit(
        f"login-email:{auth_service.normalize_email(body.email)}", settings.rate_limit_login_per_15min, 900
    )
    user = auth_service.authenticate(db, body.email, body.password)
    token = auth_service.create_session(db, user)
    analytics_service.track(db, "login", user_id=user.id)
    db.commit()
    set_session_cookie(response, token)
    return user_public(user)


@router.post("/logout", response_model=Message)
def logout(request: Request, response: Response, db: DbSession) -> Message:
    token = request.cookies.get(get_settings().session_cookie_name)
    if token:
        auth_service.revoke_session(db, token)
        db.commit()
    clear_session_cookie(response)
    return Message(message="Vous êtes déconnecté.")


@router.post("/forgot-password", response_model=Message)
def forgot_password(
    body: ForgotPasswordRequest, request: Request, db: DbSession, background: BackgroundTasks
) -> Message:
    _sensitive(request, "forgot")
    result = auth_service.request_password_reset(db, body.email)
    if result is not None:
        user, token = result
        db.commit()
        background.add_task(_mailer(_registration_campaign(db, user)).reset_password, user.email or "", token)
    # Same answer whether the account exists or not (no user enumeration).
    return Message(message=GENERIC_EMAIL_SENT)


@router.post("/reset-password", response_model=Message)
def reset_password(
    body: ResetPasswordRequest, request: Request, response: Response, db: DbSession
) -> Message:
    _sensitive(request, "reset")
    auth_service.reset_password(db, body.token, body.password)
    db.commit()
    clear_session_cookie(response)
    return Message(message="Votre mot de passe a été modifié. Vous pouvez vous connecter.")
