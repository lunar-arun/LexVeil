import type { ErrorRequestHandler } from "express";
import { config } from "../config.js";
import { UnsupportedFileError } from "../services/textExtraction.js";
import { HttpError } from "../utils/httpError.js";

/**
 * Central error handler. Never leaks stack traces or internal details to
 * clients (especially important since request payloads may include
 * sensitive legal document text) - only a safe message and status code.
 */
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (!config.isProduction) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof UnsupportedFileError) {
    res.status(415).json({ error: err.message });
    return;
  }

  if (err && typeof err === "object" && "code" in err && (err as { code?: string }).code === "LIMIT_FILE_SIZE") {
    res.status(413).json({ error: "File is too large." });
    return;
  }

  res.status(500).json({ error: "An unexpected error occurred. Please try again." });
};
