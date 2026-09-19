from datetime import date, timedelta

from fastapi.testclient import TestClient

from app.analyzer import heuristic_analyze, parse_production_date
from app.main import app
from app.models import AnalyzeRequest, ProductType
from app.routes import cache as route_cache

client = TestClient(app)


def setup_function() -> None:
    route_cache.clear()


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_analyze_success_schema() -> None:
    response = client.post(
        "/v1/analyze",
        json={
            "product_name": "L'Oréal True Match Foundation",
            "product_type": "foundation",
            "production_code": "38U900",
            "opened_date": "2025-08-10",
            "storage": {
                "humidity": "high",
                "temperature": "room",
                "sun_exposure": "low",
            },
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["risk_level"] in {"low", "medium", "high"}
    assert isinstance(body["recommended_action"], str)
    assert isinstance(body["reasoning_summary"], list)
    assert 0 <= body["confidence_score"] <= 1
    assert "cache_hit" in body["metadata"]


def test_missing_product_name_returns_structured_error() -> None:
    response = client.post(
        "/v1/analyze",
        json={
            "product_name": "  ",
            "product_type": "mascara",
            "production_code": "ABC123",
        },
    )
    assert response.status_code == 400
    body = response.json()
    assert body["error"]["code"] == "validation_error"
    assert "message" in body["error"]


def test_invalid_product_type() -> None:
    response = client.post(
        "/v1/analyze",
        json={
            "product_name": "Night Cream",
            "product_type": "shampoo",
            "production_code": "ABC123",
        },
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "validation_error"


def test_old_mascara_is_high_risk() -> None:
    opened = (date.today() - timedelta(days=400)).isoformat()
    response = client.post(
        "/v1/analyze",
        json={
            "product_name": "Old Mascara",
            "product_type": "mascara",
            "production_code": "UNKNOWN",
            "opened_date": opened,
        },
    )
    assert response.status_code == 200
    assert response.json()["risk_level"] == "high"


def test_cache_hit_on_repeated_request() -> None:
    payload = {
        "product_name": "Daily Moisturizer",
        "product_type": "moisturizer",
        "production_code": "UNKNOWN",
        "opened_date": date.today().isoformat(),
    }
    first = client.post("/v1/analyze", json=payload)
    second = client.post("/v1/analyze", json=payload)
    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json()["metadata"]["cache_hit"] is False
    assert second.json()["metadata"]["cache_hit"] is True


def test_parse_iso_like_production_code() -> None:
    parsed = parse_production_date("20240115")
    assert parsed == date(2024, 1, 15)


def test_heuristic_includes_text_risk() -> None:
    result = heuristic_analyze(
        AnalyzeRequest(
            product_name="Sunscreen",
            product_type=ProductType.sunscreen,
            production_code="UNKNOWN",
        )
    )
    assert result.risk_level.value in {"low", "medium", "high"}
    assert result.recommended_action


def test_photo_note_is_kept_in_reasoning() -> None:
    result = heuristic_analyze(
        AnalyzeRequest(
            product_name="Old Mascara",
            product_type=ProductType.mascara,
            production_code="UNKNOWN",
            opened_date=date.today().replace(year=date.today().year - 2),
            photo_base64="abc",
        )
    )
    assert any("product photo was attached" in item.lower() for item in result.reasoning_summary)
