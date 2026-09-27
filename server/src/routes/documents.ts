import { Router } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { config } from "../config.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { HttpError } from "../utils/httpError.js";
import { isSupportedMimeType, extractText } from "../services/textExtraction.js";
import { analyzeDocument } from "../services/analysisService.js";
import { answerQuestion } from "../services/qaService.js";
import { generateBriefPdf } from "../services/briefService.js";
import { sessionStore } from "../services/sessionStore.js";
import { uploadLimiter, chatLimiter } from "../middleware/rateLimiters.js";
import type { DocumentSession } from "../types.js";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxUploadBytes, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!isSupportedMimeType(file.mimetype)) {
      cb(new Error("UNSUPPORTED_FILE_TYPE"));
      return;
    }
    cb(null, true);
  }
});

const documentIdSchema = z.string().uuid();
const chatRequestSchema = z.object({
  question: z.string().trim().min(1, "Question cannot be empty").max(1000, "Question is too long")
});

function requireSession(documentId: string | undefined): DocumentSession {
  const parseResult = documentIdSchema.safeParse(documentId);
  if (!parseResult.success) {
    throw new HttpError(400, "Invalid document id.");
  }
  const session = sessionStore.get(parseResult.data);
  if (!session) {
    throw new HttpError(404, "Document not found. It may have expired - try uploading it again.");
  }
  return session;
}

router.post(
  "/",
  uploadLimiter,
  (req, res, next) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        if (err.message === "UNSUPPORTED_FILE_TYPE") {
          res.status(415).json({ error: "Only PDF and plain text (.txt) files are supported." });
          return;
        }
        next(err);
        return;
      }
      next();
    });
  },
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new HttpError(400, "No file was uploaded. Attach a PDF or .txt file as 'file'.");
    }

    const fullText = await extractText(req.file.buffer, req.file.mimetype);
    if (fullText.trim().length === 0) {
      throw new HttpError(422, "No readable text could be extracted from this file.");
    }

    const documentId = uuidv4();
    const analysis = await analyzeDocument(documentId, req.file.originalname, fullText);

    const session: DocumentSession = {
      documentId,
      fileName: req.file.originalname,
      fullText,
      analysis,
      chatHistory: [],
      createdAt: Date.now(),
      lastAccessedAt: Date.now()
    };
    sessionStore.set(session);

    res.status(201).json({ analysis });
  })
);

router.get(
  "/:documentId",
  asyncHandler(async (req, res) => {
    const session = requireSession(req.params.documentId);
    res.json({ analysis: session.analysis, chatHistory: session.chatHistory });
  })
);

router.post(
  "/:documentId/chat",
  chatLimiter,
  asyncHandler(async (req, res) => {
    const session = requireSession(req.params.documentId);
    const parsed = chatRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new HttpError(400, parsed.error.errors[0]?.message ?? "Invalid request.");
    }

    const userMessage = { role: "user" as const, content: parsed.data.question, createdAt: new Date().toISOString() };
    const assistantMessage = await answerQuestion(parsed.data.question, session.analysis.clauses);

    session.chatHistory.push(userMessage, assistantMessage);

    res.json({ message: assistantMessage });
  })
);

router.get(
  "/:documentId/brief",
  asyncHandler(async (req, res) => {
    const session = requireSession(req.params.documentId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="legal-prep-brief.pdf"`);
    const pdfDoc = generateBriefPdf(session);
    pdfDoc.pipe(res);
  })
);

router.delete(
  "/:documentId",
  asyncHandler(async (req, res) => {
    const parseResult = documentIdSchema.safeParse(req.params.documentId);
    if (!parseResult.success) {
      throw new HttpError(400, "Invalid document id.");
    }
    sessionStore.delete(parseResult.data);
    res.status(204).send();
  })
);

export default router;
