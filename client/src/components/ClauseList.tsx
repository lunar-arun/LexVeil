import { useMemo, useState } from "react";
import type { Clause, RiskLevel } from "../types";

interface ClauseListProps {
  clauses: Clause[];
  selectedClauseId: string | null;
  onSelectClause: (id: string) => void;
}

const FILTERS: Array<{ value: RiskLevel | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "high", label: "High risk" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
  { value: "info", label: "Info" }
];

const RISK_BADGE: Record<RiskLevel, { label: string; className: string }> = {
  high: { label: "High Risk", className: "bg-red-50 text-red-600 border-red-200" },
  medium: { label: "Medium Risk", className: "bg-amber-50 text-amber-600 border-amber-200" },
  low: { label: "Low Risk", className: "bg-green-50 text-green-600 border-green-200" },
  info: { label: "Informational", className: "bg-gray-100 text-gray-500 border-gray-200" }
};

function ReviewBadge({ risk }: { risk: RiskLevel }) {
  if (risk === "high") {
    return (
      <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-600">
        Review Recommended
      </span>
    );
  }
  if (risk === "medium") {
    return (
      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
        Review Recommended
      </span>
    );
  }
  return null;
}

interface ClauseCardProps {
  clause: Clause;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function ClauseCard({ clause, isSelected, onSelect }: ClauseCardProps) {
  const [showText, setShowText] = useState(false);
  const badge = RISK_BADGE[clause.risk];

  function handleViewOriginal() {
    setShowText((v) => !v);
    onSelect(clause.id); // also jump + highlight in left column
  }

  return (
    <li
      onClick={() => onSelect(clause.id)}
      className={`rounded-xl border p-4 shadow-sm cursor-pointer transition-all duration-200 ${
        isSelected
          ? "border-indigo-400 ring-2 ring-indigo-100 bg-indigo-50/40"
          : "border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md"
      }`}
    >
      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}>
          {badge.label}
        </span>
        <ReviewBadge risk={clause.risk} />
      </div>

      {/* Heading */}
      <h3 className="mt-2.5 text-sm font-semibold text-gray-900 leading-snug">
        {clause.plainLanguage}
      </h3>

      {/* Rationale */}
      <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
        {clause.rationale}
      </p>

      {/* View original text */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation(); // don't double-fire the card click
          handleViewOriginal();
        }}
        className="mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors flex items-center gap-1"
      >
        <svg
          className={`w-3 h-3 transition-transform ${showText ? "rotate-90" : ""}`}
          fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        {showText ? "Hide original text" : "View original text"}
      </button>

      {showText && (
        <blockquote className="mt-2.5 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-600 italic">
          {clause.text}
        </blockquote>
      )}
    </li>
  );
}

export function ClauseList({ clauses, selectedClauseId, onSelectClause }: ClauseListProps) {
  const [filter, setFilter] = useState<RiskLevel | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? clauses : clauses.filter((c) => c.risk === filter)),
    [clauses, filter]
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-50 shadow-sm flex flex-col" style={{ height: "520px" }}>
      {/* Header + filters */}
      <div className="shrink-0 border-b border-gray-200 bg-white rounded-t-2xl px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-sm font-semibold text-gray-900">
              Analyzed Clauses
              <span className="ml-2 text-xs font-normal text-gray-400">
                {filtered.length} of {clauses.length}
              </span>
            </h2>
          </div>
          <div role="group" aria-label="Filter by risk" className="flex flex-wrap gap-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setFilter(f.value)}
                aria-pressed={filter === f.value}
                className={`rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                  filter === f.value
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Clause cards */}
      <ol className="flex-1 overflow-y-auto p-4 space-y-3">
        {filtered.length === 0 && (
          <li className="text-sm text-gray-400 italic p-2">No clauses match this filter.</li>
        )}
        {filtered.map((clause) => (
          <ClauseCard
            key={clause.id}
            clause={clause}
            isSelected={selectedClauseId === clause.id}
            onSelect={onSelectClause}
          />
        ))}
      </ol>
    </div>
  );
}
