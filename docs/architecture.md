# Architecture

## Components

1. FastAPI Application
2. Validation Layer (Pydantic)
3. Cache Layer (Memory or Redis)
4. LLM Adapter Module
5. Post-Processing + Schema Enforcement
6. Logging Layer
7. Evaluation Script

---

## Request Flow

Client
   ↓
FastAPI Endpoint
   ↓
Input Validation
   ↓
Request Normalization
   ↓
Cache Lookup
   ├─ Hit → Return cached response
   └─ Miss → Call LLM
               ↓
         Structured Prompt
               ↓
         LLM Response
               ↓
         JSON Enforcement
               ↓
         Confidence Computation
               ↓
         Logging + Cache Store
               ↓
         Final Response

---

## Observability

Each request logs:
- request_id
- latency_ms
- cache_hit
- product_type
- model name
