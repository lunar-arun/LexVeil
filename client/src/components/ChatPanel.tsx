import { useId, useState } from "react";
import type { ChatMessage, Clause } from "../types";

interface ChatPanelProps {
  chatHistory: ChatMessage[];
  clauses: Clause[];
  onAsk: (question: string) => Promise<void>;
  isSending: boolean;
  error: string | null;
}

export function ChatPanel({ chatHistory, clauses, onAsk, isSending, error }: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const inputId = useId();
  const clauseById = new Map(clauses.map((c) => [c.id, c]));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || isSending) return;
    setQuestion("");
    await onAsk(trimmed);
  }

  return (
    <section aria-labelledby="chat-heading" className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 id="chat-heading" className="text-lg font-semibold text-gray-900">
        Ask about this document
      </h2>
      <p className="mt-1 text-sm text-gray-600">
        Answers are grounded in the document&apos;s actual clauses and cite the clause number they rely on.
      </p>

      <ul className="mt-4 max-h-96 space-y-3 overflow-y-auto" aria-live="polite" aria-label="Conversation history">
        {chatHistory.length === 0 && (
          <li className="text-sm text-gray-500">
            Try asking: &ldquo;What happens if I terminate early?&rdquo; or &ldquo;Can this be automatically
            renewed?&rdquo;
          </li>
        )}
        {chatHistory.map((message, i) => (
          <li
            key={i}
            className={
              message.role === "user"
                ? "ml-auto max-w-[85%] rounded-lg bg-blue-700 px-3 py-2 text-sm text-white"
                : "mr-auto max-w-[85%] rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-900"
            }
          >
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.lowConfidence && message.role === "assistant" && (
              <p className="mt-1 text-xs italic text-gray-600">
                Low confidence — consider verifying this with the original text or a professional.
              </p>
            )}
            {message.citations && message.citations.length > 0 && (
              <div className="mt-2 space-y-1 border-t border-gray-300 pt-2">
                {message.citations.map((citation, ci) => {
                  const clause = clauseById.get(citation.clauseId);
                  return (
                    <p key={ci} className="text-xs text-gray-600">
                      <span className="font-medium">
                        {clause ? `Clause ${clause.index}` : "Source"}:
                      </span>{" "}
                      &ldquo;{citation.snippet}&rdquo;
                    </p>
                  );
                })}
              </div>
            )}
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <label htmlFor={inputId} className="sr-only">
          Ask a question about this document
        </label>
        <input
          id={inputId}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about this document…"
          maxLength={1000}
          disabled={isSending}
          className="focus-ring flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm disabled:bg-gray-50"
        />
        <button
          type="submit"
          disabled={isSending || question.trim().length === 0}
          className="focus-ring shrink-0 rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          {isSending ? "Thinking…" : "Ask"}
        </button>
      </form>
    </section>
  );
}
