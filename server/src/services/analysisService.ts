import type Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { getAnthropicClient, MODEL } from "./llmClient.js";
import { segmentIntoClauses } from "./clauseSegmentation.js";
import { mockClassifyClauses, mockSummarize } from "../mock/mockAnalyzer.js";
import type { Clause, ClauseCategory, DocumentAnalysis, RiskLevel } from "../types.js";

const ANALYSIS_TOOL_NAME = "record_document_analysis";

const CLAUSE_CATEGORIES: ClauseCategory[] = [
  "termination",
  "fees_and_payments",
  "liability",
  "arbitration_and_disputes",
  "privacy_and_data",
  "renewal_and_auto_renewal",
  "obligations",
  "rights",
  "other"
];

const RISK_LEVELS: RiskLevel[] = ["high", "medium", "low", "info"];

const analysisTool = {
  name: ANALYSIS_TOOL_NAME,
  description:
    "Records a structured analysis of a legal document (e.g. lease, gig platform terms of service) for a non-lawyer reader.",
  input_schema: {
    type: "object" as const,
    properties: {
      documentType: {
        type: "string",
        enum: ["lease", "gig_platform_terms", "general_contract"]
      },
      summary: {
        type: "string",
        description: "A 3-5 sentence plain-language summary of the whole document for a non-lawyer."
      },
      keyRisks: {
        type: "array",
        items: { type: "string" },
        description: "Up to 5 short bullet points naming the most important risks in this document."
      },
      clauses: {
        type: "array",
        items: {
          type: "object",
          properties: {
            index: { type: "integer", description: "1-based index matching the input clause list" },
            category: { type: "string", enum: CLAUSE_CATEGORIES },
            risk: { type: "string", enum: RISK_LEVELS },
            plainLanguage: { type: "string", description: "1-2 sentence plain-language explanation" },
            rationale: { type: "string", description: "Why this risk level was assigned" },
            confidence: { type: "number", description: "0 to 1 confidence in this classification" }
          },
          required: ["index", "category", "risk", "plainLanguage", "rationale", "confidence"]
        }
      }
    },
    required: ["documentType", "summary", "keyRisks", "clauses"]
  }
};

const SYSTEM_PROMPT = `You are a legal-document literacy assistant. You help everyday individuals (renters, \
gig workers, consumers) understand contracts BEFORE they sign or act on them. You do not provide legal advice \
and you always encourage users to consult a qualified professional for anything consequential. Be accurate, \
conservative, and flag ambiguity rather than guessing. Assign risk levels based on real-world consequence to \
the individual (financial loss, loss of rights, difficulty exiting the agreement), not just legal novelty.`;

export async function analyzeDocument(
  documentId: string,
  fileName: string,
  fullText: string
): Promise<DocumentAnalysis> {
  const clauseTexts = segmentIntoClauses(fullText);

  if (config.mockMode) {
    const clauses = mockClassifyClauses(clauseTexts);
    return mockSummarize(documentId, fileName, clauses);
  }

  if (clauseTexts.length === 0) {
    return {
      documentId,
      fileName,
      documentType: "general_contract",
      createdAt: new Date().toISOString(),
      summary:
        "No readable text clauses were found in this document. It may be a scanned image without a text layer.",
      keyRisks: [],
      clauses: [],
      mock: false
    };
  }

  const numberedClauses = clauseTexts.map((text, i) => `[${i + 1}] ${text}`).join("\n\n");

  const anthropic = getAnthropicClient();
  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: [analysisTool],
    tool_choice: { type: "tool", name: ANALYSIS_TOOL_NAME },
    messages: [
      {
        role: "user",
        content:
          `Analyze the following document, named "${fileName}". It has been split into numbered clauses. ` +
          `Classify every clause and produce an overall summary.\n\n${numberedClauses}`
      }
    ]
  });

  const toolUse = response.content.find(
    (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
  );

  if (!toolUse) {
    throw new Error("LLM did not return a structured analysis");
  }

  const parsed = toolUse.input as {
    documentType: DocumentAnalysis["documentType"];
    summary: string;
    keyRisks: string[];
    clauses: Array<{
      index: number;
      category: ClauseCategory;
      risk: RiskLevel;
      plainLanguage: string;
      rationale: string;
      confidence: number;
    }>;
  };

  const clauseByIndex = new Map(parsed.clauses.map((c) => [c.index, c]));

  const clauses: Clause[] = clauseTexts.map((text, i) => {
    const index = i + 1;
    const match = clauseByIndex.get(index);
    return {
      id: `c${index}`,
      index,
      text,
      category: match?.category ?? "other",
      risk: match?.risk ?? "info",
      plainLanguage: match?.plainLanguage ?? text.slice(0, 200),
      rationale: match?.rationale ?? "The model did not classify this clause; review it manually.",
      confidence: match?.confidence ?? 0.3
    };
  });

  return {
    documentId,
    fileName,
    documentType: parsed.documentType,
    createdAt: new Date().toISOString(),
    summary: parsed.summary,
    keyRisks: parsed.keyRisks,
    clauses,
    mock: false
  };
}

