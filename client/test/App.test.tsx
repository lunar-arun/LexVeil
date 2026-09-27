import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import App from "../src/App";

const SAMPLE_ANALYSIS = {
  documentId: "11111111-1111-1111-1111-111111111111",
  fileName: "lease.txt",
  documentType: "lease",
  createdAt: new Date().toISOString(),
  summary: "This is a test lease summary.",
  keyRisks: ["Early termination fee"],
  clauses: [
    {
      id: "c1",
      index: 1,
      text: "Tenant may terminate early subject to a fee.",
      category: "termination",
      risk: "high",
      plainLanguage: "You can end the lease early but will pay a fee.",
      rationale: "Financial penalty.",
      confidence: 0.8
    }
  ],
  mock: true
};

describe("App", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString();
      const method = init?.method ?? "GET";

      if (url === "/api/documents" && method === "POST") {
        return {
          ok: true,
          status: 201,
          json: async () => ({ analysis: SAMPLE_ANALYSIS })
        } as Response;
      }
      if (url.endsWith("/chat") && method === "POST") {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            message: {
              role: "assistant",
              content: "You may owe an early termination fee per clause 1.",
              citations: [{ clauseId: "c1", snippet: "Tenant may terminate early subject to a fee." }],
              createdAt: new Date().toISOString()
            }
          })
        } as Response;
      }
      if (method === "DELETE") {
        return { ok: true, status: 204, json: async () => ({}) } as Response;
      }
      throw new Error(`Unhandled request: ${method} ${url}`);
    }) as unknown as typeof fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("supports the full upload -> analyze -> ask -> start over flow", async () => {
    const user = userEvent.setup();
    render(<App />);

    const input = screen.getByLabelText(/document file/i);
    const file = new File(["1. Tenant may terminate early."], "lease.txt", { type: "text/plain" });
    await user.upload(input, file);
    await user.click(screen.getByRole("button", { name: /analyze document/i }));

    expect(await screen.findByText(/test lease summary/i)).toBeInTheDocument();
    expect(screen.getByText(/offline demo mode/i)).toBeInTheDocument();

    const questionInput = screen.getByLabelText(/ask a question about this document/i);
    await user.type(questionInput, "What happens if I terminate early?");
    await user.click(screen.getByRole("button", { name: /^ask$/i }));

    expect(await screen.findByText(/early termination fee per clause 1/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /start over/i }));
    await waitFor(() => expect(screen.getByRole("button", { name: /analyze document/i })).toBeInTheDocument());
  });
});
