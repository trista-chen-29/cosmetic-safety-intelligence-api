import type { AnalyzeRequest, AnalyzeResponse } from "../types/api";

export class AnalyzeApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "AnalyzeApiError";
    this.status = status;
  }
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");

export async function analyzeProduct(input: AnalyzeRequest): Promise<AnalyzeResponse> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 30_000);

  try {
    const response = await fetch(`${API_BASE}/v1/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    const payload = await readJson(response);

    if (!response.ok) {
      throw new AnalyzeApiError(extractErrorMessage(payload), response.status);
    }

    if (!isAnalyzeResponse(payload)) {
      throw new AnalyzeApiError("The service returned an unexpected result. Try again.");
    }

    return payload;
  } catch (error) {
    if (error instanceof AnalyzeApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AnalyzeApiError("The check is taking too long. Try again in a moment.");
    }
    throw new AnalyzeApiError(
      "Cannot reach the analysis service. Check your connection, or start the backend and try again.",
    );
  } finally {
    window.clearTimeout(timer);
  }
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new AnalyzeApiError("The service returned an unexpected result. Try again.");
  }
}

function extractErrorMessage(payload: unknown): string {
  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as { error?: { message?: string } }).error;
    if (error?.message) return error.message;
  }
  return "Please check the product details and try again.";
}

export function isAnalyzeResponse(value: unknown): value is AnalyzeResponse {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<AnalyzeResponse>;
  return (
    (record.risk_level === "low" || record.risk_level === "medium" || record.risk_level === "high") &&
    typeof record.recommended_action === "string" &&
    Array.isArray(record.reasoning_summary) &&
    typeof record.confidence_score === "number"
  );
}
