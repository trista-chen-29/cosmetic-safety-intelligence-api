import type { AnalyzeRequest, AnalyzeResponse, SavedProduct } from "../types/api";

const STORAGE_KEY = "cosmetic-safety.saved-products.v1";

function fingerprint(input: AnalyzeRequest): string {
  return JSON.stringify({
    product_name: input.product_name.trim().toLowerCase(),
    product_type: input.product_type,
    production_code: input.production_code.trim().toUpperCase(),
    opened_date: input.opened_date ?? null,
    storage: input.storage ?? null,
  });
}

export function loadSavedProducts(): SavedProduct[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedProduct);
  } catch {
    return [];
  }
}

function isSavedProduct(value: unknown): value is SavedProduct {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<SavedProduct>;
  return Boolean(
    record.id &&
      record.createdAt &&
      record.input &&
      record.result &&
      typeof record.input.product_name === "string" &&
      typeof record.result.risk_level === "string",
  );
}

export function saveProduct(
  input: AnalyzeRequest,
  result: AnalyzeResponse,
  photoPreview?: string | null,
): SavedProduct {
  const products = loadSavedProducts();
  const key = fingerprint(input);
  const existing = products.find((item) => fingerprint(item.input) === key);
  const record: SavedProduct = {
    id: existing?.id ?? crypto.randomUUID(),
    createdAt: existing?.createdAt ?? new Date().toISOString(),
    input: { ...input, photo_base64: null },
    result,
    photoPreview: photoPreview ?? existing?.photoPreview ?? null,
  };
  const next = [record, ...products.filter((item) => item.id !== record.id)];
  persist(next);
  return record;
}

export function deleteSavedProduct(id: string): SavedProduct[] {
  const next = loadSavedProducts().filter((item) => item.id !== id);
  persist(next);
  return next;
}

export function getSavedProduct(id: string): SavedProduct | undefined {
  return loadSavedProducts().find((item) => item.id === id);
}

function persist(products: SavedProduct[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export function mostRelevantExpiration(result: AnalyzeResponse): string | null {
  return result.opened_estimated_expiration_date ?? result.unopened_estimated_expiration_date;
}
