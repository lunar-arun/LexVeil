import { useId, useRef, useState } from "react";

const ACCEPTED_TYPES = ["application/pdf", "text/plain"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

interface UploadPanelProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

type Tab = "pdf" | "text";

function CloudUploadIcon({ style }: { style?: React.CSSProperties }) {
  return (
    <svg
      style={style}
      viewBox="0 0 56 48"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Cloud shape */}
      <path d="M38 36H40a10 10 0 0 0 0-20h-1.26A14 14 0 1 0 12 28.4V36" />
      <path d="M22 36h12" />
      {/* Arrow up */}
      <polyline points="22 26 28 20 34 26" />
      <line x1="28" y1="20" x2="28" y2="38" />
    </svg>
  );
}

export function UploadPanel({ onUpload, isUploading }: UploadPanelProps) {
  const [activeTab, setActiveTab] = useState<Tab>("pdf");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) return "Only PDF or plain text (.txt) files are supported.";
    if (file.size > MAX_SIZE_BYTES) return "File is too large. The maximum size is 8 MB.";
    return null;
  }

  function handleFileChange(file: File | null) {
    if (!file) { setSelectedFile(null); return; }
    const error = validate(file);
    setValidationError(error);
    setSelectedFile(error ? null : file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0] ?? null);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (activeTab === "pdf" && selectedFile) {
      onUpload(selectedFile);
    } else if (activeTab === "text" && pastedText.trim()) {
      const blob = new Blob([pastedText], { type: "text/plain" });
      onUpload(new File([blob], "pasted-document.txt", { type: "text/plain" }));
    }
  }

  function switchTab(tab: Tab) {
    setActiveTab(tab);
    setValidationError(null);
    setSelectedFile(null);
  }

  const canSubmit = !isUploading && (activeTab === "pdf" ? !!selectedFile : pastedText.trim().length > 0);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #e2e5ee",
        boxShadow: "0 4px 24px 0 rgba(60,72,100,0.08)",
        overflow: "hidden",
      }}
    >
      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #e2e5ee" }}>
        {/* Upload PDF Tab */}
        <button
          type="button"
          onClick={() => switchTab("pdf")}
          style={{
            flex: 1,
            height: "72px",
            fontSize: "20px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            borderBottom: activeTab === "pdf" ? "2.5px solid #4338ff" : "none",
            background: activeTab === "pdf" ? "#eef1ff" : "#fff",
            color: activeTab === "pdf" ? "#4338ff" : "#4b5563",
            transition: "all 0.15s",
            outline: "none",
            position: "relative",
          }}
        >
          Upload PDF
        </button>

        {/* Vertical divider */}
        <div style={{ width: "1px", background: "#e2e5ee", flexShrink: 0 }} />

        {/* Paste Text Tab */}
        <button
          type="button"
          onClick={() => switchTab("text")}
          style={{
            flex: 1,
            height: "72px",
            fontSize: "20px",
            fontWeight: 600,
            cursor: "pointer",
            border: "none",
            borderBottom: activeTab === "text" ? "2.5px solid #4338ff" : "none",
            background: activeTab === "text" ? "#eef1ff" : "#fff",
            color: activeTab === "text" ? "#4338ff" : "#4b5563",
            transition: "all 0.15s",
            outline: "none",
          }}
        >
          Paste Text
        </button>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} style={{ padding: "32px 40px 36px" }}>
        {activeTab === "pdf" && (
          <>
            {/* Drop Zone */}
            <div
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              role="button"
              tabIndex={0}
              aria-label="Upload PDF file"
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? "#4338ff" : selectedFile ? "#4338ff" : "#a5afc1"}`,
                borderRadius: "10px",
                background: isDragging ? "#f0f1ff" : "#fff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                minHeight: "220px",
                transition: "border-color 0.15s, background 0.15s",
              }}
            >
              <CloudUploadIcon
                style={{
                  width: "54px",
                  height: "54px",
                  color: selectedFile ? "#4338ff" : "#9ca8bf",
                  marginBottom: "20px",
                }}
              />

              {selectedFile ? (
                <>
                  <p style={{ fontSize: "18px", fontWeight: 600, color: "#4338ff", textAlign: "center" }}>
                    {selectedFile.name}
                  </p>
                  <p style={{ fontSize: "15px", color: "#6b7280", marginTop: "8px", textAlign: "center" }}>
                    {(selectedFile.size / 1024).toFixed(0)} KB · Click to change
                  </p>
                </>
              ) : (
                <>
                  <p style={{ fontSize: "19px", color: "#374151", textAlign: "center", lineHeight: 1.4 }}>
                    Drag and drop your PDF here, or{" "}
                    <span style={{ color: "#4338ff" }}>click to browse</span>
                  </p>
                  <p style={{ fontSize: "17px", color: "#6b7a99", marginTop: "12px", textAlign: "center" }}>
                    Only PDF files are supported
                  </p>
                </>
              )}
            </div>

            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept=".pdf,.txt"
              aria-describedby={validationError ? errorId : undefined}
              aria-invalid={validationError ? true : undefined}
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              style={{ display: "none" }}
            />

            {validationError && (
              <p id={errorId} role="alert" style={{ marginTop: "12px", fontSize: "14px", color: "#dc2626" }}>
                {validationError}
              </p>
            )}
          </>
        )}

        {activeTab === "text" && (
          <div>
            <label
              htmlFor="paste-text"
              style={{ display: "block", fontSize: "15px", fontWeight: 500, color: "#4b5563", marginBottom: "10px" }}
            >
              Paste your contract or lease text
            </label>
            <textarea
              id="paste-text"
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Paste the full text of your document here…"
              rows={9}
              style={{
                width: "100%",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "#f9fafb",
                padding: "14px 16px",
                fontSize: "15px",
                color: "#1f2937",
                resize: "none",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            <p style={{ marginTop: "6px", fontSize: "13px", color: "#9ca3af" }}>
              {pastedText.length.toLocaleString()} characters
            </p>
          </div>
        )}

        {/* Analyze Button */}
        <button
          type="submit"
          disabled={!canSubmit}
          style={{
            marginTop: "28px",
            width: "100%",
            height: "60px",
            borderRadius: "8px",
            border: "none",
            fontSize: "19px",
            fontWeight: 600,
            cursor: canSubmit ? "pointer" : "not-allowed",
            background: canSubmit ? "#4338ff" : "#d1d5db",
            color: "#fff",
            transition: "background 0.15s",
          }}
        >
          {isUploading ? "Analyzing document…" : "Analyze Document"}
        </button>
        <p aria-live="polite" style={{ position: "absolute", left: "-9999px" }}>
          {isUploading ? "Analyzing your document, please wait." : ""}
        </p>
      </form>
    </div>
  );
}
