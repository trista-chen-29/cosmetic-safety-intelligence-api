import type { RiskLevel } from "../types/api";

export function formatDate(value: string | null | undefined): string {
  if (!value) return "Not estimated";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatAnalyzedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function confidenceLabel(score: number): string {
  if (score >= 0.75) return "We are fairly sure about this estimate.";
  if (score >= 0.5) return "This is a rough estimate based on typical product shelf life.";
  return "There is not enough information, so this estimate is uncertain.";
}

export function riskHeadline(level: RiskLevel): string {
  if (level === "high") return "Likely expired";
  if (level === "medium") return "Check it carefully";
  return "Looks okay for now";
}

export function riskCaption(level: RiskLevel): string {
  if (level === "high") return "High concern based on the details provided.";
  if (level === "medium") return "Medium concern. Inspect the product before using it.";
  return "Lower concern based on the details provided.";
}

export function productTypeLabel(value: string): string {
  return value.replaceAll("_", " ");
}
