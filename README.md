# cosmetic-safety-intelligence-api

LLM-powered backend service that analyzes cosmetic product metadata and contextual usage information to generate structured safety and expiration risk assessments.

---

## Overview

Cosmetic products often lack clear expiration visibility due to inconsistent labeling practices, batch codes, and varying shelf-life rules after opening.

This service provides:

- Estimated expiration dates (opened and unopened)
- Structured risk classification
- Recommended action
- Confidence scoring
- Latency + cache metadata

The system integrates an external LLM API and enforces strict response schema validation to ensure consistent structured outputs.

---

## Architecture (High-Level)

Client → FastAPI → Validation → Cache → LLM Adapter → Post-processing → Response

See `/docs/architecture.md` for details.

---

## Example Request

POST `/v1/analyze`

```json
{
  "product_name": "L'Oréal True Match Foundation",
  "product_type": "foundation",
  "production_code": "38U900",
  "opened_date": "2025-08-10",
  "storage": {
    "humidity": "high",
    "temperature": "room",
    "sun_exposure": "low"
  }
}
```

## Example Response

```bash
{
  "unopened_estimated_expiration_date": "2027-09-01",
  "opened_estimated_expiration_date": "2026-02-10",
  "risk_level": "medium",
  "recommended_action": "Replace soon; avoid use if smell or texture has changed.",
  "reasoning_summary": [
    "Liquid foundations typically last 6–12 months after opening.",
    "High humidity storage increases contamination risk."
  ],
  "confidence_score": 0.72,
  "metadata": {
    "cache_hit": false,
    "model": "gpt-4.1-mini",
    "latency_ms": 842
  }
}
```

---

## Tech Stack

- Python
- FastAPI
- Pydantic
- OpenAI API (or HuggingFace)
- In-memory or Redis caching
- Structured logging

---

## Setup

1. Clone repository
2. Create virtual environment
3. Install dependencies:

```css
pip install -r requirements.txt
```

4. Configure environment variables:

```ini
OPENAI_API_KEY=your_key
CACHE_MODE=memory
```

5. Run:

```lua
uvicorn app.main:app --reload
```

---

## Definition of Done

See `/docs/definition-of-done.md`

```yaml

---

# 📄 docs/problem-definition.md

```markdown
# Problem Definition

## Context

Consumers frequently lack reliable visibility into cosmetic product safety due to:

- Ambiguous production/batch codes
- Inconsistent labeling standards
- Variation in post-opening shelf life
- Environmental storage effects
- Absence of centralized verification systems

## Objective

Design a backend API service that:

1. Accepts structured cosmetic product metadata.
2. Incorporates contextual usage information.
3. Uses LLM-based reasoning to generate a structured safety assessment.
4. Returns deterministic, schema-validated JSON output.

## User Story

As a user, I want to input product information and receive a clear, structured safety recommendation including expiration estimates and risk level.

## Scope (v1)

Included:
- Structured API endpoint
- LLM integration
- Schema enforcement
- Latency logging
- Caching
- Evaluation script

Excluded:
- Barcode scanning
- Image OCR
- Manufacturer database integration
- Regulatory-grade validation
```
