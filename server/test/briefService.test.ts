import { describe, expect, it } from "vitest";
import { generateBriefPdf } from "../src/services/briefService.js";
import type { DocumentSession } from "../src/types.js";

function collectPdfBuffer(session: DocumentSession): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = generateBriefPdf(session);
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

const session: DocumentSession = {
  documentId: "11111111-1111-1111-1111-111111111111",
  fileName: "lease.txt",
  fullText: "full text",
  analysis: {
    documentId: "11111111-1111-1111-1111-111111111111",
    fileName: "lease.txt",
    documentType: "lease",
    createdAt: new Date().toISOString(),
    summary: "This is a test summary.",
    keyRisks: ["High early termination fee"],
    clauses: [
      {
        id: "c1",
        index: 1,
        text: "Tenant may terminate early subject to a fee.",
        category: "termination",
        risk: "high",
        plainLanguage: "You can end the lease early but will pay a fee.",
        rationale: "Financial penalty for early exit.",
        confidence: 0.7
      }
    ],
    mock: true
  },
  chatHistory: [{ role: "user", content: "What is the fee?", createdAt: new Date().toISOString() }],
  createdAt: Date.now(),
  lastAccessedAt: Date.now()
};

describe("generateBriefPdf", () => {
  it("produces a valid PDF byte stream", async () => {
    const buffer = await collectPdfBuffer(session);
    expect(buffer.subarray(0, 5).toString()).toBe("%PDF-");
    expect(buffer.length).toBeGreaterThan(500);
  });
});
