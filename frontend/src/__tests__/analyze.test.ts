import { afterEach, describe, expect, it, vi } from "vitest";
import { AnalyzeApiError, analyzeProduct, isAnalyzeResponse } from "../services/analyze";

describe("analyze API client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns a successful analysis", async () => {
    const payload = {
      unopened_estimated_expiration_date: "2027-09-01",
      opened_estimated_expiration_date: "2026-02-10",
      risk_level: "medium",
      recommended_action: "Replace soon.",
      reasoning_summary: ["High humidity increases risk."],
      confidence_score: 0.72,
      metadata: { cache_hit: false, model: "heuristic-v1", latency_ms: 12 },
    };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(payload),
      }),
    );

    const result = await analyzeProduct({
      product_name: "Foundation",
      product_type: "foundation",
      production_code: "38U900",
    });
    expect(result.risk_level).toBe("medium");
    expect(result.recommended_action).toContain("Replace");
  });

  it("renders API validation errors as readable messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () =>
          JSON.stringify({
            error: { code: "validation_error", message: "Please check the product details and try again." },
          }),
      }),
    );

    await expect(
      analyzeProduct({
        product_name: "Foundation",
        product_type: "foundation",
        production_code: "38U900",
      }),
    ).rejects.toMatchObject({
      message: "Please check the product details and try again.",
    } satisfies Partial<AnalyzeApiError>);
  });

  it("explains a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(
      analyzeProduct({
        product_name: "Foundation",
        product_type: "foundation",
        production_code: "38U900",
      }),
    ).rejects.toThrow(/cannot reach the analysis service/i);
  });

  it("rejects an unexpected response shape", () => {
    expect(isAnalyzeResponse({ hello: "world" })).toBe(false);
    expect(
      isAnalyzeResponse({
        risk_level: "low",
        recommended_action: "Okay",
        reasoning_summary: [],
        confidence_score: 0.4,
      }),
    ).toBe(true);
  });
});
