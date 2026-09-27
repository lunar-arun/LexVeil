import type { RiskLevel } from "../types";

const RISK_CONFIG: Record<RiskLevel, { label: string; symbol: string; classes: string }> = {
  high: { label: "High risk", symbol: "⚠", classes: "bg-red-50 text-red-800 border-red-300" },
  medium: { label: "Medium risk", symbol: "▲", classes: "bg-amber-50 text-amber-800 border-amber-300" },
  low: { label: "Low risk", symbol: "✓", classes: "bg-green-50 text-green-800 border-green-300" },
  info: { label: "Informational", symbol: "ℹ", classes: "bg-gray-50 text-gray-700 border-gray-300" }
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const cfg = RISK_CONFIG[risk];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-medium ${cfg.classes}`}
    >
      <span aria-hidden="true">{cfg.symbol}</span>
      <span>{cfg.label}</span>
    </span>
  );
}
