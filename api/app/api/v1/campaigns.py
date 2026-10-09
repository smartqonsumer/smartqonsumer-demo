from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import AnonToken, DbSession, IdempotencyKey, OptionalUser
from app.core.config import get_settings
from app.models import Campaign, Game, Gtin
from app.schemas.campaign import (
    BrandPublic,
    CampaignPublic,
    ConsentDefinition,
    DemoQrCode,
    GamePublic,
    ScanCreate,
    ScanResponse,
)
from app.services import campaign_service, games, scan_service

router = APIRouter(tags=["campaigns"])


def campaign_public(db: DbSession, campaign: Campaign) -> CampaignPublic:
    config = campaign.config or {}
    campaign_games = db.scalars(
        select(Game).where(Game.campaign_id == campaign.id, Game.active.is_(True)).order_by(Game.sort_order)
    ).all()
    return CampaignPublic(
        slug=campaign.slug,
        name=campaign.name,
        journey=campaign.journey,
        destination_path=campaign.destination_path,
        running=campaign_service.is_running(campaign),
        end_at=campaign.end_at,
        registration_points=campaign.registration_points,
        registration_points_on=campaign.registration_points_on,
        brand=BrandPublic.model_validate(campaign.brand),
        texts=config.get("texts", {}),
        legal_urls={**campaign.brand.config.get("legal_urls", {}), **config.get("legal_urls", {})},
        consents=[ConsentDefinition.model_validate(c) for c in config.get("consents", [])],
        games=[
            GamePublic(
                type=g.type,
                name=g.name,
                requires_account=g.requires_account,
                play_limit=g.play_limit,
                display=games.public_display(g.type, g.config),
            )
            for g in campaign_games
        ],
    )


@router.get("/campaigns/{slug}", response_model=CampaignPublic)
def get_campaign(slug: str, db: DbSession) -> CampaignPublic:
    return campaign_public(db, campaign_service.get_campaign(db, slug))


@router.get("/brands/{slug}", response_model=BrandPublic)
def get_brand(slug: str, db: DbSession) -> BrandPublic:
    return BrandPublic.model_validate(campaign_service.get_brand(db, slug))


@router.get("/qr-codes", response_model=list[DemoQrCode])
def list_demo_qr_codes(db: DbSession) -> list[DemoQrCode]:
    """QR codes shown on the /qr demo page. They point to the GS1 resolver, not to the
    SmartQonsumer pages directly: the scan really goes through the resolver."""
    resolver = get_settings().gs1_resolver_url.rstrip("/")
    rows = db.scalars(
        select(Gtin).join(Campaign).where(Campaign.active.is_(True)).order_by(Campaign.journey, Gtin.gtin)
    ).all()
    return [
        DemoQrCode(
            gtin=row.gtin,
            label=row.label,
            resolver_url=f"{resolver}/01/{row.gtin}",
            campaign_slug=row.campaign.slug,
            campaign_name=row.campaign.name,
            journey=row.campaign.journey,
            destination_path=row.campaign.destination_path,
        )
        for row in rows
    ]


@router.post("/scans", response_model=ScanResponse)
def create_scan(
    body: ScanCreate,
    db: DbSession,
    user: OptionalUser,
    anon_token: AnonToken = None,
    idempotency_key: IdempotencyKey = None,
) -> ScanResponse:
    """Record a scan coming from the resolver redirect. A non-eligible scan is a normal
    200 answer with eligible=false and a message for the consumer, not an error."""
    result = scan_service.record_scan(
        db,
        gtin=body.gtin,
        serial=body.serial,
        campaign_slug=body.campaign_slug,
        anon_token=scan_service.visitor_service.require_anon_token(anon_token),
        source=body.source,
        idempotency_key=idempotency_key,
        user=user,
        bypass=body.bypass,
    )
    return ScanResponse(
        scan_id=result.scan.id,
        status=result.scan.status,
        eligible=result.eligible,
        message=result.message,
        campaign_slug=result.campaign.slug,
        journey=result.campaign.journey,
        destination_path=result.campaign.destination_path,
        bypass_available=result.scan.status == "already_used" and get_settings().scan_bypass_enabled,
    )
