import { config } from "../config.js";
import type { DocumentSession } from "../types.js";

/**
 * Sessions live in memory only, never on disk, and expire automatically.
 * Legal documents (leases, contracts) are sensitive; the smallest safe
 * footprint for a demo/hackathon-scale tool is to never persist them and to
 * bound how long they stay resident in the server's memory.
 */
export class SessionStore {
  private sessions = new Map<string, DocumentSession>();
  private ttlMs: number;
  private sweeper: ReturnType<typeof setInterval> | null = null;

  constructor(ttlMinutes = config.sessionTtlMinutes) {
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  startSweeper(intervalMs = 60_000) {
    if (this.sweeper) return;
    this.sweeper = setInterval(() => this.sweepExpired(), intervalMs);
    this.sweeper.unref?.();
  }

  stopSweeper() {
    if (this.sweeper) {
      clearInterval(this.sweeper);
      this.sweeper = null;
    }
  }

  set(session: DocumentSession): void {
    this.sessions.set(session.documentId, session);
  }

  get(documentId: string): DocumentSession | undefined {
    const session = this.sessions.get(documentId);
    if (!session) return undefined;
    if (this.isExpired(session)) {
      this.sessions.delete(documentId);
      return undefined;
    }
    session.lastAccessedAt = Date.now();
    return session;
  }

  delete(documentId: string): void {
    this.sessions.delete(documentId);
  }

  size(): number {
    return this.sessions.size;
  }

  private isExpired(session: DocumentSession): boolean {
    return Date.now() - session.lastAccessedAt > this.ttlMs;
  }

  private sweepExpired(): void {
    for (const [id, session] of this.sessions) {
      if (this.isExpired(session)) {
        this.sessions.delete(id);
      }
    }
  }
}

export const sessionStore = new SessionStore();
