# Nyaya Saathi ⚖️
> **Tagline:** From Legal Confusion to Clear Action.

Nyaya Saathi is a production-level, AI-assisted legal navigation platform designed for citizens who know they have a legal problem but do not know what to do next. We are building a real software product, not just a generic AI chatbot. 

The core philosophy of the platform is:
**Problem → Law → Evidence → Action**

---

## 🎯 Our Hackathon Goal
The objective is to win by demonstrating a **fully functional end-to-end workflow** that proves usability, security, and real-world impact.

A citizen should not have to understand the entire legal system before knowing what to do next. We solve this through:
1. **AI Legal Navigator:** Natural language issue detection.
2. **Verified Legal RAG:** Grounded AI responses using authoritative legal sources (no hallucinations).
3. **Evidence Analyzer:** OCR and text extraction from uploaded PDFs/screenshots.
4. **Smart Action Plans:** Step-by-step personalized roadmaps.
5. **Document Generator:** Structured legal drafts (complaints/notices) based on the user's evidence.

---

## 🏗️ Project Architecture & Tech Stack

This repository uses a structured monorepo approach designed for parallel development.

### Tech Stack
| Domain | Technology |
|---|---|
| **Frontend** | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **Backend API** | FastAPI, Python, Pydantic |
| **Database** | PostgreSQL, SQLAlchemy, Alembic |
| **AI / Vector DB**| LangChain/LlamaIndex, OpenAI/Gemini, pgvector |
| **Document Processing**| PyMuPDF, pytesseract |
| **Infrastructure** | Docker, docker-compose |

### Directory Structure
```text
nyaya-saathi/
├── .github/workflows/       # CI/CD pipelines
├── frontend/                # Next.js Application
│   ├── src/                 # Source code (app, components, hooks, lib, store)
│   └── tests/               # Frontend testing
├── backend/                 # FastAPI Application
│   ├── app/
│   │   ├── api/v1/          # Route handlers
│   │   ├── db/ & models/    # Database configuration and SQLAlchemy models
│   │   ├── schemas/         # Pydantic validation schemas
│   │   └── ai/              # Core AI logic (rag, ocr, prompts)
│   └── tests/               # Backend testing
├── infrastructure/docker/   # Dockerfiles and orchestration
├── data/                    # Ignored in git (local uploads and raw legal sources)
└── docs/                    # Architecture and API documentation
```

---

## 🤝 Team Workflow & Delegation

To move fast and avoid merge conflicts, we have divided the ownership into three distinct domains. **Stick to your assigned directories!**

### Teammate 1: Frontend Lead (UX & UI)
**Domain:** `frontend/`
* Build a premium, glassmorphic UI with vibrant accents and dark mode.
* Implement the Next.js App Router, Auth screens, and Case Dashboard.
* Build the conversational AI Chat Interface and File Upload components.

### Teammate 2: Backend & AI Engineer (Core Logic)
**Domain:** `backend/app/api/v1` and `backend/app/ai`
* Build the FastAPI routes.
* Manage LLM integrations and Prompt Engineering (`backend/app/ai/prompts`).
* Build the RAG retrieval pipeline and logic for generating Action Plans and Documents.

### Teammate 3: Data & Infrastructure Engineer
**Domain:** `backend/app/db`, `backend/app/models`, `infrastructure/`, `data/`
* Setup PostgreSQL, pgvector, and SQLAlchemy models.
* Build the ingestion scripts for the Legal Knowledge Base.
* Implement OCR for evidence extraction (`backend/app/ai/ocr`).
* Manage Docker orchestration and CI/CD pipelines.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have installed: Node.js, Python 3.10+, PostgreSQL, and Git.

### 2. Initial Setup
Clone the repository and set up your environment variables based on `.env.example`.

**Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

**Backend Setup:**
```bash
cd backend
python -m venv .venv
# Activate virtual env (Windows: .venv\Scripts\activate | Mac/Linux: source .venv/bin/activate)
pip install -r requirements.txt
uvicorn app.main:app --reload
```

*(Alternatively, use `docker-compose up` once the infrastructure is configured).*

---

## 🌿 Git Strategy
* **NEVER** push directly to `main`.
* Create branches in the format: `feature/your-feature-name` or `fix/bug-name`.
* Open a Pull Request for review before merging.
* Ensure no secrets (API keys, passwords) are committed. Our `.gitignore` handles `.env` files automatically.

> **Let's build something impactful and win this hackathon!** 🏆
