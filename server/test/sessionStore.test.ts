import { describe, expect, it, vi, afterEach } from "vitest";
import { SessionStore } from "../src/services/sessionStore.js";
import type { DocumentSession } from "../src/types.js";

function makeSession(id: string): DocumentSession {
  return {
    documentId: id,
    fileName: "test.txt",
    fullText: "text",
    analysis: {
      documentId: id,
      fileName: "test.txt",
      documentType: "general_contract",
      createdAt: new Date().toISOString(),
      summary: "summary",
      keyRisks: [],
      clauses: [],
      mock: true
    },
    chatHistory: [],
    createdAt: Date.now(),
    lastAccessedAt: Date.now()
  };
}

describe("SessionStore", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("stores and retrieves a session", () => {
    const store = new SessionStore(60);
    store.set(makeSession("a"));
    expect(store.get("a")?.documentId).toBe("a");
  });

  it("returns undefined for an unknown id", () => {
    const store = new SessionStore(60);
    expect(store.get("unknown")).toBeUndefined();
  });

  it("expires sessions after the TTL elapses", () => {
    vi.useFakeTimers();
    const store = new SessionStore(1); // 1 minute TTL
    store.set(makeSession("a"));

    vi.advanceTimersByTime(2 * 60 * 1000);

    expect(store.get("a")).toBeUndefined();
  });

  it("deletes a session on request", () => {
    const store = new SessionStore(60);
    store.set(makeSession("a"));
    store.delete("a");
    expect(store.get("a")).toBeUndefined();
  });
});
