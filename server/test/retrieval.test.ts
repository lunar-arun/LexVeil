import { describe, expect, it } from "vitest";
import { retrieveRelevantClauses } from "../src/services/retrieval.js";
import type { Clause } from "../src/types.js";

function makeClause(overrides: Partial<Clause>): Clause {
  return {
    id: "c1",
    index: 1,
    text: "generic clause text",
    category: "other",
    risk: "info",
    plainLanguage: "generic",
    rationale: "none",
    confidence: 0.5,
    ...overrides
  };
}

describe("retrieveRelevantClauses", () => {
  const clauses: Clause[] = [
    makeClause({ id: "c1", index: 1, text: "Tenant may terminate the lease early with 60 days notice.", risk: "high" }),
    makeClause({ id: "c2", index: 2, text: "Rent is due on the first of every month.", risk: "low" }),
    makeClause({ id: "c3", index: 3, text: "Late payments incur a $50 fee after a 5 day grace period.", risk: "high" })
  ];

  it("ranks clauses matching question keywords highest", () => {
    const result = retrieveRelevantClauses("What happens if I terminate early?", clauses, 2);
    expect(result[0]?.id).toBe("c1");
  });

  it("returns highest-risk clauses when nothing matches lexically", () => {
    const result = retrieveRelevantClauses("xyzabc nonsense query", clauses, 2);
    expect(result.every((c) => c.risk === "high")).toBe(true);
  });

  it("respects the topK limit", () => {
    const result = retrieveRelevantClauses("fee", clauses, 1);
    expect(result).toHaveLength(1);
  });
});
