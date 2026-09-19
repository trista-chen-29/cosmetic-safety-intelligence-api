import type { RiskLevel } from "../types/api";
import { riskCaption, riskHeadline } from "../utils/format";

const styles: Record<RiskLevel, string> = {
  low: "bg-sage-soft text-sage-dark",
  medium: "bg-amber-soft text-amber",
  high: "bg-terra-soft text-terra",
};

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <div className={`rounded-3xl px-5 py-6 ${styles[level]}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em]">{level} concern</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight">{riskHeadline(level)}</p>
      <p className="mt-2 text-sm leading-6">{riskCaption(level)}</p>
    </div>
  );
}
