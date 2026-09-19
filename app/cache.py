from __future__ import annotations

import hashlib
import json
from typing import Any


class AnalysisCache:
    def __init__(self) -> None:
        self._store: dict[str, dict[str, Any]] = {}

    def get(self, key: str) -> dict[str, Any] | None:
        return self._store.get(key)

    def set(self, key: str, value: dict[str, Any]) -> None:
        self._store[key] = value

    def clear(self) -> None:
        self._store.clear()


def cache_key_for_request(payload: dict[str, Any]) -> str:
    normalized = {
        "product_name": str(payload.get("product_name", "")).strip().lower(),
        "product_type": payload.get("product_type"),
        "production_code": str(payload.get("production_code", "")).strip().upper(),
        "opened_date": payload.get("opened_date"),
        "storage": payload.get("storage") or {},
        "has_photo": bool(payload.get("photo_base64")),
    }
    encoded = json.dumps(normalized, sort_keys=True, default=str)
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()
