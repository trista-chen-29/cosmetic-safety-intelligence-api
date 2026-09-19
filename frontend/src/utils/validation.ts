import { PRODUCT_TYPES, type AnalyzeRequest, type ProductType } from "../types/api";

export type ProductFormValue = {
  productName: string;
  productType: string;
  productionCode: string;
  openedDate: string;
  humidity: "low" | "medium" | "high";
  temperature: "cool" | "room" | "warm";
  sunExposure: "low" | "medium" | "high";
  includeStorage: boolean;
};

export const emptyProductForm = (): ProductFormValue => ({
  productName: "",
  productType: "",
  productionCode: "",
  openedDate: "",
  humidity: "medium",
  temperature: "room",
  sunExposure: "low",
  includeStorage: false,
});

const PRODUCT_TYPE_VALUES = PRODUCT_TYPES.map((item) => item.value);

export function isProductType(value: string): value is ProductType {
  return PRODUCT_TYPE_VALUES.includes(value as ProductType);
}

export function validateProductForm(form: ProductFormValue): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!form.productName.trim()) {
    errors.productName = "Enter the product name.";
  }

  if (!isProductType(form.productType)) {
    errors.productType = "Choose a product type.";
  }

  if (!form.productionCode.trim()) {
    errors.productionCode = "Enter the batch or production code, or tap “I can’t find it”.";
  }

  if (form.openedDate) {
    const opened = new Date(`${form.openedDate}T00:00:00`);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (Number.isNaN(opened.getTime())) {
      errors.openedDate = "Use a valid opened date.";
    } else if (opened > today) {
      errors.openedDate = "Opened date cannot be in the future.";
    }
  }

  return errors;
}

export function buildAnalyzeRequest(
  form: ProductFormValue,
  photoBase64: string | null,
): AnalyzeRequest {
  if (!isProductType(form.productType)) {
    throw new Error("Choose a product type.");
  }

  return {
    product_name: form.productName.trim(),
    product_type: form.productType,
    production_code: form.productionCode.trim(),
    opened_date: form.openedDate || null,
    storage: form.includeStorage
      ? {
          humidity: form.humidity,
          temperature: form.temperature,
          sun_exposure: form.sunExposure,
        }
      : null,
    photo_base64: photoBase64,
  };
}
