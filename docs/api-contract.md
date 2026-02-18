# API Contract

## Endpoint

POST `/v1/analyze`

---

## Request Schema

Required:
- product_name (string)
- product_type (enum)
- production_code (string)

Optional:
- opened_date (ISO date)
- storage (object)
- photo_base64 (string)

### product_type enum

- foundation
- mascara
- lipstick
- skincare_serum
- moisturizer
- cleanser
- sunscreen
- powder
- eyeliner
- concealer
- other

### storage object

{
  humidity: "low | medium | high",
  temperature: "cool | room | warm",
  sun_exposure: "low | medium | high"
}

---

## Response Schema

{
  unopened_estimated_expiration_date: ISO date | null,
  opened_estimated_expiration_date: ISO date | null,
  risk_level: "low | medium | high",
  recommended_action: string,
  reasoning_summary: string[],
  confidence_score: float (0–1),
  metadata: {
    cache_hit: boolean,
    model: string,
    latency_ms: integer
  }
}

---

## Error Format

{
  error: {
    code: string,
    message: string,
    details: object
  }
}
