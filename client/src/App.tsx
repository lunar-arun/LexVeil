import { useCallback, useState } from "react";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { UploadPanel } from "./components/UploadPanel";
import { SummaryPanel } from "./components/SummaryPanel";
import { OriginalDocPanel } from "./components/OriginalDocPanel";
import { ClauseList } from "./components/ClauseList";
import { ChatPanel } from "./components/ChatPanel";
import { ApiError, askQuestion, deleteDocument, uploadDocument } from "./api/client";
import type { ChatMessage, DocumentAnalysis } from "./types";

function LexVeilIcon() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <linearGradient id="lv-grad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#3730a3" />
        </linearGradient>
      </defs>
      <rect width="44" height="44" rx="12" fill="url(#lv-grad)" />
      <line x1="22" y1="10" x2="22" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="10" r="2.2" fill="white" />
      <line x1="9" y1="16" x2="35" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="11" y1="16" x2="11" y2="22" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="33" y1="16" x2="33" y2="22" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 22 Q11 28 15 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M29 22 Q33 28 37 22" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <line x1="16" y1="34" x2="28" y2="34" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="16" y1="34" x2="14" y2="36" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <line x1="28" y1="34" x2="30" y2="36" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export default function App() {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
  const [selectedClauseId, setSelectedClauseId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);

  const handleUpload = useCallback(async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const result = await uploadDocument(file);
      setAnalysis(result);
      setChatHistory([]);
    } catch (err) {
      setUploadError(err instanceof ApiError ? err.message : "Something went wrong while analyzing the file.");
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleAsk = useCallback(
    async (question: string) => {
      if (!analysis) return;
      setChatError(null);
      setChatHistory((prev) => [...prev, { role: "user", content: question, createdAt: new Date().toISOString() }]);
      setIsSending(true);
      try {
        const message = await askQuestion(analysis.documentId, question);
        setChatHistory((prev) => [...prev, message]);
      } catch (err) {
        setChatError(err instanceof ApiError ? err.message : "Something went wrong answering that question.");
      } finally {
        setIsSending(false);
      }
    },
    [analysis]
  );

  const handleStartOver = useCallback(async () => {
    if (analysis) {
      await deleteDocument(analysis.documentId).catch(() => undefined);
    }
    setAnalysis(null);
    setSelectedClauseId(null);
    setChatHistory([]);
    setUploadError(null);
    setChatError(null);
  }, [analysis]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <DisclaimerBanner />

      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <LexVeilIcon />
            <div>
              <h1 className="text-xl font-bold text-indigo-600 tracking-tight leading-none">LexVeil</h1>
              <p className="text-xs text-gray-400 mt-0.5">Understand your legal documents</p>
            </div>
          </div>

          {analysis && (
            <button
              type="button"
              onClick={handleStartOver}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New Document
            </button>
          )}
        </div>
      </header>

      <main id="main-content" className={`flex-1 mx-auto w-full px-4 py-8 ${analysis ? "max-w-7xl" : "max-w-2xl"}`}>
        {/* Upload state */}
        {!analysis && (
          <div className="space-y-4">
            <UploadPanel onUpload={handleUpload} isUploading={isUploading} />
            {uploadError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {uploadError}
              </p>
            )}
          </div>
        )}

        {/* Analysis dashboard */}
        {analysis && (
          <div className="space-y-6">
            {/* Overview card */}
            <SummaryPanel analysis={analysis} />

            {/* Split-screen: original doc | analyzed clauses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <OriginalDocPanel
                clauses={analysis.clauses}
                selectedClauseId={selectedClauseId}
              />
              <ClauseList
                clauses={analysis.clauses}
                selectedClauseId={selectedClauseId}
                onSelectClause={setSelectedClauseId}
              />
            </div>

            {/* Q&A */}
            <ChatPanel
              chatHistory={chatHistory}
              clauses={analysis.clauses}
              onAsk={handleAsk}
              isSending={isSending}
              error={chatError}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-gray-400">
            LexVeil provides general information to help you prepare, not legal advice. Consult a licensed attorney for anything consequential.
          </p>
          <p className="text-xs text-gray-400">
            Done by <span className="text-gray-600 font-medium">Arun</span>
            {" · "}Built by <span className="text-indigo-500 font-medium">Claude</span>
            {" + "}<span className="text-gray-600 font-medium">Antigravity</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
