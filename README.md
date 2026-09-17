# LexVeil — Legal Document Decoder

**LexVeil** is an AI-powered tool that helps individuals — renters, gig workers, everyday consumers — understand legal documents before they sign or act on them.

> **Important:** LexVeil is an assistive tool. It explains what's in your document — it does **not** provide legal advice, make legal determinations, or replace consultation with a qualified attorney.

## What It Does

1. **Document Decoder** — Upload a lease, contract, or terms of service (PDF or pasted text). LexVeil breaks it down into a plain-language summary and flags individual clauses by risk level (low / medium / high), with exact source citations.

2. **Grounded Q&A** — Ask questions about your document ("What happens if I break this lease early?"). Every answer cites the specific clause it's based on. If the document doesn't contain enough information, LexVeil says so rather than guessing.

3. **"Prep for My Lawyer" Export** — Generate a structured brief summarizing the flagged issues, your questions, and suggested topics to discuss with an attorney. Download as a PDF you can bring to a consultation.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express |
| AI | Google Gemini API (gemini-3.5-flash / gemini-3.1-flash-lite) |
| PDF Parsing | pdf-parse |

## Setup

### Prerequisites

- Node.js 20+ installed
- A free Google Gemini API key

### Get a Free Gemini API Key

1. Visit [aistudio.google.com](https://aistudio.google.com)
2. Sign in with your Google account
3. Click "Get API Key" → "Create API key"
4. Copy the key — no billing setup required (free tier)

### Install & Run

```bash
# Clone the repository
git clone <repo-url>
cd legal_eye

# Set up environment
cp .env.example .env
# Edit .env and paste your Gemini API key

# Install dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Start both frontend and backend
npm run dev
```

The app will be available at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001

## Project Structure

```
legal_eye/
├── server/           # Express backend
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # PDF parsing, Gemini, storage
│   │   ├── middleware/   # Error handling, file upload
│   │   └── utils/        # Input validation
│   └── tests/            # Unit tests
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components
│       ├── hooks/        # Custom React hooks
│       └── services/     # API client, PDF export
├── .env.example      # Required environment variables
└── README.md
```

## Important Framing

LexVeil is designed to **assist, not replace** professional legal counsel:

- Every AI-generated interpretation is linked to the exact source text it came from
- Ambiguous or unclear clauses are flagged as "review recommended" rather than assigned a confident risk label
- The app never states that a clause is "illegal" or "unenforceable" — it identifies what is unusual and worth discussing with a professional
- A persistent disclaimer reminds users that the tool provides explanations, not legal advice

## License

MIT
