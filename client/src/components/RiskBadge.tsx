import type { RiskLevel } from "../types";

const RISK_CONFIG: Record<RiskLevel, { label: string; symbol: string; className: string }> = {
  high: {
    label: "High risk", symbol: "⚠",
    className: "bg-red-50 text-red-700 border-red-300"
  },
  medium: {
    label: "Medium risk", symbol: "▲",
    className: "bg-amber-50 text-amber-700 border-amber-300"
  },
  low: {
    label: "Low risk", symbol: "✓",
    className: "bg-green-50 text-green-700 border-green-300"
  },
  info: {
    label: "Informational", symbol: "ℹ",
    className: "bg-gray-50 text-gray-600 border-gray-300"
  }
};

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  const cfg = RISK_CONFIG[risk];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      <span aria-hidden="true">{cfg.symbol}</span>
      <span>{cfg.label}</span>
    </span>
  );
}
