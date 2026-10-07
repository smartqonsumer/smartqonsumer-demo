from fastapi import APIRouter

from app.api.deps import CurrentUser
from app.api.v1.auth import user_public
from app.schemas.auth import UserPublic

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=UserPublic)
def get_me(user: CurrentUser) -> UserPublic:
    return user_public(user)
