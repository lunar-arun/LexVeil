export type RiskLevel = "high" | "medium" | "low" | "info";

export type ClauseCategory =
  | "termination"
  | "fees_and_payments"
  | "liability"
  | "arbitration_and_disputes"
  | "privacy_and_data"
  | "renewal_and_auto_renewal"
  | "obligations"
  | "rights"
  | "other";

export interface Clause {
  /** Stable id used for citations, e.g. "c3" */
  id: string;
  /** 1-based position in the document, for display order */
  index: number;
  /** Original clause text, verbatim from the source document */
  text: string;
  category: ClauseCategory;
  risk: RiskLevel;
  /** Plain-language, one or two sentence explanation of this clause */
  plainLanguage: string;
  /** Why this risk level was assigned, or why it's flagged */
  rationale: string;
  /** 0-1 confidence in this classification; low confidence should be surfaced to the user */
  confidence: number;
}

export interface DocumentAnalysis {
  documentId: string;
  fileName: string;
  documentType: "lease" | "gig_platform_terms" | "general_contract";
  createdAt: string;
  summary: string;
  keyRisks: string[];
  clauses: Clause[];
  /** True when produced by the offline rule-based analyzer rather than a live LLM */
  mock: boolean;
}

export interface ChatCitation {
  clauseId: string;
  snippet: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
  lowConfidence?: boolean;
  createdAt: string;
}

export interface DocumentSession {
  documentId: string;
  fileName: string;
  fullText: string;
  analysis: DocumentAnalysis;
  chatHistory: ChatMessage[];
  createdAt: number;
  lastAccessedAt: number;
}
