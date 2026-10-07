"""Centralised backend configuration, read from environment variables (.env in dev).

Business rules (points, probabilities, policies) do NOT live here: they belong to the
Brand / Campaign / Game rows in the database. Only infrastructure settings do.
"""

from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: Literal["development", "test", "production"] = "development"
    database_url: str = "postgresql+psycopg://smartq:smartq@localhost:5440/smartqonsumer"

    # Public URLs
    frontend_url: str = "http://localhost:3010"
    gs1_resolver_url: str = "http://localhost:8091"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3010"])

    # Sessions (opaque token in an HttpOnly cookie, hashed in DB)
    session_secret: str = "dev-only-change-me"  # noqa: S105 - overridden in every real environment
    session_cookie_name: str = "sq_session"
    session_cookie_domain: str | None = None
    session_ttl_hours: int = 24 * 14
    email_verification_ttl_hours: int = 48
    password_reset_ttl_minutes: int = 60

    # Email
    email_provider: Literal["console", "smtp"] = "console"
    email_from: str = "SmartQonsumer <no-reply@smartqonsumer.com>"
    smtp_host: str = "localhost"
    smtp_port: int = 1026
    smtp_username: str | None = None
    smtp_password: str | None = None
    smtp_starttls: bool = False

    # Rate limiting (per client key, sliding window)
    rate_limit_login_per_15min: int = 10
    rate_limit_sensitive_per_hour: int = 20

    # GDPR: anonymous visitor rows without an account are purged after this delay
    anonymous_data_retention_days: int = 395

    # Analytics adapter: "db" stores business events in the events table
    analytics_provider: Literal["db", "none"] = "db"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def _split_origins(cls, value: object) -> object:
        if isinstance(value, str) and not value.startswith("["):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @property
    def is_production(self) -> bool:
        return self.app_env == "production"

    def check_production_safety(self) -> None:
        if self.is_production and (self.session_secret.startswith("dev-") or len(self.session_secret) < 32):
            raise RuntimeError("SESSION_SECRET must be set to a long random value in production")


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    settings.check_production_safety()
    return settings
