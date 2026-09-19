from __future__ import annotations

import json
import statistics
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)
dataset_path = Path(__file__).with_name("dataset.json")


def main() -> None:
    cases = json.loads(dataset_path.read_text())
    latencies: list[float] = []
    valid = 0
    risks: list[str] = []

    for case in cases:
        started = time.perf_counter()
        response = client.post("/v1/analyze", json=case)
        latencies.append((time.perf_counter() - started) * 1000)
        if response.status_code == 200:
            body = response.json()
            if body.get("risk_level") in {"low", "medium", "high"} and body.get("recommended_action"):
                valid += 1
                risks.append(body["risk_level"])

    print("schema_valid_rate", round(valid / len(cases), 3) if cases else 0)
    print("average_latency", round(statistics.mean(latencies), 1) if latencies else 0)
    print("consistency_score", round(len(set(risks)) / max(len(risks), 1), 3))


if __name__ == "__main__":
    main()
