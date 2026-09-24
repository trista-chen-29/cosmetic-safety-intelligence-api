# Product Requirements Document: Cosmetic Safety Intelligence PWA

## 1. Product Summary

Build an iPhone-first progressive web app that helps users record cosmetic products and receive estimated safety and expiration guidance.

The app will use the existing FastAPI backend in this repository. The MVP should be lightweight, mobile-responsive, and easy to test in iPhone Safari and through “Add to Home Screen.” It is not a native iOS app for this phase.

The app must clearly explain that its results are estimates and educational guidance, not certified medical, regulatory, or manufacturer conclusions.

## 2. Main User Problem

Users often do not know whether a cosmetic product is still usable because:

- Expiration dates may be missing or difficult to understand.
- Batch or production codes are not easy to interpret.
- Products have different shelf lives after opening.
- Storage conditions can affect product quality.
- Users need a simple recommendation instead of technical information.

## 3. Target User

People who want to quickly check and track the condition of cosmetics such as foundation, mascara, lipstick, skincare, sunscreen, and powder products.

## 4. MVP Goals

The MVP must allow a user to:

1. Enter cosmetic product information.
2. Optionally take or upload a product photo.
3. Submit the information to the FastAPI analysis endpoint.
4. View an easy-to-understand result.
5. Save analyzed products locally on the device.
6. Reopen saved products without creating an account.
7. Use the app comfortably on an iPhone-sized screen.

## 5. Non-Goals for MVP

Do not build these features yet:

- Native Swift or SwiftUI iOS app.
- App Store submission.
- User accounts, login, or cloud synchronization.
- Payment or subscription features.
- Manufacturer or regulatory database integration.
- Guaranteed batch-code decoding.
- Medical or dermatology diagnosis.
- Social sharing or reviews.
- Push notifications.
- Complex inventory management.
- Automatic background scanning.

## 6. Recommended Technology

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router only if multiple routes are needed
- Browser localStorage for saved products
- Native browser file input with camera support on iPhone
- PWA manifest and service worker using a reliable Vite PWA solution

### Backend

- Keep the existing Python/FastAPI backend.
- Keep Pydantic request and response validation.
- Use the existing `POST /v1/analyze` contract.
- Do not move the analysis logic into the frontend.

### Development Approach

Build in this order:

1. Mock response and frontend flow.
2. Connect the real FastAPI endpoint.
3. Add local saved products.
4. Add PWA behavior and iPhone polish.
5. Add tests and documentation.

## 7. Core User Flow

### New Analysis Flow

1. User opens the app.
2. User taps “Check a Product.”
3. User enters the product name, product type, production or batch code, and optional opened date.
4. User optionally adds storage conditions and a product photo.
5. User taps “Analyze Product.”
6. The app validates the form.
7. The app sends a request to `POST /v1/analyze`.
8. The app displays a loading state while the request is processing.
9. The app displays the result with risk level, dates, recommendation, reasoning, and confidence.
10. User can save the result locally.

### Saved Products Flow

1. User opens “Saved Products.”
2. The app displays locally saved products in a simple list.
3. User taps a product to view its previous result.
4. User can delete a saved product.

## 8. Required Screens

### 8.1 Home Screen

Include:

- App name: Cosmetic Safety Intelligence
- Short explanation of the app
- Primary button: “Check a Product”
- Secondary button: “Saved Products”
- Small disclaimer that results are estimates

### 8.2 Product Form Screen

Required fields:

- Product name
- Product type
- Production or batch code

Optional fields:

- Opened date
- Storage humidity
- Storage temperature
- Sun exposure
- Product photo

Form behavior:

- Use clear labels and examples.
- Mark required fields visibly.
- Show validation errors near the relevant field.
- Disable repeated submission while analyzing.
- Allow users to remove a selected photo before submitting.
- Use a camera-friendly file input on iPhone.

### 8.3 Analysis Result Screen

Display:

- Product name
- Risk level with accessible color and text
- Recommended action near the top
- Estimated unopened expiration date, when available
- Estimated opened expiration date, when available
- Confidence score in plain language
- Reasoning summary as short bullet points
- Product photo, when provided
- “Save Product” button
- Disclaimer: “This is an estimate for educational guidance. Check the product label and contact the manufacturer when safety is uncertain.”

Risk levels:

- Low: likely lower concern based on the provided information
- Medium: use caution and inspect the product carefully
- High: avoid using the product until it is replaced or verified

Do not rely on color alone to communicate risk. Include the text label and an accessible visual indicator.

### 8.4 Saved Products Screen

Display for each saved product:

- Product name
- Product type
- Risk level
- Most relevant estimated expiration date
- Date analyzed

Empty state:

- Explain that saved products will appear here.
- Include a button to analyze the first product.

## 9. API Integration

Use the existing API contract:

```http
POST /v1/analyze
Content-Type: application/json
```

Request example:

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

The frontend must handle:

- Successful analysis.
- Invalid form input.
- API validation errors.
- Backend unavailable or network failure.
- Timeout or unexpected response format.
- Missing optional response fields.

Do not expose backend secrets in frontend code. API URLs must be configured through a frontend environment variable such as `VITE_API_BASE_URL`.

## 10. Local Storage Model

Save products in browser localStorage. No database is needed for the MVP.

Each saved product should include:

```ts
type SavedProduct = {
  id: string;
  createdAt: string;
  input: AnalyzeRequest;
  result: AnalyzeResponse;
};
```

Requirements:

- Handle missing or corrupted localStorage safely.
- Keep saved products only on the current device and browser.
- Do not store API keys.
- Allow individual deletion.
- Prevent duplicate records when the user taps save more than once.

## 11. PWA Requirements

The app must:

- Include a valid web app manifest.
- Have a suitable app name and icon configuration.
- Support installation through iPhone Safari’s “Add to Home Screen.”
- Use a mobile viewport configuration.
- Work in portrait orientation on common iPhone screen sizes.
- Show a useful offline or unavailable-backend message.
- Cache only safe static frontend assets for the MVP.
- Never cache private user analysis responses in a shared cache.

The app does not need full offline analysis because analysis depends on the backend.

## 12. UX and Visual Requirements

- Mobile-first layout with comfortable touch targets.
- Primary actions should be easy to reach with one hand.
- Use a clean, calm, trustworthy visual style.
- Avoid making the app look like a medical diagnostic tool.
- Use plain English instead of technical AI language.
- Use loading, success, empty, and error states for every important action.
- Maintain readable contrast and keyboard-friendly controls.
- Make buttons and inputs at least approximately 44px tall.
- Keep result explanations short and scannable.

## 13. Safety and Trust Requirements

The app must not claim that a product is definitely safe or unsafe based only on an AI estimate.

The UI must:

- Label dates as estimated.
- Explain that batch-code interpretation may be uncertain.
- Encourage checking the packaging and manufacturer instructions.
- Recommend avoiding a product when its smell, texture, color, packaging, or condition has changed significantly.
- Avoid medical advice or diagnosis.

## 14. Suggested Project Structure

If the repository does not already contain a frontend, create a clear frontend directory without breaking the existing backend documentation:

```text
cosmetic-safety-intelligence-api/
├── app/                    # Existing or future FastAPI backend
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── docs/
└── README.md
```

If a frontend already exists, inspect it first and preserve its working structure instead of recreating it.

## 15. Testing Requirements

Add tests for:

- Required form validation.
- Product type selection.
- API request construction.
- Successful API response rendering.
- API error rendering.
- Saving and deleting products from localStorage.
- Empty saved-product state.
- Risk-level display with text, not color only.

Manually verify the app in:

- Desktop browser responsive mode.
- iPhone Safari.
- iPhone Home Screen PWA mode.

## 16. Definition of Done

The MVP is complete when:

- A user can analyze a cosmetic product from an iPhone-sized screen.
- Required fields are validated before submission.
- The frontend successfully calls the FastAPI endpoint using an environment-configured URL.
- Results are displayed clearly with estimates, recommendation, risk level, and disclaimer.
- API and network failures show understandable messages.
- Users can save, reopen, and delete products locally.
- The app can be added to an iPhone Home Screen.
- No API keys or secrets are included in frontend code.
- The README explains local setup, environment variables, backend startup, frontend startup, and iPhone testing.
- The project passes the available automated tests and has no obvious console errors.

## 17. Cursor Implementation Instructions

Before changing files:

1. Inspect the repository structure and existing documentation.
2. Determine whether a backend implementation already exists.
3. Preserve the existing API contract unless a change is necessary and documented.
4. Create the smallest working frontend that satisfies this PRD.

Implementation rules:

- Work in small, verifiable steps.
- Start with mock data if the backend is incomplete, but keep the API service interface ready for the real endpoint.
- Do not add authentication, a database, payments, or native iOS code.
- Do not put secrets in the frontend.
- Keep components readable and avoid unnecessary abstractions.
- Use TypeScript types for API requests and responses.
- Add helpful error handling instead of silently failing.
- Update the README with exact commands to run the backend and frontend.
- After implementation, run available tests, type checks, and build commands.
- Fix errors before finishing and summarize the files changed and commands used.

## 18. Future Expansion After MVP

Only consider these after the MVP is tested with real users:

- Native iOS version.
- Barcode or package scanning.
- OCR for batch codes and expiration labels.
- Manufacturer database verification.
- Cloud accounts and synchronization.
- Reminders for products nearing estimated expiration.
- More detailed ingredient or allergy information.
