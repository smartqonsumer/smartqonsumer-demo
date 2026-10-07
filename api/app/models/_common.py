import uuid
from datetime import datetime
from typing import Annotated, Any

from sqlalchemy import DateTime, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import mapped_column

UuidPk = Annotated[uuid.UUID, mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)]
CreatedAt = Annotated[datetime, mapped_column(DateTime(timezone=True), server_default=func.now())]
Json = Annotated[dict[str, Any], mapped_column(JSONB, default=dict, server_default="{}")]


def tz() -> DateTime:
    return DateTime(timezone=True)
