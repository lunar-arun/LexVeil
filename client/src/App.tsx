import { useCallback, useState } from "react";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { UploadPanel } from "./components/UploadPanel";
import { SummaryPanel } from "./components/SummaryPanel";
import { ClauseList } from "./components/ClauseList";
import { ChatPanel } from "./components/ChatPanel";
import { BriefExportButton } from "./components/BriefExportButton";
import { ApiError, askQuestion, deleteDocument, uploadDocument } from "./api/client";
import type { ChatMessage, DocumentAnalysis } from "./types";

export default function App() {
  const [analysis, setAnalysis] = useState<DocumentAnalysis | null>(null);
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
    setChatHistory([]);
    setUploadError(null);
    setChatError(null);
  }, [analysis]);

  return (
    <div className="min-h-screen bg-gray-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-blue-700 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">LexVeil</h1>
            <p className="text-sm text-gray-600">Understand your lease or contract before you sign</p>
          </div>
          {analysis && (
            <button
              type="button"
              onClick={handleStartOver}
              className="focus-ring rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Start over
            </button>
          )}
        </div>
      </header>

      <DisclaimerBanner />

      <main id="main-content" className="mx-auto max-w-4xl space-y-6 px-4 py-8">
        {!analysis && (
          <>
            <UploadPanel onUpload={handleUpload} isUploading={isUploading} />
            {uploadError && (
              <p role="alert" className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
                {uploadError}
              </p>
            )}
          </>
        )}

        {analysis && (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-gray-600">
                Document: <span className="font-medium text-gray-900">{analysis.fileName}</span>
              </p>
              <BriefExportButton documentId={analysis.documentId} />
            </div>
            <SummaryPanel analysis={analysis} />
            <ClauseList clauses={analysis.clauses} />
            <ChatPanel
              chatHistory={chatHistory}
              clauses={analysis.clauses}
              onAsk={handleAsk}
              isSending={isSending}
              error={chatError}
            />
          </>
        )}
      </main>

      <footer className="mx-auto max-w-4xl px-4 py-8 text-center text-xs text-gray-500">
        LexVeil provides general information to help you prepare, not legal advice. For anything consequential,
        consult a licensed attorney.
      </footer>
    </div>
  );
}
