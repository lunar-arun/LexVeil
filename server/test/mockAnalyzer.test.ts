import { describe, expect, it } from "vitest";
import { mockClassifyClauses, mockSummarize } from "../src/mock/mockAnalyzer.js";

describe("mockClassifyClauses", () => {
  it("flags arbitration clauses as high risk", () => {
    const [clause] = mockClassifyClauses([
      "Any dispute arising under this agreement shall be resolved through binding arbitration and you waive your right to a jury trial."
    ]);
    expect(clause?.risk).toBe("high");
    expect(clause?.category).toBe("arbitration_and_disputes");
  });

  it("flags auto-renewal clauses as medium risk", () => {
    const [clause] = mockClassifyClauses([
      "This subscription will automatically renew for successive one-year terms unless cancelled."
    ]);
    expect(clause?.risk).toBe("medium");
    expect(clause?.category).toBe("renewal_and_auto_renewal");
  });

  it("assigns info/other for clauses matching no known pattern", () => {
    const [clause] = mockClassifyClauses(["The parties acknowledge receipt of this document."]);
    expect(clause?.risk).toBe("info");
    expect(clause?.category).toBe("other");
  });

  it("assigns sequential ids and indexes", () => {
    const clauses = mockClassifyClauses(["first clause text here", "second clause text here"]);
    expect(clauses.map((c) => c.id)).toEqual(["c1", "c2"]);
    expect(clauses.map((c) => c.index)).toEqual([1, 2]);
  });
});

describe("mockSummarize", () => {
  it("infers lease document type from filename", () => {
    const clauses = mockClassifyClauses(["Tenant shall pay rent monthly."]);
    const analysis = mockSummarize("doc-1", "my-apartment-lease.pdf", clauses);
    expect(analysis.documentType).toBe("lease");
    expect(analysis.mock).toBe(true);
  });

  it("handles documents with no extractable clauses", () => {
    const analysis = mockSummarize("doc-2", "scanned.pdf", []);
    expect(analysis.clauses).toHaveLength(0);
    expect(analysis.summary).toMatch(/no readable clauses/i);
  });
});
