import { describe, expect, it } from "vitest";
import { segmentIntoClauses } from "../src/services/clauseSegmentation.js";

describe("segmentIntoClauses", () => {
  it("splits numbered clauses into separate segments", () => {
    const text = `
1. Tenant shall pay rent of $1,200 on the first of each month without exception whatsoever.

2. Tenant may terminate this lease early by providing sixty days written notice to landlord.

3. Landlord shall maintain the property in habitable condition throughout the tenancy period.
    `;

    const clauses = segmentIntoClauses(text);

    expect(clauses).toHaveLength(3);
    expect(clauses[0]).toContain("pay rent");
    expect(clauses[1]).toContain("terminate this lease");
    expect(clauses[2]).toContain("habitable condition");
  });

  it("drops fragments shorter than the minimum clause length", () => {
    const text = "1. Ok.\n\n2. This is a much longer clause that clearly exceeds the minimum length threshold.";
    const clauses = segmentIntoClauses(text);
    expect(clauses).toHaveLength(1);
    expect(clauses[0]).toContain("longer clause");
  });

  it("returns an empty array for empty input", () => {
    expect(segmentIntoClauses("")).toEqual([]);
    expect(segmentIntoClauses("   \n\n   ")).toEqual([]);
  });

  it("falls back to fixed-size chunking for a single giant unstructured block", () => {
    const longText = "This agreement contains many important terms and conditions. ".repeat(400);
    const clauses = segmentIntoClauses(longText);
    expect(clauses.length).toBeGreaterThan(1);
    expect(clauses.length).toBeLessThanOrEqual(120);
  });
});
