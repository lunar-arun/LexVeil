import pdfParse from "pdf-parse";

export class UnsupportedFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedFileError";
  }
}

const SUPPORTED_MIME_TYPES = new Set(["application/pdf", "text/plain"]);

export function isSupportedMimeType(mimeType: string): boolean {
  return SUPPORTED_MIME_TYPES.has(mimeType);
}

/**
 * Extracts raw text from an uploaded document buffer. Only PDF and plain
 * text are supported deliberately: these are the formats renters and gig
 * workers actually receive leases/ToS in, and keeping the surface small
 * avoids parsing untrusted binary formats (e.g. macro-bearing Office docs).
 */
export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "text/plain") {
    return buffer.toString("utf-8");
  }

  if (mimeType === "application/pdf") {
    const result = await pdfParse(buffer);
    return result.text;
  }

  throw new UnsupportedFileError(`Unsupported file type: ${mimeType}`);
}
