from fastapi import APIRouter

from app.api.v1 import campaigns

api_router = APIRouter()
api_router.include_router(campaigns.router)
