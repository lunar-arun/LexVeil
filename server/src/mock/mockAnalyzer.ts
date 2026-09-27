import type { Clause, ClauseCategory, DocumentAnalysis, RiskLevel } from "../types.js";

interface CategoryRule {
  category: ClauseCategory;
  risk: RiskLevel;
  keywords: RegExp;
  rationale: string;
}

// Deterministic keyword heuristics used when no live LLM is configured.
// These intentionally err toward flagging things for human attention
// (higher recall over precision) since the cost of a missed risk is much
// higher than an unnecessary flag in a legal-assistance tool.
const RULES: CategoryRule[] = [
  {
    category: "termination",
    risk: "high",
    keywords: /early termination|terminate this (lease|agreement)|break(ing)? (the |this )?lease/i,
    rationale: "Mentions ending the agreement early, which often carries fees or notice requirements."
  },
  {
    category: "fees_and_payments",
    risk: "high",
    keywords: /late fee|penalt(y|ies)|non-?refundable|liquidated damages/i,
    rationale: "Describes a fee or penalty that could cost you money unexpectedly."
  },
  {
    category: "arbitration_and_disputes",
    risk: "high",
    keywords: /binding arbitration|waive[sd]? .*(jury|right to sue)|class action waiver/i,
    rationale: "Limits your ability to go to court or join a class action if there's a dispute."
  },
  {
    category: "renewal_and_auto_renewal",
    risk: "medium",
    keywords: /automatically renew|auto-?renewal|evergreen/i,
    rationale: "The agreement may renew automatically unless you act before a deadline."
  },
  {
    category: "liability",
    risk: "medium",
    keywords: /indemnif|hold harmless|limitation of liability|not liable/i,
    rationale: "Shifts responsibility for certain losses or damages onto you."
  },
  {
    category: "privacy_and_data",
    risk: "medium",
    keywords: /personal (information|data)|share (your )?data|third part(y|ies)/i,
    rationale: "Covers how your personal information may be collected, used, or shared."
  },
  {
    category: "obligations",
    risk: "low",
    keywords: /you (must|agree to|shall)|tenant (must|shall|is responsible)/i,
    rationale: "States something you are required to do under the agreement."
  },
  {
    category: "rights",
    risk: "low",
    keywords: /you (may|are entitled|have the right)/i,
    rationale: "Describes something you are permitted or entitled to do."
  }
];

function classifyClauseText(text: string): { category: ClauseCategory; risk: RiskLevel; rationale: string } {
  for (const rule of RULES) {
    if (rule.keywords.test(text)) {
      return { category: rule.category, risk: rule.risk, rationale: rule.rationale };
    }
  }
  return {
    category: "other",
    risk: "info",
    rationale: "No specific risk pattern detected by the offline analyzer; review if it seems important."
  };
}

function summarizePlainLanguage(text: string): string {
  const trimmed = text.trim();
  const short = trimmed.length > 220 ? `${trimmed.slice(0, 217)}...` : trimmed;
  return `In plain terms: ${short}`;
}

export function mockClassifyClauses(clauseTexts: string[]): Clause[] {
  return clauseTexts.map((text, i) => {
    const { category, risk, rationale } = classifyClauseText(text);
    return {
      id: `c${i + 1}`,
      index: i + 1,
      text,
      category,
      risk,
      plainLanguage: summarizePlainLanguage(text),
      rationale,
      // The rule-based analyzer is confident about pattern matches but this
      // is fundamentally a lower-fidelity fallback than a live LLM read.
      confidence: risk === "info" ? 0.4 : 0.65
    };
  });
}

export function mockSummarize(
  documentId: string,
  fileName: string,
  clauses: Clause[]
): DocumentAnalysis {
  const highRisk = clauses.filter((c) => c.risk === "high");
  const documentType = /gig|platform|terms of service|driver|courier/i.test(fileName)
    ? "gig_platform_terms"
    : /lease|tenant|rental/i.test(fileName)
      ? "lease"
      : "general_contract";

  const summary =
    clauses.length === 0
      ? "No readable clauses were found in this document. It may be a scanned image without extractable text."
      : `This document has ${clauses.length} identified clauses. ${highRisk.length} were flagged as high risk ` +
        `by the offline analyzer, most commonly around termination, fees, and dispute resolution. ` +
        `Review the flagged clauses below before signing, and treat this summary as a starting point, not legal advice.`;

  return {
    documentId,
    fileName,
    documentType,
    createdAt: new Date().toISOString(),
    summary,
    keyRisks: highRisk.slice(0, 5).map((c) => c.rationale),
    clauses,
    mock: true
  };
}
