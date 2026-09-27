import type { DocumentAnalysis } from "../types";

const DOCUMENT_TYPE_LABEL: Record<DocumentAnalysis["documentType"], string> = {
  lease: "Lease agreement",
  gig_platform_terms: "Gig platform terms",
  general_contract: "General contract"
};

export function SummaryPanel({ analysis }: { analysis: DocumentAnalysis }) {
  return (
    <section aria-labelledby="summary-heading" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="summary-heading" className="text-lg font-semibold text-gray-900">
          Summary
        </h2>
        <span className="rounded-full bg-gray-100 px-3 py-0.5 text-xs font-medium text-gray-700">
          {DOCUMENT_TYPE_LABEL[analysis.documentType]}
        </span>
      </div>

      {analysis.mock && (
        <p className="mt-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Running in offline demo mode (no AI model configured on the server). This summary uses a simpler,
          rule-based analyzer — set <code>ANTHROPIC_API_KEY</code> on the server for full AI-powered analysis.
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-gray-800">{analysis.summary}</p>

      {analysis.keyRisks.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-900">Key risks to review</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-800">
            {analysis.keyRisks.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
