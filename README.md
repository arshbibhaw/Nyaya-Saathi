# Nyaya Saathi

**AI-Assisted Legal Navigation for Every Citizen**

Live Demo: [nyaayasaathi.vercel.app](https://nyaayasaathi.vercel.app) | Repository: [github.com/arshbibhaw/Nyaya-Saathi](https://github.com/arshbibhaw/Nyaya-Saathi)

---

## The Problem

India has over 50 million pending court cases and a legal aid infrastructure that reaches only a fraction of citizens who need it. When an ordinary person faces a legal problem — a cyber fraud, a tenancy dispute, a consumer complaint, workplace harassment — they rarely know what their rights are, which authority to approach, or what steps to take first.

Legal information exists. It is scattered across official portals, bare acts, and government websites — inaccessible to someone without a law degree and unusable in an emergency.

**Nyaya Saathi closes that gap.** It turns a citizen's plain-language description of a problem into a structured, verified action plan backed by authoritative legal sources — in minutes, not weeks.

---

## What It Does

A user describes their legal problem in plain language. Nyaya Saathi does the rest:

1. **Classifies** the issue into the correct legal domain (cyber crime, consumer protection, tenancy, labour law, etc.)
2. **Asks targeted follow-up questions** to surface the details that matter for that domain
3. **Parses uploaded evidence** — PDFs, screenshots, photos of documents — using OCR to extract dates, parties, amounts, and relevant facts
4. **Retrieves grounded legal information** from a curated knowledge base of authoritative Indian legal sources using RAG, with mandatory source citations
5. **Generates a personalised action plan** — a step-by-step resolution path with semantic status (completed, current, waiting)
6. **Drafts supporting documents** — complaint letters, notices, and formal filings — pre-filled with the user's extracted evidence
7. **Escalates when needed** — surfaces direct links to the National Cyber Crime Reporting Portal, eCourts Services, NALSA, and qualified legal professionals

The core design principle: **Problem → Context → Evidence → Legal Information → Sources → Action Plan → Human Assistance**

---

## Why This Is Different

Most legal-tech tools are either search engines (they show you laws, not what to do) or generic AI assistants (they hallucinate statutes). Nyaya Saathi is neither.

**Hallucination is treated as a safety issue, not just a quality issue.** Every legal claim in the output is grounded in retrieved source chunks from the knowledge base. If the system cannot retrieve sufficient authoritative material to answer confidently, it says so — it does not fabricate a section number or a procedure.

**Evidence is a first-class input.** The platform does not just answer questions; it reads the user's documents and builds the action plan around what those documents actually contain.

**Output is structured, not conversational.** The AI does not return Markdown prose. It returns typed JSON — semantic action steps, cited sources, extracted entities — so the frontend can render a professional, navigable interface rather than a chat transcript.

---

## Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend API | FastAPI, Python, Pydantic |
| Database | PostgreSQL + pgvector, SQLAlchemy, Alembic |
| AI Orchestration | LangChain / LlamaIndex |
| LLM | GPT-4o / Gemini 1.5 (configurable) |
| Embeddings | text-embedding-3-large (or equivalent) |
| Document Processing | PyMuPDF (native PDFs), pytesseract (scanned/image PDFs) |
| Infrastructure | Docker, docker-compose, CI/CD via GitHub Actions |

### Repository Structure

```
nyaya-saathi/
├── frontend/                   # Next.js application
│   └── src/
│       ├── app/                # App Router pages and layouts
│       ├── components/         # UI components (shadcn/ui based)
│       ├── hooks/              # Custom React hooks
│       ├── lib/                # API client, utilities
│       └── store/              # State management
├── backend/
│   └── app/
│       ├── api/v1/             # Route handlers (auth, cases, evidence, plans)
│       ├── db/                 # Database configuration
│       ├── models/             # SQLAlchemy ORM models
│       ├── schemas/            # Pydantic validation schemas
│       └── ai/
│           ├── rag/            # Retrieval pipeline
│           ├── ocr/            # Document intelligence
│           └── prompts/        # Modular, versioned prompt library
├── infrastructure/docker/      # Dockerfiles and orchestration
├── data/                       # Legal knowledge base (gitignored)
└── docs/                       # Architecture and API documentation
```

### AI Pipeline in Detail

**RAG — Ingestion**

Legal source material is ingested from India Code, eCourts Services, NALSA, and the National Cyber Crime Reporting Portal. Documents are chunked hierarchically (Act → Chapter → Section) with metadata tags for jurisdiction, domain, and authority tier. Chunks are embedded and stored in pgvector.

**RAG — Retrieval**

1. The user's colloquial query is transformed into legal terminology before retrieval
2. Vector similarity search runs against pgvector
3. Results are hard-filtered by domain and jurisdiction to prevent cross-contamination (criminal law chunks do not appear in a civil tenancy query)
4. The top 3–5 chunks are injected into the LLM context
5. The LLM is constrained to cite the exact Section and Act for every legal claim it makes

**OCR — Document Intelligence**

PyMuPDF handles native PDF text extraction. pytesseract handles image-based PDFs and screenshots (bank SMS screenshots, chat exports, photos of paper receipts). The extractor prompt surfaces dates, named parties, monetary amounts, and case-relevant facts as structured JSON, which feeds directly into the action plan generator.

**Prompt Architecture**

All prompts are stored modularly in `backend/app/ai/prompts/` and versioned. Three core prompt types:

- **Classifier** — determines legal domain, enforces JSON output via Pydantic
- **Extractor** — pulls structured entities from OCR text
- **Generator** — produces action plans and document drafts in a tone that is objective, reassuring, and explicitly non-advisory

### Database Schema

| Table | Purpose |
|---|---|
| `users` | Account data, password hashes, preferred language |
| `cases` | Legal issue metadata, domain classification, status |
| `case_questions` | Multi-turn intake Q&A per case |
| `evidence` | Uploaded file references, extracted text, metadata |
| `action_plans` | Structured step JSON with semantic status per case |
| `documents` | Generated complaint/notice drafts per case |
| `legal_sources` | Vector embeddings of curated legal knowledge base |

### Key API Routes

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/cases/                          # Initialise case
POST   /api/v1/cases/{case_id}/chat            # Multi-turn AI conversation
POST   /api/v1/cases/{case_id}/evidence        # Upload + trigger OCR
GET    /api/v1/cases/{case_id}/plan            # Fetch action plan
GET    /api/v1/cases/{case_id}/document        # Fetch generated draft
```

---

## Security and Privacy

Legal cases involve some of the most sensitive personal data people hold. Security is not an afterthought.

- All data in transit is encrypted via TLS. Storage encryption is applied where the infrastructure provider supports it.
- Evidence files are stored in access-controlled object storage. There are no public file URLs — access is via short-lived signed links tied to the authenticated session.
- Every case-level API call verifies ownership before serving data.
- Logs are designed to avoid capturing sensitive content. Full document text, ID numbers, bank account numbers, and OTPs are masked or excluded at the logging layer.
- An audit trail records all privileged operations against a case.
- Case data and evidence are not used to train third-party foundation models. Data is not sold to advertisers or data brokers.
- Compliant with India's Digital Personal Data Protection Act, 2023.

Full policies are available in [`docs/PRIVACY_POLICY.md`](docs/) and [`docs/TERMS_AND_CONDITIONS.md`](docs/).

---

## User Experience

The interface is built around one idea: **legal navigation should feel calm, not overwhelming.**

The design uses a sleek dark theme with obsidian backgrounds and electric indigo/teal accents — deliberately avoiding the clinical white of government portals and the generic feel of most AI chat interfaces.

**Core flows:**

- **Guided Intake Wizard** — four-step structured intake that adapts its follow-up questions based on the classified domain. Not a blank chat box.
- **Case Dashboard** — an inbox-style Active Matters view that shows all open cases with their current action step, so users can pick up where they left off.
- **Case Workspace** — tabbed interface: Overview, Action Plan, Evidence, Document Draft. The action plan renders as a semantic step-list, not a wall of text. Each step has a status, and the current step is highlighted.
- **Evidence Panel** — drag-and-drop upload with an automatic extraction preview so the user can see what the system read from their document before it goes into the plan.

The platform explicitly tells users when it cannot answer with sufficient confidence, and it always surfaces a pathway to human legal assistance. It is not designed to replace lawyers — it is designed to make sure people know what they are dealing with before they walk into a lawyer's office, or decide they do not need one.

---

## Scope of Legal Coverage (v1.0)

The current knowledge base covers the most common citizen-facing legal domains in India:

- Cyber crime (financial fraud, phishing, identity theft)
- Consumer protection
- Residential tenancy disputes
- Labour and workplace rights
- Domestic violence and harassment (escalation-first)
- RTI (Right to Information) filings
- Motor accident claims

Domain coverage is designed to expand via the ingestion pipeline without changes to the application layer.

---

## Scalability and Roadmap

**The architecture is designed to scale horizontally from day one.**

- The backend is stateless (JWT auth, no server-side sessions), deployable behind a load balancer
- The vector database (pgvector) can be migrated to a managed service (Pinecone, Weaviate) without changes to the retrieval pipeline
- The LLM provider is abstracted behind a configuration parameter — switching between GPT-4o, Gemini, and Claude requires no code changes
- The knowledge base ingestion pipeline is a standalone script, runnable on a schedule to pull updated source material from official portals

**Near-term roadmap:**

- Voice input support (regional language) via Whisper transcription + multilingual embeddings
- WhatsApp interface via Twilio to reach users without smartphone apps
- Integration with the eCourts Services API for real-time case status lookups
- Verified legal professional directory with in-platform referral flow

**Impact projection:**

India has approximately 900 million smartphone users and a legal aid infrastructure with approximately 1.5 million empanelled advocates under NALSA. The gap between people who need legal guidance and people who can access it is structural. A platform that works in plain language, runs on a phone, and costs nothing to use addresses that gap directly. Even at modest adoption, the first-mover advantage in verified, RAG-grounded legal navigation for Indian law is significant.

---

## Legal Disclaimer

Nyaya Saathi is a legal information and navigation platform. It is not a law firm and does not provide legal advice or representation. Nothing on the platform constitutes an attorney-client relationship. AI-generated content should be verified against official sources and reviewed by a qualified advocate before being relied upon for time-sensitive or high-stakes matters. See [Terms & Conditions](docs/) for full terms.

---

## Team

Built for Prasunethon 2.0 | Version 1.0 — Pilot Build

Nyaya Saathi is an open project. Contributions, issue reports, and knowledge base expansions are welcome.
