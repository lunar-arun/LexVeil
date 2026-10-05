import type { DocumentAnalysis } from "../types";
import { briefDownloadUrl } from "../api/client";

const DOCUMENT_TYPE_LABEL: Record<DocumentAnalysis["documentType"], string> = {
  lease: "Lease Agreement",
  gig_platform_terms: "Gig Platform Terms",
  general_contract: "Independent Contractor Agreement"
};

export function SummaryPanel({ analysis }: { analysis: DocumentAnalysis }) {
  const highRiskCount = analysis.clauses.filter((c) => c.risk === "high").length;
  const totalClauses = analysis.clauses.length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Main content */}
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          {/* Left: badge + summary */}
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700 tracking-wide uppercase">
              {DOCUMENT_TYPE_LABEL[analysis.documentType]}
            </span>

            {analysis.mock && (
              <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
                Demo mode — set <code className="font-mono">ANTHROPIC_API_KEY</code> on the server for full AI analysis.
              </p>
            )}

            <p className="mt-3 text-sm leading-relaxed text-gray-600">{analysis.summary}</p>

            {analysis.keyRisks.length > 0 && (
              <ul className="mt-3 space-y-1">
                {analysis.keyRisks.map((risk, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                    {risk}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: stats */}
          <div className="shrink-0 rounded-xl border border-gray-100 bg-gray-50 px-6 py-4 text-right min-w-[160px]">
            <p className="text-3xl font-bold text-gray-900">{totalClauses}</p>
            <p className="text-xs text-gray-500 mt-0.5">clauses analyzed</p>
            <div className="my-3 border-t border-gray-200" />
            <p className="text-3xl font-bold text-red-500">{highRiskCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">flagged as high risk</p>
          </div>
        </div>
      </div>

      {/* Footer action */}
      <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
        <a
          href={briefDownloadUrl(analysis.documentId)}
          className="inline-flex items-center gap-2.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
          download
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Prep for My Lawyer (PDF)
        </a>
      </div>
    </div>
  );
}
