"""Tests run against a real PostgreSQL database (smartqonsumer_test, created by the
docker-compose init script): concurrency and unique-constraint behaviour must be the
production one, which SQLite would not reproduce."""

import os

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://smartq:smartq@localhost:5440/smartqonsumer_test")
os.environ["APP_ENV"] = "test"
os.environ["EMAIL_PROVIDER"] = "console"

from collections.abc import Iterator  # noqa: E402

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402
from sqlalchemy.orm import Session  # noqa: E402

from app.core.db import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402

API_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


@pytest.fixture(scope="session", autouse=True)
def _migrated_database() -> None:
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"))
    cfg = Config(os.path.join(API_DIR, "alembic.ini"))
    cfg.set_main_option("script_location", os.path.join(API_DIR, "alembic"))
    cfg.attributes["database_url"] = os.environ["DATABASE_URL"]
    command.upgrade(cfg, "head")


@pytest.fixture(autouse=True)
def _clean_tables() -> Iterator[None]:
    yield
    tables = ", ".join(t.name for t in reversed(Base.metadata.sorted_tables))
    with engine.begin() as conn:
        conn.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))


@pytest.fixture
def db() -> Iterator[Session]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture
def client() -> Iterator[TestClient]:
    with TestClient(app, base_url="http://testserver") as test_client:
        yield test_client


@pytest.fixture
def seeded(db: Session):  # type: ignore[no-untyped-def]
    from seeds.demo import seed

    return seed(db)


def anon() -> str:
    import uuid

    return str(uuid.uuid4())
