from __future__ import annotations

import logging
import time
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Request
from app.analyzer import build_llm_prompt, heuristic_analyze, response_from_llm_payload
from app.cache import AnalysisCache, cache_key_for_request
from app.config import get_settings
from app.llm import complete_analysis_json
from app.models import AnalyzeRequest, AnalyzeResponse

logger = logging.getLogger("cosmetic-safety")
router = APIRouter()
cache = AnalysisCache()
settings = get_settings()


@router.post("/v1/analyze", response_model=AnalyzeResponse)
async def analyze_product(payload: AnalyzeRequest, request: Request) -> AnalyzeResponse:
    started = time.perf_counter()
    request_id = request.headers.get("x-request-id") or str(uuid.uuid4())
    key = cache_key_for_request(payload.model_dump(mode="json"))

    cached = cache.get(key)
    if cached:
        response = AnalyzeResponse.model_validate(cached)
        response.metadata.cache_hit = True
        response.metadata.latency_ms = int((time.perf_counter() - started) * 1000)
        logger.info(
            "analyze request_id=%s cache_hit=true product_type=%s latency_ms=%s model=%s",
            request_id,
            payload.product_type.value,
            response.metadata.latency_ms,
            response.metadata.model,
        )
        return response

    fallback = heuristic_analyze(payload)
    llm_payload = await complete_analysis_json(
        payload, build_llm_prompt(payload), settings
    )
    result = response_from_llm_payload(llm_payload, fallback) if llm_payload else fallback
    result.metadata.cache_hit = False
    result.metadata.latency_ms = int((time.perf_counter() - started) * 1000)
    if not llm_payload:
        result.metadata.model = "heuristic-v1"

    cache.set(key, result.model_dump(mode="json"))
    logger.info(
        "analyze request_id=%s cache_hit=false product_type=%s latency_ms=%s model=%s at=%s",
        request_id,
        payload.product_type.value,
        result.metadata.latency_ms,
        result.metadata.model,
        datetime.now(timezone.utc).isoformat(),
    )
    return result
