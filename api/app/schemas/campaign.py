import uuid
from datetime import datetime
from typing import Any

from pydantic import Field

from app.schemas.common import ApiModel, RequestModel


class BrandPublic(ApiModel):
    slug: str
    name: str
    logo_url: str | None
    theme: dict[str, Any]


class ConsentDefinition(ApiModel):
    type: str
    required: bool
    version: str
    label: str


class GamePublic(ApiModel):
    type: str
    name: str
    requires_account: bool
    play_limit: str
    # Only what the UI needs to draw the game (dog names, wheel segments). Never the
    # probability or anything allowing to predict the server-side draw.
    display: dict[str, Any]


class CampaignPublic(ApiModel):
    slug: str
    name: str
    journey: str
    destination_path: str
    running: bool
    end_at: datetime | None
    registration_points: int
    registration_points_on: str
    brand: BrandPublic
    texts: dict[str, Any]
    legal_urls: dict[str, str]
    consents: list[ConsentDefinition]
    games: list[GamePublic]


class DemoQrCode(ApiModel):
    gtin: str
    label: str
    resolver_url: str
    campaign_slug: str
    campaign_name: str
    journey: str
    destination_path: str


class ScanCreate(RequestModel):
    gtin: str = Field(pattern=r"^\d{8,14}$")
    serial: str | None = Field(default=None, pattern=r"^[A-Za-z0-9._-]{1,20}$")
    campaign_slug: str | None = Field(default=None, max_length=80)
    source: str = Field(default="gs1_resolver", pattern=r"^[a-z0-9_]{1,30}$")
    bypass: bool = False  # demo: replay an already used QR Code (see Settings.allow_scan_bypass)


class ScanResponse(ApiModel):
    scan_id: uuid.UUID
    status: str
    eligible: bool
    message: str
    campaign_slug: str
    journey: str
    destination_path: str
    bypass_available: bool = False
