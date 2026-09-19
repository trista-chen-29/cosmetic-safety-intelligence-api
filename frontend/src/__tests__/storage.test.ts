import { beforeEach, describe, expect, it } from "vitest";
import type { AnalyzeRequest, AnalyzeResponse } from "../types/api";
import { deleteSavedProduct, loadSavedProducts, saveProduct } from "../utils/storage";

const input: AnalyzeRequest = {
  product_name: "Daily Moisturizer",
  product_type: "moisturizer",
  production_code: "UNKNOWN",
  opened_date: "2026-01-01",
  storage: null,
  photo_base64: "abc",
};

const result: AnalyzeResponse = {
  unopened_estimated_expiration_date: "2028-01-01",
  opened_estimated_expiration_date: "2026-12-01",
  risk_level: "low",
  recommended_action: "Looks okay for now.",
  reasoning_summary: ["Typical moisturizer shelf life is about a year after opening."],
  confidence_score: 0.7,
};

describe("saved products storage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", () => {
    expect(loadSavedProducts()).toEqual([]);
  });

  it("saves a product without storing the raw photo payload twice as API data", () => {
    const saved = saveProduct(input, result, "data:image/jpeg;base64,abc");
    expect(saved.input.photo_base64).toBeNull();
    expect(loadSavedProducts()).toHaveLength(1);
  });

  it("does not create a duplicate when saved twice", () => {
    saveProduct(input, result);
    saveProduct(input, result);
    expect(loadSavedProducts()).toHaveLength(1);
  });

  it("deletes an individual product", () => {
    const saved = saveProduct(input, result);
    deleteSavedProduct(saved.id);
    expect(loadSavedProducts()).toEqual([]);
  });

  it("ignores corrupted localStorage", () => {
    localStorage.setItem("cosmetic-safety.saved-products.v1", "{bad json");
    expect(loadSavedProducts()).toEqual([]);
  });
});
