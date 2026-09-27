import { describe, expect, it, beforeAll } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";

const app = createApp();

const SAMPLE_LEASE = `
1. Tenant shall pay rent of $1,500 per month, due on the first day of each month.

2. Tenant may terminate this lease early by providing sixty (60) days written notice, subject to an early
termination fee equal to two months' rent.

3. Any dispute arising under this agreement shall be resolved through binding arbitration, and both parties
waive their right to a jury trial or to participate in a class action.

4. This lease shall automatically renew for successive twelve-month terms unless either party provides notice
of non-renewal at least 30 days before the end of the term.
`;

describe("documents API", () => {
  let documentId: string;

  it("rejects requests with no file", async () => {
    const res = await request(app).post("/api/documents");
    expect(res.status).toBe(400);
  });

  it("rejects unsupported file types", async () => {
    const res = await request(app)
      .post("/api/documents")
      .attach("file", Buffer.from("not a real image"), { filename: "photo.png", contentType: "image/png" });
    expect(res.status).toBe(415);
  });

  it("analyzes an uploaded text document and flags risky clauses", async () => {
    const res = await request(app)
      .post("/api/documents")
      .attach("file", Buffer.from(SAMPLE_LEASE), { filename: "sample-lease.txt", contentType: "text/plain" });

    expect(res.status).toBe(201);
    expect(res.body.analysis).toBeDefined();
    expect(res.body.analysis.clauses.length).toBeGreaterThan(0);
    expect(res.body.analysis.clauses.some((c: { risk: string }) => c.risk === "high")).toBe(true);
    expect(res.body.analysis.mock).toBe(true);

    documentId = res.body.analysis.documentId;
  });

  it("retrieves a previously analyzed document by id", async () => {
    const res = await request(app).get(`/api/documents/${documentId}`);
    expect(res.status).toBe(200);
    expect(res.body.analysis.documentId).toBe(documentId);
    expect(res.body.chatHistory).toEqual([]);
  });

  it("returns 404 for an unknown document id", async () => {
    const res = await request(app).get("/api/documents/00000000-0000-0000-0000-000000000000");
    expect(res.status).toBe(404);
  });

  it("returns 400 for a malformed document id", async () => {
    const res = await request(app).get("/api/documents/not-a-uuid");
    expect(res.status).toBe(400);
  });

  it("answers a grounded question about the document", async () => {
    const res = await request(app)
      .post(`/api/documents/${documentId}/chat`)
      .send({ question: "What happens if I terminate the lease early?" });

    expect(res.status).toBe(200);
    expect(res.body.message.role).toBe("assistant");
    expect(typeof res.body.message.content).toBe("string");
  });

  it("rejects an empty question", async () => {
    const res = await request(app).post(`/api/documents/${documentId}/chat`).send({ question: "  " });
    expect(res.status).toBe(400);
  });

  it("generates a downloadable PDF brief", async () => {
    const res = await request(app).get(`/api/documents/${documentId}/brief`);
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toBe("application/pdf");
  });

  it("deletes a document session on request", async () => {
    const del = await request(app).delete(`/api/documents/${documentId}`);
    expect(del.status).toBe(204);

    const after = await request(app).get(`/api/documents/${documentId}`);
    expect(after.status).toBe(404);
  });

  it("sets security headers via helmet", async () => {
    const res = await request(app).get("/api/health");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
  });
});
