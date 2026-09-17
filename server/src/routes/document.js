import express from 'express';
import { upload } from '../middleware/upload.js';
import { extractText } from '../services/pdfParser.js';
import { validateTextInput, validateQuestion, sanitizeText } from '../utils/validation.js';
import { analyzeDocument, askQuestion, generateBrief, initGemini } from '../services/geminiService.js';
import { createSession, getSession, addChatMessage, getChatHistory } from '../services/documentStore.js';

const router = express.Router();

router.post('/upload', upload.single('document'), async (req, res, next) => {
  try {
    let documentText = '';

    if (req.file) {
      const parsed = await extractText(req.file.buffer);
      documentText = parsed.text;
    } else if (req.body && req.body.text) {
      const validation = validateTextInput(req.body.text);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error, code: 400 });
      }
      documentText = sanitizeText(req.body.text);
    } else {
      return res.status(400).json({ error: 'Please provide a PDF file or text content', code: 400 });
    }

    const aiClient = initGemini();
    const analysis = await analyzeDocument(aiClient, documentText);
    
    const sessionId = createSession(documentText, analysis);

    res.json({
      id: sessionId,
      summary: analysis.summary,
      documentType: analysis.documentType,
      clauses: analysis.clauses,
      originalText: documentText
    });

  } catch (error) {
    next(error);
  }
});

router.post('/:id/ask', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    const session = getSession(id);
    if (!session) {
      return res.status(404).json({ error: 'Document session not found. Please upload the document again.', code: 404 });
    }

    const validation = validateQuestion(question);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error, code: 400 });
    }

    const aiClient = initGemini();
    const chatHistory = getChatHistory(id) || [];
    const result = await askQuestion(aiClient, question, session.originalText, chatHistory);

    addChatMessage(id, 'user', question, null);
    addChatMessage(id, 'assistant', result.answer, result.citations);

    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/export', async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = getSession(id);
    if (!session) {
      return res.status(404).json({ error: 'Document session not found. Please upload the document again.', code: 404 });
    }

    const aiClient = initGemini();
    const chatHistory = getChatHistory(id) || [];
    const brief = await generateBrief(aiClient, session.analysis, chatHistory);

    res.json(brief);
  } catch (error) {
    next(error);
  }
});

export default router;
