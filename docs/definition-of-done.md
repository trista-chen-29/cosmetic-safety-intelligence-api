# Definition of Done (v1)

## Functional

- POST /v1/analyze returns schema-valid JSON.
- All enum values validated.
- Invalid input returns structured 400 response.

## LLM Integration

- LLM returns structured JSON.
- Response validated before returning to client.
- Failure fallback handled.

## Caching

- Identical requests return cached result.
- Cache key derived from normalized request hash.

## Logging

- Latency recorded.
- Cache hit/miss recorded.
- Model name recorded.

## Evaluation

- Evaluation script runs on predefined dataset.
- Metrics printed:
  - schema_valid_rate
  - average_latency
  - consistency_score

## Documentation

- README complete.
- All docs in `/docs` present.
