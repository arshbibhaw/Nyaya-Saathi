# Nyaya Saathi: Master Technical Specification

> **Note:** This document is the primary reference for the Agent and Engineering Team for coding and planning. It synthesizes all technical requirements, UI/UX aesthetics, database architectures, and AI/RAG pipelines.

## 1. Product Requirements & Features
**Goal:** Convert a citizen's natural-language problem into a structured legal action plan.

**Core Workflows:**
1. **User Input:** Natural language issue description via text/voice.
2. **Issue Classification:** AI determines the legal domain.
3. **Evidence Extraction:** OCR parses uploaded PDFs/images (dates, entities).
4. **Information Retrieval:** RAG pulls grounded legal truths from the knowledge base.
5. **Action Plan:** Generation of a step-by-step resolution path.
6. **Document Draft:** Generation of complaints/notices based on extracted evidence.
7. **Escalation:** Flagging complex issues for human legal aid.

## 2. Frontend UI/UX Guidelines (Next.js)

### Design Philosophy (Premium & Dynamic)
The platform must feel premium, modern, and highly responsive. Avoid generic colors and boring layouts.
* **Theme:** Sleek dark mode by default, utilizing glassmorphism for overlays and modals.
* **Typography:** `Inter` or `Outfit` (Google Fonts) for clean, modern readability. 
* **Colors:** Deep obsidian backgrounds (`#0F172A`) with vibrant primary accents like electric indigo (`#4F46E5`) and teal (`#0D9488`) for interactive elements.
* **Animations:** Subtle micro-animations on hover (using Framer Motion). Slide-in transitions for chat messages and evidence uploads.
* **Components:** Use `shadcn/ui` combined with Tailwind CSS for consistent, accessible UI elements.

### Key Pages
1. **Landing/Auth:** Glassmorphic login cards, vibrant gradient backgrounds.
2. **Dashboard:** Case timeline view (past issues, ongoing action plans).
3. **Chat Navigator (The Core):** A conversational UI that doesn't just look like ChatGPT, but rather a structured form that builds dynamically.
4. **Action Plan & Document Viewer:** Split-screen layout (Chat on the left, generated document preview on the right).

## 3. Backend Architecture (FastAPI)

### Database Schemas (PostgreSQL + pgvector)
Defined via SQLAlchemy/Alembic.

* **Users Table:** `id`, `email`, `password_hash`, `created_at`
* **Cases Table:** `id`, `user_id`, `domain`, `status`, `summary`, `created_at`
* **CaseQuestions Table:** `id`, `case_id`, `question`, `answer`, `timestamp`
* **Evidence Table:** `id`, `case_id`, `file_name`, `mime_type`, `extracted_text`, `metadata` (JSON)
* **ActionPlans Table:** `id`, `case_id`, `steps` (JSON), `status`
* **Documents Table:** `id`, `case_id`, `doc_type`, `content`, `generated_at`
* **LegalSources Table (pgvector):** `id`, `title`, `source_url`, `chunk_text`, `embedding` (vector), `metadata` (JSON for domain/jurisdiction)

### Key API Routes (`/api/v1`)
* `POST /auth/register` & `POST /auth/login` (Returns JWT)
* `POST /cases/` (Initialize a new legal issue)
* `POST /cases/{case_id}/chat` (Handles the multi-turn AI conversation)
* `POST /cases/{case_id}/evidence` (Handles multipart/form-data for PDF/image uploads, triggers OCR)
* `GET /cases/{case_id}/plan` (Fetches the generated action plan)
* `GET /cases/{case_id}/document` (Fetches the generated draft)

## 4. AI & LLM Implementation

### Stack
* **Orchestration:** LangChain or LlamaIndex.
* **LLM:** Advanced model (e.g., GPT-4o, Claude 3.5, or Gemini 1.5) for complex reasoning.
* **Embeddings:** Text-embedding-v3 or similar.

### Prompts & Strategy
Prompts must be stored modularly in `backend/app/ai/prompts/`.
1. **Classifier Prompt:** "Given this text, classify into one of the following legal domains..." (Enforce JSON output via Pydantic/function calling).
2. **Extractor Prompt:** "Extract dates, names, and monetary amounts from the following OCR text..."
3. **Generator Prompt:** Must enforce a specific tone: *Objective, reassuring, authoritative but clearly stating it is not legal advice.*

## 5. RAG Implementation

### Ingestion Pipeline
1. Ingest official Acts and rules (India Code, Consumer Protection portals).
2. Clean text and chunk hierarchically (Act -> Chapter -> Section).
3. Attach metadata (Jurisdiction, Authority, Tier) to every chunk.

### Retrieval Pipeline
1. **Query Transformation:** Convert user's colloquial query into legal keywords.
2. **Vector Search:** Perform similarity search against `pgvector`.
3. **Metadata Filtering:** Hard-filter by jurisdiction or domain to prevent cross-contamination (e.g., using criminal law for a civil rental dispute).
4. **Context Injection:** Pass the top 3-5 most relevant chunks to the LLM. 
5. **Citations:** The LLM MUST cite the exact Section/Act retrieved in its final response. 

## 6. Document Intelligence (OCR)
* Use `PyMuPDF` (fitz) for rapid text extraction from native PDFs.
* Fallback to `pytesseract` for image-based PDFs or screenshots of chats/receipts.
