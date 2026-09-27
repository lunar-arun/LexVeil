import rateLimit from "express-rate-limit";

/** Applies to document upload/analysis - the most expensive operation (parsing + LLM call). */
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many document uploads. Please wait a few minutes and try again." }
});

/** Applies to chat questions, which are cheaper but could be spammed. */
export const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many questions in a short time. Please slow down." }
});
