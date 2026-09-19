from __future__ import annotations

from datetime import date
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


class ProductType(str, Enum):
    foundation = "foundation"
    mascara = "mascara"
    lipstick = "lipstick"
    skincare_serum = "skincare_serum"
    moisturizer = "moisturizer"
    cleanser = "cleanser"
    sunscreen = "sunscreen"
    powder = "powder"
    eyeliner = "eyeliner"
    concealer = "concealer"
    other = "other"


class HumidityLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TemperatureLevel(str, Enum):
    cool = "cool"
    room = "room"
    warm = "warm"


class SunExposureLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class RiskLevel(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class StorageConditions(BaseModel):
    humidity: HumidityLevel = HumidityLevel.medium
    temperature: TemperatureLevel = TemperatureLevel.room
    sun_exposure: SunExposureLevel = SunExposureLevel.low


class AnalyzeRequest(BaseModel):
    product_name: str = Field(min_length=1, max_length=200)
    product_type: ProductType
    production_code: str = Field(min_length=1, max_length=80)
    opened_date: date | None = None
    storage: StorageConditions | None = None
    photo_base64: str | None = None

    @field_validator("product_name", "production_code")
    @classmethod
    def strip_required_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("This field cannot be empty.")
        return cleaned

    @field_validator("opened_date")
    @classmethod
    def opened_date_not_in_future(cls, value: date | None) -> date | None:
        if value and value > date.today():
            raise ValueError("Opened date cannot be in the future.")
        return value


class ResponseMetadata(BaseModel):
    cache_hit: bool
    model: str
    latency_ms: int


class AnalyzeResponse(BaseModel):
    unopened_estimated_expiration_date: date | None = None
    opened_estimated_expiration_date: date | None = None
    risk_level: RiskLevel
    recommended_action: str
    reasoning_summary: list[str]
    confidence_score: float = Field(ge=0, le=1)
    metadata: ResponseMetadata


class ErrorBody(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    error: ErrorBody
