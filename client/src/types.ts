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
  id: string;
  index: number;
  text: string;
  category: ClauseCategory;
  risk: RiskLevel;
  plainLanguage: string;
  rationale: string;
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
