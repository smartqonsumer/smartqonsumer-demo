"""Functional errors: every refusal the consumer can hit has a stable code and a French
message meant to be shown as-is. Unexpected exceptions never leak to the client."""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

logger = logging.getLogger("smartqonsumer")


class AppError(Exception):
    status_code = 400

    def __init__(self, code: str, message: str, status_code: int | None = None, **details: object):
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = details
        if status_code is not None:
            self.status_code = status_code


class NotFound(AppError):
    status_code = 404


class Unauthorized(AppError):
    status_code = 401


class Forbidden(AppError):
    status_code = 403


class Conflict(AppError):
    status_code = 409


class TooManyRequests(AppError):
    status_code = 429


def _body(code: str, message: str, details: dict[str, object] | None = None) -> dict[str, object]:
    return {"error": {"code": code, "message": message, **({"details": details} if details else {})}}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(status_code=exc.status_code, content=_body(exc.code, exc.message, exc.details))

    @app.exception_handler(RequestValidationError)
    async def _validation_error(_: Request, exc: RequestValidationError) -> JSONResponse:
        fields = [
            {"field": ".".join(str(p) for p in err["loc"][1:]), "message": err["msg"]} for err in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content=_body("validation_error", "Certaines informations sont invalides.", {"fields": fields}),
        )

    @app.exception_handler(Exception)
    async def _unexpected(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("Unhandled error: %s", type(exc).__name__)
        return JSONResponse(
            status_code=500, content=_body("internal_error", "Une erreur est survenue. Veuillez réessayer.")
        )
