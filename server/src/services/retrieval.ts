import type { Clause } from "../types.js";

const STOPWORDS = new Set([
  "the", "a", "an", "of", "to", "and", "or", "in", "on", "for", "is", "are",
  "this", "that", "it", "be", "by", "as", "at", "with", "will", "shall",
  "any", "if", "not", "may", "can", "do", "does", "what", "when", "how",
  "i", "my", "me", "you", "your"
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

/**
 * Ranks clauses by lexical overlap with the question. This is a deliberately
 * simple, dependency-free retrieval step (no embeddings/vector DB needed for
 * document-scale corpora of a few dozen to ~100 clauses) that keeps the
 * grounded Q&A answer restricted to clauses that are actually relevant,
 * which is what makes citations meaningful.
 */
export function retrieveRelevantClauses(
  question: string,
  clauses: Clause[],
  topK = 5
): Clause[] {
  const questionTokens = new Set(tokenize(question));
  if (questionTokens.size === 0) {
    return clauses.slice(0, topK);
  }

  const scored = clauses.map((clause) => {
    const clauseTokens = tokenize(clause.text);
    let overlap = 0;
    for (const token of clauseTokens) {
      if (questionTokens.has(token)) {
        overlap += 1;
      }
    }
    // Slightly favor higher-risk clauses on ties since they're more likely
    // to be what the user actually cares about.
    const riskBoost = clause.risk === "high" ? 0.5 : clause.risk === "medium" ? 0.25 : 0;
    return { clause, score: overlap + riskBoost };
  });

  scored.sort((a, b) => b.score - a.score);

  const relevant = scored.filter((s) => s.score > 0).slice(0, topK);
  if (relevant.length > 0) {
    return relevant.map((s) => s.clause);
  }

  // Nothing matched lexically; return the highest-risk clauses so the model
  // still has grounded context rather than answering from thin air.
  return [...clauses].sort((a, b) => riskRank(b.risk) - riskRank(a.risk)).slice(0, topK);
}

function riskRank(risk: Clause["risk"]): number {
  switch (risk) {
    case "high":
      return 3;
    case "medium":
      return 2;
    case "low":
      return 1;
    default:
      return 0;
  }
}
