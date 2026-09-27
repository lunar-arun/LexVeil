import type { ChatMessage, DocumentAnalysis } from "../types";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { error?: string };
    return body.error ?? `Request failed with status ${res.status}`;
  } catch {
    return `Request failed with status ${res.status}`;
  }
}

export async function uploadDocument(file: File): Promise<DocumentAnalysis> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/documents", { method: "POST", body: formData });
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }
  const body = (await res.json()) as { analysis: DocumentAnalysis };
  return body.analysis;
}

export async function getDocument(
  documentId: string
): Promise<{ analysis: DocumentAnalysis; chatHistory: ChatMessage[] }> {
  const res = await fetch(`/api/documents/${documentId}`);
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }
  return (await res.json()) as { analysis: DocumentAnalysis; chatHistory: ChatMessage[] };
}

export async function askQuestion(documentId: string, question: string): Promise<ChatMessage> {
  const res = await fetch(`/api/documents/${documentId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });
  if (!res.ok) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }
  const body = (await res.json()) as { message: ChatMessage };
  return body.message;
}

export function briefDownloadUrl(documentId: string): string {
  return `/api/documents/${documentId}/brief`;
}

export async function deleteDocument(documentId: string): Promise<void> {
  const res = await fetch(`/api/documents/${documentId}`, { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    throw new ApiError(res.status, await parseErrorMessage(res));
  }
}
