from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import get_settings
from app.models import ErrorBody, ErrorResponse
from app.routes import router

settings = get_settings()

app = FastAPI(
    title="Cosmetic Safety Intelligence API",
    version="0.1.0",
    description="Estimated cosmetic expiration and safety guidance. Educational use only.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(router)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content=ErrorResponse(
            error=ErrorBody(
                code="validation_error",
                message="Please check the product details and try again.",
                details={
                    "issues": jsonable_encoder(
                        exc.errors(),
                        custom_encoder={Exception: str},
                    )
                },
            )
        ).model_dump(),
    )


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/")
async def root() -> dict[str, str]:
    return {
        "service": "cosmetic-safety-intelligence-api",
        "analyze": "POST /v1/analyze",
        "docs": "/docs",
    }
