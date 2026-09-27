import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { ApiError, askQuestion, uploadDocument } from "../src/api/client";

describe("api client", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("throws an ApiError with the server message on a failed upload", async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 415,
      json: async () => ({ error: "Only PDF and plain text (.txt) files are supported." })
    });

    const file = new File(["x"], "image.png", { type: "image/png" });
    await expect(uploadDocument(file)).rejects.toThrow(ApiError);
    await expect(uploadDocument(file)).rejects.toThrow(/only pdf and plain text/i);
  });

  it("returns the analysis on a successful upload", async () => {
    const analysis = { documentId: "1", fileName: "a.txt", clauses: [] };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ analysis })
    });

    const file = new File(["x"], "a.txt", { type: "text/plain" });
    const result = await uploadDocument(file);
    expect(result).toEqual(analysis);
  });

  it("sends the question and returns the assistant message", async () => {
    const message = { role: "assistant", content: "Answer", createdAt: new Date().toISOString() };
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ message })
    });

    const result = await askQuestion("doc-1", "What happens if I leave early?");
    expect(result).toEqual(message);
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/documents/doc-1/chat",
      expect.objectContaining({ method: "POST" })
    );
  });
});
