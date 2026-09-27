import { useMemo, useState } from "react";
import type { Clause, RiskLevel } from "../types";
import { RiskBadge } from "./RiskBadge";

const FILTERS: Array<{ value: RiskLevel | "all"; label: string }> = [
  { value: "all", label: "All clauses" },
  { value: "high", label: "High risk" },
  { value: "medium", label: "Medium risk" },
  { value: "low", label: "Low risk" },
  { value: "info", label: "Informational" }
];

const LOW_CONFIDENCE_THRESHOLD = 0.5;

export function ClauseList({ clauses }: { clauses: Clause[] }) {
  const [filter, setFilter] = useState<RiskLevel | "all">("all");

  const filtered = useMemo(
    () => (filter === "all" ? clauses : clauses.filter((c) => c.risk === filter)),
    [clauses, filter]
  );

  if (clauses.length === 0) {
    return (
      <section aria-labelledby="clauses-heading" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 id="clauses-heading" className="text-lg font-semibold text-gray-900">
          Clauses
        </h2>
        <p className="mt-2 text-sm text-gray-600">No clauses could be identified in this document.</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="clauses-heading" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="clauses-heading" className="text-lg font-semibold text-gray-900">
          Clauses ({filtered.length} of {clauses.length})
        </h2>
        <div role="group" aria-label="Filter clauses by risk level" className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              aria-pressed={filter === f.value}
              className={`focus-ring rounded-full border px-3 py-1 text-xs font-medium ${
                filter === f.value
                  ? "border-blue-700 bg-blue-700 text-white"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <ol className="mt-4 space-y-3">
        {filtered.map((clause) => (
          <li key={clause.id}>
            <details className="group rounded-md border border-gray-200">
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-4 py-3 hover:bg-gray-50">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="shrink-0 text-xs font-medium text-gray-500">Clause {clause.index}</span>
                  <span className="truncate text-sm text-gray-900">{clause.plainLanguage}</span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  {clause.confidence < LOW_CONFIDENCE_THRESHOLD && (
                    <span className="rounded-full border border-gray-300 bg-gray-50 px-2 py-0.5 text-xs text-gray-600">
                      Low confidence
                    </span>
                  )}
                  <RiskBadge risk={clause.risk} />
                </span>
              </summary>
              <div className="border-t border-gray-100 px-4 py-3 text-sm text-gray-800">
                <p className="font-medium text-gray-900">Why this matters</p>
                <p className="mt-1">{clause.rationale}</p>
                <p className="mt-3 font-medium text-gray-900">Original text</p>
                <blockquote className="mt-1 rounded-md bg-gray-50 p-3 text-gray-700">{clause.text}</blockquote>
                {clause.confidence < LOW_CONFIDENCE_THRESHOLD && (
                  <p className="mt-3 text-xs text-gray-600">
                    This classification has low confidence — consider reviewing this clause with a professional.
                  </p>
                )}
              </div>
            </details>
          </li>
        ))}
      </ol>
    </section>
  );
}
