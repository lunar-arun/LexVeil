import { useEffect } from "react";
import type { Clause } from "../types";

interface OriginalDocPanelProps {
  clauses: Clause[];
  selectedClauseId: string | null;
}

export function OriginalDocPanel({ clauses, selectedClauseId }: OriginalDocPanelProps) {
  useEffect(() => {
    if (!selectedClauseId) return;

    const el = document.getElementById(`clause-orig-${selectedClauseId}`);
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Re-trigger animation every time the same clause is selected
    el.classList.remove("clause-flash");
    void el.offsetHeight; // force reflow so animation replays
    el.classList.add("clause-flash");
  }, [selectedClauseId]);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col" style={{ height: "520px" }}>
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 shrink-0">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-sm font-semibold text-gray-900">Original Document</h2>
        </div>
        <span className="text-xs text-gray-400">{clauses.length} clauses</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5" aria-label="Original document text">
        {clauses.length === 0 && (
          <p className="text-sm text-gray-400 italic">No document text available.</p>
        )}

        {clauses.map((clause) => (
          <div
            key={clause.id}
            id={`clause-orig-${clause.id}`}
            className="transition-colors duration-200"
          >
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
              Clause {clause.index}
            </p>
            <p className="text-xs leading-relaxed text-gray-600 font-mono">{clause.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
