import type { Clause, ChatMessage } from "../types.js";
import { retrieveRelevantClauses } from "../services/retrieval.js";

/**
 * Deterministic offline answer used when no live LLM is configured. It is
 * intentionally conservative: it surfaces the most relevant clauses
 * verbatim with their rationale rather than attempting to synthesize a
 * confident-sounding answer it cannot actually reason its way to.
 */
export function mockAnswerQuestion(question: string, clauses: Clause[]): ChatMessage {
  const relevant = retrieveRelevantClauses(question, clauses, 3);

  if (relevant.length === 0) {
    return {
      role: "assistant",
      content:
        "I couldn't find clauses in this document related to that question. Try rephrasing, or ask about a specific topic like fees, termination, or renewal.",
      lowConfidence: true,
      createdAt: new Date().toISOString()
    };
  }

  const lines = relevant.map(
    (c) => `- Clause ${c.index} (${c.category.replace(/_/g, " ")}, ${c.risk} risk): ${c.plainLanguage}`
  );

  return {
    role: "assistant",
    content:
      `Based on the clauses that most closely match your question:\n\n${lines.join("\n")}\n\n` +
      `This is an offline, rule-based answer (no live AI model configured) — it is not a legal ` +
      `interpretation. For a binding answer, review the cited clauses in full or consult a professional.`,
    citations: relevant.map((c) => ({ clauseId: c.id, snippet: c.text.slice(0, 240) })),
    lowConfidence: true,
    createdAt: new Date().toISOString()
  };
}
