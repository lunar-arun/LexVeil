import { useId, useRef, useEffect, useState } from "react";
import type { ChatMessage, Clause } from "../types";

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  clauses: Clause[];
  onAsk: (question: string) => Promise<void>;
  isSending: boolean;
  error: string | null;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12 px-6 text-center">
      <div className="rounded-2xl bg-indigo-50 border border-indigo-100 p-5 mb-4">
        <svg className="w-8 h-8 text-indigo-400 mx-auto" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-1">Ask anything about your document</p>
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
        e.g. &ldquo;What happens if I break this lease early?&rdquo;
      </p>
      <p className="text-xs text-gray-400 max-w-xs leading-relaxed mt-1">
        e.g. &ldquo;Can they change my pay without notice?&rdquo;
      </p>
    </div>
  );
}

export function ChatPanel({ chatHistory, clauses, onAsk, isSending, error }: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const inputId = useId();
  const bottomRef = useRef<HTMLDivElement>(null);
  const clauseById = new Map(clauses.map((c) => [c.id, c]));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isSending) return;
    setQuestion("");
    await onAsk(trimmed);
  }

  return (
    <section
      aria-labelledby="chat-heading"
      className="rounded-2xl border border-gray-200 bg-white shadow-sm flex flex-col overflow-hidden"
      style={{ minHeight: "420px" }}
    >
      {/* Header */}
      <div className="shrink-0 border-b border-gray-100 px-6 py-4">
        <h2 id="chat-heading" className="text-base font-semibold text-gray-900">
          Ask About Your Document
        </h2>
        <p className="mt-0.5 text-xs text-gray-400">
          Every answer cites the specific clause it&apos;s based on.
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {chatHistory.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="space-y-4" aria-live="polite" aria-label="Conversation history">
            {chatHistory.map((message, i) => (
              <li
                key={i}
                className={
                  message.role === "user"
                    ? "flex justify-end"
                    : "flex justify-start"
                }
              >
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-indigo-600 px-4 py-2.5 text-sm text-white shadow-sm"
                      : "max-w-[80%] rounded-2xl rounded-tl-sm border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 shadow-sm"
                  }
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>

                  {message.lowConfidence && message.role === "assistant" && (
                    <p className="mt-1.5 text-xs italic text-gray-400">
                      Low confidence — verify with the original text or a professional.
                    </p>
                  )}

                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-2.5 space-y-1.5 border-t border-gray-200 pt-2.5">
                      {message.citations.map((citation, ci) => {
                        const clause = clauseById.get(citation.clauseId);
                        return (
                          <p key={ci} className="text-xs text-gray-400">
                            <span className="font-semibold text-gray-500">
                              {clause ? `Clause ${clause.index}` : "Source"}:
                            </span>{" "}
                            &ldquo;{citation.snippet}&rdquo;
                          </p>
                        );
                      })}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p role="alert" className="mx-6 mb-2 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Input bar */}
      <div className="shrink-0 border-t border-gray-100 bg-gray-50 px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <label htmlFor={inputId} className="sr-only">
            Ask a question about this document
          </label>
          <input
            id={inputId}
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about your document…"
            maxLength={1000}
            disabled={isSending}
            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={isSending || question.trim().length === 0}
            className="shrink-0 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSending ? "…" : "Send"}
          </button>
        </form>
        <p aria-live="polite" className="sr-only">
          {isSending ? "Thinking, please wait." : ""}
        </p>
      </div>
    </section>
  );
}
