import { describe, expect, it } from "vitest";
import { PRODUCT_TYPES } from "../types/api";
import {
  buildAnalyzeRequest,
  emptyProductForm,
  isProductType,
  validateProductForm,
} from "../utils/validation";

describe("product form validation", () => {
  it("requires name, type, and production code", () => {
    const errors = validateProductForm(emptyProductForm());
    expect(errors.productName).toMatch(/product name/i);
    expect(errors.productType).toMatch(/product type/i);
    expect(errors.productionCode).toMatch(/batch or production code/i);
  });

  it("accepts every documented product type", () => {
    for (const type of PRODUCT_TYPES) {
      expect(isProductType(type.value)).toBe(true);
      const errors = validateProductForm({
        ...emptyProductForm(),
        productName: "Test product",
        productType: type.value,
        productionCode: "ABC123",
      });
      expect(errors).toEqual({});
    }
  });

  it("rejects a future opened date", () => {
    const errors = validateProductForm({
      ...emptyProductForm(),
      productName: "Sunscreen",
      productType: "sunscreen",
      productionCode: "UNKNOWN",
      openedDate: "2999-01-01",
    });
    expect(errors.openedDate).toMatch(/future/i);
  });
});

describe("API request construction", () => {
  it("builds a contract-compatible payload", () => {
    const payload = buildAnalyzeRequest(
      {
        productName: "  L'Oréal True Match Foundation  ",
        productType: "foundation",
        productionCode: " 38U900 ",
        openedDate: "2025-08-10",
        humidity: "high",
        temperature: "room",
        sunExposure: "low",
        includeStorage: true,
      },
      null,
    );

    expect(payload).toEqual({
      product_name: "L'Oréal True Match Foundation",
      product_type: "foundation",
      production_code: "38U900",
      opened_date: "2025-08-10",
      storage: {
        humidity: "high",
        temperature: "room",
        sun_exposure: "low",
      },
      photo_base64: null,
    });
  });
});
