from pydantic import BaseModel, ConfigDict


class ApiModel(BaseModel):
    """Base for every response schema: built from ORM objects, never echoes unknown fields."""

    model_config = ConfigDict(from_attributes=True, extra="ignore")


class RequestModel(BaseModel):
    """Base for request bodies: unknown fields are rejected, strings are trimmed."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class Message(ApiModel):
    message: str
