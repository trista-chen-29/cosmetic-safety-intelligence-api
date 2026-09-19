export const PRODUCT_TYPES = [
  { value: "foundation", label: "Foundation" },
  { value: "mascara", label: "Mascara" },
  { value: "lipstick", label: "Lipstick" },
  { value: "skincare_serum", label: "Serum" },
  { value: "moisturizer", label: "Moisturizer" },
  { value: "cleanser", label: "Cleanser" },
  { value: "sunscreen", label: "Sunscreen" },
  { value: "powder", label: "Powder" },
  { value: "eyeliner", label: "Eyeliner" },
  { value: "concealer", label: "Concealer" },
  { value: "other", label: "Other" },
] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number]["value"];

export type StorageConditions = {
  humidity: "low" | "medium" | "high";
  temperature: "cool" | "room" | "warm";
  sun_exposure: "low" | "medium" | "high";
};

export type AnalyzeRequest = {
  product_name: string;
  product_type: ProductType;
  production_code: string;
  opened_date?: string | null;
  storage?: StorageConditions | null;
  photo_base64?: string | null;
};

export type RiskLevel = "low" | "medium" | "high";

export type AnalyzeResponse = {
  unopened_estimated_expiration_date: string | null;
  opened_estimated_expiration_date: string | null;
  risk_level: RiskLevel;
  recommended_action: string;
  reasoning_summary: string[];
  confidence_score: number;
  metadata?: {
    cache_hit: boolean;
    model: string;
    latency_ms: number;
  };
};

export type SavedProduct = {
  id: string;
  createdAt: string;
  input: AnalyzeRequest;
  result: AnalyzeResponse;
  photoPreview?: string | null;
};
