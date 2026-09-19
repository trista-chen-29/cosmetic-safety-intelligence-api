from __future__ import annotations

import json
import logging
import re
from datetime import date, timedelta
from typing import Any

from app.models import AnalyzeRequest, AnalyzeResponse, ResponseMetadata, RiskLevel

logger = logging.getLogger("cosmetic-safety")

SHELF_LIFE_MONTHS: dict[str, dict[str, int]] = {
    "mascara": {"unopened": 30, "opened": 4},
    "foundation": {"unopened": 30, "opened": 12},
    "lipstick": {"unopened": 36, "opened": 18},
    "skincare_serum": {"unopened": 30, "opened": 9},
    "moisturizer": {"unopened": 30, "opened": 12},
    "cleanser": {"unopened": 36, "opened": 12},
    "sunscreen": {"unopened": 24, "opened": 12},
    "powder": {"unopened": 36, "opened": 24},
    "eyeliner": {"unopened": 30, "opened": 6},
    "concealer": {"unopened": 30, "opened": 12},
    "other": {"unopened": 30, "opened": 12},
}

PRODUCT_LABELS = {
    "mascara": "mascara",
    "foundation": "liquid foundation",
    "lipstick": "lipstick",
    "skincare_serum": "skincare serum",
    "moisturizer": "moisturizer",
    "cleanser": "cleanser",
    "sunscreen": "sunscreen",
    "powder": "powder product",
    "eyeliner": "eyeliner",
    "concealer": "concealer",
    "other": "cosmetic product",
}


def add_months(start: date, months: int) -> date:
    year = start.year + (start.month - 1 + months) // 12
    month = (start.month - 1 + months) % 12 + 1
    day = min(start.day, _days_in_month(year, month))
    return date(year, month, day)


def _days_in_month(year: int, month: int) -> int:
    if month == 12:
        next_month = date(year + 1, 1, 1)
    else:
        next_month = date(year, month + 1, 1)
    return (next_month - timedelta(days=1)).day


def parse_production_date(production_code: str, today: date | None = None) -> date | None:
    """Best-effort batch-code parsing. Returns None when the code is unclear."""
    today = today or date.today()
    code = re.sub(r"[^A-Z0-9]", "", production_code.upper())
    if not code:
        return None

    iso_match = re.search(r"(20\d{2})(\d{2})(\d{2})", code)
    if iso_match:
        parsed = _safe_date(*map(int, iso_match.groups()))
        if parsed and parsed <= today:
            return parsed

    compact = re.search(r"(?<!\d)(\d{2})(\d{2})(\d{2})(?!\d)", code)
    if compact:
        year, month, day = map(int, compact.groups())
        full_year = 2000 + year if year <= (today.year % 100) else 1900 + year
        parsed = _safe_date(full_year, month, day)
        if parsed and date(today.year - 8, 1, 1) <= parsed <= today:
            return parsed

    julian = re.search(r"(?<!\d)(\d{2})(\d{3})(?!\d)", code)
    if julian:
        year, day_of_year = map(int, julian.groups())
        full_year = 2000 + year if year <= (today.year % 100) else 1900 + year
        try:
            parsed = date(full_year, 1, 1) + timedelta(days=day_of_year - 1)
        except ValueError:
            parsed = None
        if parsed and date(today.year - 8, 1, 1) <= parsed <= today:
            return parsed

    return None


def _safe_date(year: int, month: int, day: int) -> date | None:
    try:
        return date(year, month, day)
    except ValueError:
        return None


def _storage_penalty(request: AnalyzeRequest) -> tuple[float, list[str]]:
    storage = request.storage
    if storage is None:
        return 1.0, []

    factor = 1.0
    notes: list[str] = []
    if storage.humidity.value == "high":
        factor *= 0.8
        notes.append("High humidity storage can raise contamination risk, especially for mascara and creams.")
    if storage.temperature.value == "warm":
        factor *= 0.8
        notes.append("Warm storage can shorten how long a product stays stable.")
    if storage.sun_exposure.value == "high":
        factor *= 0.85
        notes.append("Sun exposure can weaken formulas, especially sunscreen and treatments.")
    return factor, notes


def heuristic_analyze(request: AnalyzeRequest, today: date | None = None) -> AnalyzeResponse:
    today = today or date.today()
    product_type = request.product_type.value
    shelf = SHELF_LIFE_MONTHS[product_type]
    label = PRODUCT_LABELS[product_type]
    manufacture_date = parse_production_date(request.production_code, today=today)
    storage_factor, storage_notes = _storage_penalty(request)

    opened_months = max(1, round(shelf["opened"] * storage_factor))
    unopened_months = max(3, round(shelf["unopened"] * storage_factor))

    unopened_expiration = (
        add_months(manufacture_date, unopened_months) if manufacture_date else None
    )
    opened_expiration = (
        add_months(request.opened_date, opened_months) if request.opened_date else None
    )

    reasoning = [
        f"{label.capitalize()} is often used within about {shelf['opened']} months after opening.",
        "Batch-code dates are estimates and can be wrong depending on the brand.",
        "Stop using a product if the smell, texture, color, or packaging has changed.",
    ]
    if manufacture_date:
        reasoning.insert(
            0,
            f"The production code might indicate a manufacture date around {manufacture_date.isoformat()}.",
        )
    else:
        reasoning.insert(
            0,
            "The production code could not be read as a clear date, so the unopened expiration is uncertain.",
        )
    if request.opened_date:
        reasoning.append(
            f"If opened on {request.opened_date.isoformat()}, typical post-opening use is about {opened_months} months."
        )
    reasoning.extend(storage_notes)

    relevant_dates = [item for item in (opened_expiration, unopened_expiration) if item]
    nearest = min(relevant_dates) if relevant_dates else None
    days_left = (nearest - today).days if nearest else None

    if days_left is not None and days_left < 0:
        risk = RiskLevel.high
        action = "This product looks past its estimated usable window. Replace it and avoid using it on eyes, lips, or broken skin."
        confidence = 0.78 if request.opened_date or manufacture_date else 0.55
    elif days_left is not None and days_left <= 30:
        risk = RiskLevel.medium
        action = "This product may be near the end of its estimated usable window. Inspect it closely and replace it soon."
        confidence = 0.74
    elif not relevant_dates:
        risk = RiskLevel.medium
        action = "There is not enough date information to be sure. Check the package and replace the product if anything seems off."
        confidence = 0.46
    else:
        risk = RiskLevel.low
        action = "Based on the details provided, this product still looks within a typical usable window. Recheck the label and condition before use."
        confidence = 0.7 if manufacture_date or request.opened_date else 0.5

    if product_type in {"mascara", "eyeliner", "sunscreen"} and risk == RiskLevel.low and not request.opened_date:
        risk = RiskLevel.medium
        action = "Use extra caution with this product type. If you are unsure when it was opened, inspect it carefully or replace it."
        confidence = min(confidence, 0.6)

    if request.photo_base64:
        photo_note = (
            "A product photo was attached, but this estimate still relies on the details you entered, not a certified label reading."
        )
        summary = reasoning[:5] + [photo_note]
    else:
        summary = reasoning[:6]

    return AnalyzeResponse(
        unopened_estimated_expiration_date=unopened_expiration,
        opened_estimated_expiration_date=opened_expiration,
        risk_level=risk,
        recommended_action=action,
        reasoning_summary=summary,
        confidence_score=round(confidence, 2),
        metadata=ResponseMetadata(cache_hit=False, model="heuristic-v1", latency_ms=0),
    )


def response_from_llm_payload(
    payload: dict[str, Any],
    fallback: AnalyzeResponse,
) -> AnalyzeResponse:
    try:
        candidate = AnalyzeResponse.model_validate(
            {
                **payload,
                "metadata": payload.get("metadata")
                or {"cache_hit": False, "model": "llm", "latency_ms": 0},
            }
        )
    except Exception:
        logger.warning("LLM payload failed schema validation; using heuristic fallback.")
        return fallback

    if not candidate.reasoning_summary:
        candidate.reasoning_summary = fallback.reasoning_summary
    if not candidate.recommended_action.strip():
        candidate.recommended_action = fallback.recommended_action
    return candidate


def build_llm_prompt(request: AnalyzeRequest) -> str:
    body = request.model_dump(mode="json", exclude={"photo_base64"})
    body["photo_attached"] = bool(request.photo_base64)
    today = date.today().isoformat()
    return f"""You estimate cosmetic expiration and safety risk for educational guidance only.
Today's date is {today}.
Never claim a product is definitely safe or unsafe.
If batch-code interpretation is uncertain, say so and lower confidence.

Return JSON with exactly these keys:
- unopened_estimated_expiration_date: YYYY-MM-DD or null
- opened_estimated_expiration_date: YYYY-MM-DD or null
- risk_level: low, medium, or high
- recommended_action: short plain-English sentence
- reasoning_summary: 3 to 6 short bullet strings
- confidence_score: number between 0 and 1
- metadata: {{"cache_hit": false, "model": "llm", "latency_ms": 0}}

Product request:
{json.dumps(body, indent=2)}
"""
