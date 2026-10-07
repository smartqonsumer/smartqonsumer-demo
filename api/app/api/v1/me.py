from typing import Annotated, Any

from fastapi import APIRouter, Query, Request, Response

from app.api.deps import CurrentUser, DbSession
from app.api.v1.auth import clear_session_cookie, user_public
from app.core.config import get_settings
from app.models import Campaign, User
from app.schemas.auth import UserPublic
from app.schemas.club import (
    ConsentPublic,
    PetPublic,
    ProfilePublic,
    ProfileUpdate,
    ProfileUpdateResponse,
)
from app.schemas.common import Message
from app.services import (
    account_service,
    analytics_service,
    campaign_service,
    consent_service,
    loyalty_service,
    profile_service,
)

router = APIRouter(prefix="/me", tags=["me"])


def profile_public(user: User) -> ProfilePublic:
    profile = user.profile
    pet = profile_service.primary_pet(user)
    return ProfilePublic(
        email=user.email or "",
        email_verified=user.email_verified,
        first_name=profile.first_name if profile else None,
        last_name=profile.last_name if profile else None,
        birth_date=profile.birth_date if profile else None,
        city=profile.city if profile else None,
        has_dog=profile.has_dog if profile else None,
        dog_count=profile.dog_count if profile else None,
        pet=PetPublic.model_validate(pet) if pet else None,
    )


@router.get("", response_model=UserPublic)
def get_me(user: CurrentUser) -> UserPublic:
    return user_public(user)


@router.get("/profile", response_model=ProfilePublic)
def get_profile(user: CurrentUser) -> ProfilePublic:
    return profile_public(user)


@router.patch("/profile", response_model=ProfileUpdateResponse)
def update_profile(
    body: ProfileUpdate, brand_slug: Annotated[str, Query(alias="brand")], db: DbSession, user: CurrentUser
) -> ProfileUpdateResponse:
    brand = campaign_service.get_brand(db, brand_slug)
    data = body.model_dump(exclude_unset=True)
    pet = data.pop("pet", None)
    result = profile_service.update_profile(db, user, brand, data, pet)
    db.commit()
    db.refresh(user)
    return ProfileUpdateResponse(
        profile=profile_public(user),
        points_awarded=result.points_awarded,
        balance=loyalty_service.balance(db, user.id, brand.id),
    )


@router.get("/consents", response_model=list[ConsentPublic])
def list_consents(db: DbSession, user: CurrentUser) -> list[ConsentPublic]:
    return [
        ConsentPublic(
            type=c.type,
            version=c.text_version,
            granted=c.granted,
            active=c.granted and c.withdrawn_at is None,
            date=c.created_at,
            withdrawn_at=c.withdrawn_at,
        )
        for c in consent_service.current(db, user.id)
    ]


@router.post("/consents/{consent_type}/withdraw", response_model=Message)
def withdraw_consent(consent_type: str, db: DbSession, user: CurrentUser) -> Message:
    consent_service.withdraw(db, user.id, consent_type)
    analytics_service.track(db, "consent_withdrawn", user_id=user.id, type=consent_type)
    db.commit()
    return Message(message="Votre choix a bien été enregistré.")


@router.post("/consents/{consent_type}/grant", response_model=Message)
def grant_consent(consent_type: str, db: DbSession, user: CurrentUser) -> Message:
    campaign = db.get(Campaign, user.registration_campaign_id) if user.registration_campaign_id else None
    consent_service.grant(db, user.id, consent_type, campaign)
    db.commit()
    return Message(message="Votre choix a bien été enregistré.")


@router.get("/export")
def export_my_data(db: DbSession, user: CurrentUser) -> dict[str, Any]:
    """Right of access: everything stored about the member, in a portable format."""
    return account_service.export(db, user)


@router.delete("", response_model=Message)
def delete_my_account(request: Request, response: Response, db: DbSession, user: CurrentUser) -> Message:
    account_service.anonymise(db, user)
    db.commit()
    if request.cookies.get(get_settings().session_cookie_name):
        clear_session_cookie(response)
    return Message(message="Votre compte a été supprimé et vos données personnelles effacées.")
