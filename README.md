# Cosmetic Safety Intelligence

iPhone-first PWA plus FastAPI backend that estimates whether a cosmetic product still looks okay to use.

Results are **estimates for educational guidance**, not medical, regulatory, or manufacturer-certified conclusions.

The backend analyzes product details and returns:

- Estimated expiration dates (opened and unopened)
- Structured risk classification
- Recommended action
- Confidence scoring
- Latency and cache metadata

---

## What you can do

1. Open the app and tap **Scan a product**.
2. Take a photo with the camera (or type the details in).
3. Add the product name, type, batch code, and optional opened date.
4. See a plain-language result: likely expired, check carefully, or looks okay for now.
5. Save the result on this device. No account is required.

---

## Project layout

```text
cosmetic-safety-intelligence-api/
├── app/                 # FastAPI backend
├── frontend/            # React + Vite PWA
├── docs/                # API contract and architecture
├── tests/               # Backend tests
└── eval/                # Small evaluation script
```

Client → FastAPI → Validation → Cache → LLM Adapter (optional) → Post-processing → Response

See `/docs/architecture.md` for details.

---

## Backend setup

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Optional `.env` values:

```ini
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
CACHE_MODE=memory
CORS_ORIGINS=*
```

If `OPENAI_API_KEY` is empty, the API still works using a built-in shelf-life estimate. That keeps local testing simple.

Check it:

```bash
curl http://127.0.0.1:8000/health
```

Analyze endpoint:

```http
POST /v1/analyze
Content-Type: application/json
```

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
  },
  "photo_base64": null
}
```

Example response:

```json
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

API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev -- --host
```

Then open [http://127.0.0.1:5173](http://127.0.0.1:5173).

`frontend/.env`:

```ini
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Do not put API keys in the frontend. The browser only needs the public backend URL.

### iPhone testing

1. Start the backend with `--host 0.0.0.0`.
2. Start the frontend with `npm run dev -- --host`.
3. Find your computer’s local IP, for example `192.168.1.20`.
4. Set `VITE_API_BASE_URL=http://192.168.1.20:8000` and restart Vite.
5. On iPhone Safari, open `http://192.168.1.20:5173`.
6. Add to Home Screen: **Share → Add to Home Screen**.

The camera button uses the native iPhone photo picker. Analysis still needs the backend, so the phone and computer must be on the same network.

If the backend is unavailable or you are offline, the app shows a clear error instead of a fake result.

---

## Tests

Backend:

```bash
source .venv/bin/activate
pytest
python eval/evaluate.py
```

Frontend:

```bash
cd frontend
npm test
npm run build
```

---

## Safety notes

- Dates are estimated.
- Batch-code reading can be wrong.
- Check packaging and manufacturer instructions.
- Do not use a product if the smell, texture, color, or packaging has changed.
- This app does not diagnose skin conditions.

See `/docs/definition-of-done.md` for the API definition of done.
