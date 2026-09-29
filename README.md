# LexVeil

LexVeil helps renters, gig workers, and everyday consumers understand a lease, gig-platform terms, or other
contract **before** they sign it — in plain language, with risky clauses flagged, and with a way to ask
follow-up questions that are answered strictly from the document itself (not a generic LLM guess). When you're
ready to talk to a real lawyer, LexVeil generates a structured prep brief so the consultation is faster and
cheaper.

**LexVeil informs and prepares. It does not replace a licensed attorney**, and every screen says so.

## Why this exists

Legal documents are dense, jargon-heavy, and consequential — and most people sign them without reading every
clause because they don't have the time, background, or $300/hour to have a lawyer walk them through it. LexVeil
targets the moment right before signing: turn a wall of legal text into (1) a plain-language summary, (2) a
risk-flagged list of clauses, (3) grounded answers to specific questions, and (4) a one-click export a lawyer can
actually use.

## Core features

| Feature | What it does |
|---|---|
| **Lease/Contract Decoder** | Upload a PDF or `.txt` document. It's split into clauses, each classified by category (termination, fees, arbitration, renewal, privacy, etc.) and risk level, with a plain-language explanation and a confidence score. |
| **Grounded Rights Navigator** | Ask follow-up questions ("What happens if I terminate early?"). Answers are restricted to the document's own clauses via retrieval, and every answer cites the specific clause(s) it relies on — no answer is invented from general knowledge. |
| **Prep-for-My-Lawyer Export** | Download a PDF brief with the summary, flagged clauses, and the questions you asked — built to save a real lawyer's time. |
| **Confidence flagging** | Low-confidence clause classifications and answers are explicitly labeled, nudging the user toward professional review instead of overtrusting the AI. |

These four map directly to the top-ranked ideas in the project's own ideation/prioritization exercise
(see `LexVeil-2-hackathon-ideation.md`): the Decoder, the Grounded Navigator, and the Lawyer Export were ranked
#1–#3 by weighted score, and were built together as a single coherent flow rather than as separate demos.

## Architecture

```
LexVeil-2/
├── server/     Express + TypeScript API (document analysis, grounded Q&A, PDF export)
└── client/     React + TypeScript + Vite UI (Tailwind CSS)
```

- **No database.** A document's parsed text and analysis live in an in-memory, TTL-expiring session store on the
  server (`server/src/services/sessionStore.ts`), keyed by a random UUID. Nothing is written to disk. This is a
  deliberate privacy choice for a tool that handles personal legal documents, and it matches the actual scale
  this needs to run at (a single demo/small-deployment server, not a multi-tenant SaaS).
- **LLM integration with graceful offline fallback.** `server/src/services/analysisService.ts` and `qaService.ts`
  call the Anthropic API (Claude) using tool-use (structured JSON) so classification and citations are reliable
  to parse. If `ANTHROPIC_API_KEY` is not set, the server automatically runs in **mock mode**
  (`server/src/mock/`): a deterministic, keyword-based analyzer and Q&A responder. This means the app is fully
  runnable, testable, and demoable with zero credentials — evaluators do not need an API key to see it work end
  to end, and the test suite doesn't depend on network access or secrets.
- **Grounded retrieval, not full-document stuffing.** `server/src/services/retrieval.ts` ranks clauses by lexical
  overlap with the user's question (falling back to the highest-risk clauses if nothing matches) so the LLM only
  ever answers from a bounded, relevant slice of the document — this is what makes citations meaningful and
  keeps answers from drifting into generic contract-law trivia.
- **Clause segmentation is heuristic, not naive.** `server/src/services/clauseSegmentation.ts` handles numbered
  clauses, paragraph breaks, and degenerate unstructured text, and caps clause count/size so a single document
  can't blow up the LLM context window or cost.

## Getting started

### Prerequisites

- Node.js 18.18+ (repo was developed/tested on Node 24)
- npm 10+

### Install

```bash
npm install
```

This installs both workspaces (`server`, `client`) via npm workspaces.

### Configure

```bash
cp .env.example server/.env
```

Leave `ANTHROPIC_API_KEY` blank to run in **mock mode** (no external calls, fully offline-demoable). To use live
Claude-powered analysis, set:

```
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-sonnet-4-5
```

Never commit `server/.env` — it's already git-ignored.

### Run in development

```bash
npm run dev:server   # http://localhost:4000
npm run dev:client   # http://localhost:5173 (proxies /api to the server)
```

Open http://localhost:5173, upload a `.pdf` or `.txt` lease/contract, and try the flow.

### Build for production

```bash
npm run build
```

### Test

```bash
npm test              # runs both server and client suites
npm run test --workspace server
npm run test --workspace client
```

The server suite (29 tests) covers clause segmentation, keyword retrieval ranking, the mock analyzer's risk
classification, session TTL expiry, PDF brief generation, and a full HTTP integration test of the documents API
(upload → analyze → chat → export → delete) via `supertest`. It runs entirely against the mock analyzer, so it
needs no API key and no network access.

The client suite (18 tests) covers upload validation (file type/size, disabled-until-valid states), the risk
badge's non-color-only labeling, clause filtering and low-confidence flagging, the chat panel's citation
rendering, the typed API client's error handling, and a full upload → analyze → ask → start-over integration
test with a mocked `fetch`.

### Lint & typecheck

```bash
npm run lint
npm run typecheck
```

## Security

- **No secrets in the repo.** The Anthropic key is read from an environment variable only; `.env` is git-ignored.
- **Small, explicit upload surface.** Only `application/pdf` and `text/plain` are accepted (both by MIME-type
  filter and by extension), with an 8 MB size cap enforced by `multer`, to avoid parsing arbitrary/malicious
  binary formats.
- **No persistence.** Uploaded documents and chat history live in memory only and expire automatically
  (`SESSION_TTL_MINUTES`), reducing the blast radius of handling other people's legal documents.
- **Rate limiting** on both upload (`uploadLimiter`) and chat (`chatLimiter`) endpoints to bound cost and abuse.
- **`helmet`** for standard security headers, and CORS locked to an explicit allow-list (`CLIENT_ORIGIN`).
- **Input validation** with `zod` on every request body and path parameter (e.g. document IDs must be valid
  UUIDs before touching the session store).
- **No stack traces or internals in error responses** — `errorHandler` always returns a safe, generic message in
  the response body and only logs details server-side outside production.
- **No `dangerouslySetInnerHTML`** anywhere in the client — all document/LLM-derived text is rendered through
  React's normal (auto-escaping) text rendering, so a malicious clause or answer can't inject markup.
- `npm audit` reports **0 vulnerabilities** in both workspaces as of the versions pinned in this repo.

## Accessibility

- Semantic landmarks (`header`, `main`, `footer`) and a "Skip to main content" link.
- Every interactive control has a visible, programmatic label (`<label htmlFor>`, `aria-label`, or both).
- Risk is never conveyed by color alone: each `RiskBadge` pairs a symbol, a text label ("High risk"), and color.
- Clause details use native `<details>/<summary>` for built-in keyboard operability and screen-reader semantics
  instead of a custom accordion widget.
- Form/API errors are announced via `role="alert"`; the chat log is an `aria-live="polite"` region so new
  answers are announced without stealing focus.
- Visible focus rings (`.focus-ring`) on all interactive elements; `prefers-reduced-motion` is respected globally.
- Filter buttons use `aria-pressed` to expose toggle state to assistive tech.

## Reliability & error handling

- Every route is wrapped so async errors reach a central error handler (`asyncHandler` + `errorHandler`) —
  nothing throws an unhandled rejection or leaks a raw stack trace to the client.
- Empty/unreadable documents (e.g. a scanned PDF with no text layer) are detected and surfaced as a clear,
  actionable message rather than a silent empty result or a 500.
- The client distinguishes "no document yet", "analyzing", "analyzed", and error states, and always shows a
  specific server-provided message rather than a generic failure banner where possible.

## Known limitations / honest scope

- **Retrieval is lexical (keyword overlap), not embeddings-based.** This was a deliberate trade-off for a
  document-scale corpus (tens to ~100 clauses per document) where a vector DB would be overhead without a
  measurable quality gain — but it means paraphrased questions with no shared vocabulary may retrieve a less
  relevant clause than a semantic retriever would.
- **PDF text extraction has no OCR.** A scanned lease with no embedded text layer will not produce clauses; the
  app detects this and tells the user, rather than pretending to analyze nothing.
- **Mock mode is intentionally simple.** It exists so the app is honestly and fully demoable/testable without
  credentials, but its keyword-rule classification is far less nuanced than the live Claude-powered path.
- **No accounts, no history across sessions.** By design (see Architecture) — this trades multi-session
  convenience for not persisting other people's legal documents.
- Live LLM calls (the non-mock path) were implemented against the current Anthropic Messages/tool-use API but
  could not be exercised end-to-end in this environment without a live API key; the mock-mode path was
  exhaustively tested and manually verified in-browser instead (see Testing above).

## License

MIT.
