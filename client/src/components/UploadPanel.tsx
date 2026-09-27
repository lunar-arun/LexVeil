import { useId, useRef, useState } from "react";

const ACCEPTED_TYPES = ["application/pdf", "text/plain"];
const ACCEPTED_EXTENSIONS = ".pdf,.txt";
const MAX_SIZE_BYTES = 8 * 1024 * 1024;

interface UploadPanelProps {
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function UploadPanel({ onUpload, isUploading }: UploadPanelProps) {
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputId = useId();
  const errorId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  function validate(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Only PDF or plain text (.txt) files are supported.";
    }
    if (file.size > MAX_SIZE_BYTES) {
      return "File is too large. The maximum size is 8 MB.";
    }
    return null;
  }

  function handleFileChange(file: File | null) {
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const error = validate(file);
    setValidationError(error);
    setSelectedFile(error ? null : file);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (selectedFile) {
      onUpload(selectedFile);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900">Upload a lease or contract</h2>
      <p className="mt-1 text-sm text-gray-600">
        We support PDF and plain text files up to 8&nbsp;MB. Your document is analyzed in memory and is not stored
        permanently.
      </p>

      <div className="mt-4">
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          Document file
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          aria-describedby={validationError ? errorId : undefined}
          aria-invalid={validationError ? true : undefined}
          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          className="focus-ring mt-2 block w-full rounded-md border border-gray-300 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />
        {validationError && (
          <p id={errorId} role="alert" className="mt-2 text-sm text-red-700">
            {validationError}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={!selectedFile || isUploading}
        className="focus-ring mt-4 inline-flex items-center rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        {isUploading ? "Analyzing document…" : "Analyze document"}
      </button>
      <p aria-live="polite" className="sr-only">
        {isUploading ? "Analyzing your document, please wait." : ""}
      </p>
    </form>
  );
}
