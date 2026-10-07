import uuid

from pydantic import EmailStr, Field

from app.schemas.common import ApiModel, RequestModel

Password = Field(min_length=10, max_length=128)
Name = Field(min_length=1, max_length=80)


class UserCreate(RequestModel):
    campaign_slug: str = Field(max_length=80)
    first_name: str = Name
    last_name: str = Name
    email: EmailStr
    password: str = Password
    consents: dict[str, bool] = Field(default_factory=dict)
    # Anonymous game won just before the form (gamified journey), claimed by this account.
    game_session_id: uuid.UUID | None = None


class LoginRequest(RequestModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class TokenRequest(RequestModel):
    token: str = Field(min_length=20, max_length=100)


class ForgotPasswordRequest(RequestModel):
    email: EmailStr


class ResendVerificationRequest(RequestModel):
    email: EmailStr


class ResetPasswordRequest(RequestModel):
    token: str = Field(min_length=20, max_length=100)
    password: str = Password


class UserPublic(ApiModel):
    """Only what the member's own UI needs. Never password hash, tokens or internal flags."""

    id: uuid.UUID
    email: str
    status: str
    email_verified: bool
    first_name: str | None
    last_name: str | None


class RegistrationResponse(ApiModel):
    user: UserPublic
    logged_in: bool
    email_verification_required: bool
    points_awarded: int
    reward_title: str | None = None
    destination_path: str


class VerifyEmailResponse(ApiModel):
    user: UserPublic
    points_awarded: int
    destination_path: str
