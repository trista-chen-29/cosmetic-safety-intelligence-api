from __future__ import annotations

import json
import logging
from typing import Any

import httpx

from app.config import Settings
from app.models import AnalyzeRequest

logger = logging.getLogger("cosmetic-safety")


async def complete_analysis_json(request: AnalyzeRequest, prompt: str, settings: Settings) -> dict[str, Any] | None:
    if not settings.openai_api_key:
        return None

    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": settings.openai_model,
        "temperature": 0.2,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": "You return only valid JSON for cosmetic expiration estimates.",
            },
            {"role": "user", "content": prompt},
        ],
    }

    try:
        async with httpx.AsyncClient(timeout=settings.openai_timeout_seconds) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json=payload,
            )
            response.raise_for_status()
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            parsed = json.loads(content)
            parsed.setdefault("metadata", {})
            parsed["metadata"]["model"] = settings.openai_model
            parsed["metadata"]["cache_hit"] = False
            return parsed
    except Exception as exc:
        logger.warning("LLM analysis failed: %s", exc)
        return None
