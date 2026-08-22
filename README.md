# Nyaya Saathi ⚖️
> **Tagline:** A calm, trustworthy digital companion that helps ordinary people navigate legal problems.

Nyaya Saathi is a production-level, AI-assisted legal navigation platform designed for citizens who know they have a legal problem but do not know what to do next. We are building a real software product that connects users to concrete next steps and human assistance, not just a generic AI chatbot.

The core philosophy of the platform is:
**Problem → Context → Evidence → Legal Information → Sources → Action Plan → Human Assistance**

---

## 🎯 Our Hackathon Goal
The objective is to win by demonstrating a **fully functional end-to-end workflow** that proves usability, security, and real-world impact.

A citizen should not have to understand the entire legal system before knowing what to do next. We solve this through:
1. **Guided Intake Wizard:** Structured collection of problem details and context.
2. **Evidence Analyzer:** Organizing uploaded documents (PDFs/screenshots) and extracting insights.
3. **Verified Legal RAG:** Grounded AI responses using authoritative legal sources (no hallucinations).
4. **Smart Action Plans:** Step-by-step personalized roadmaps with semantic states (completed, current, waiting).
5. **Human Assistance Discovery:** Built-in pathways to find official reporting portals and legal aid.

---

## 🏗️ Project Architecture & Tech Stack

This repository uses a structured monorepo approach designed for parallel development.

### Tech Stack
| Domain | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router), TypeScript, Tailwind CSS 4, shadcn/ui |
| **Backend API** | FastAPI, Python, Pydantic |
| **Database** | PostgreSQL, SQLAlchemy, Alembic (Currently SQLite for local dev) |
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
* Build a calm, trustworthy UI using a warm beige/ivory light theme (Slate/New York palette). Avoid neon, gradients, and heavy glassmorphism.
* Implement the Next.js App Router, Auth screens, and Inbox-style Active Matters Dashboard.
* Build the 4-step New Case Wizard and the Tabbed Case Workspace (Action Plan, Evidence, Overview, Chat).

### Teammate 2: Backend & AI Engineer (Core Logic)
**Domain:** `backend/app/api/v1` and `backend/app/ai`
* Build the FastAPI routes.
* Manage LLM integrations and Prompt Engineering (`backend/app/ai/prompts`).
* Ensure AI output is served as highly structured JSON (semantic steps, source citations) rather than raw Markdown.

### Teammate 3: Data & Infrastructure Engineer
**Domain:** `backend/app/db`, `backend/app/models`, `infrastructure/`, `data/`
* Setup PostgreSQL, pgvector, and SQLAlchemy models.
* Build the ingestion scripts for the Legal Knowledge Base.
* Implement OCR for evidence extraction (`backend/app/ai/ocr`).
* Manage Docker orchestration and CI/CD pipelines.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have installed: Node.js, Python 3.10+, SQLite/PostgreSQL, and Git.

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
uvicorn main:app --reload
```

*(Alternatively, use `docker-compose up` once the infrastructure is configured).*

---

## 🌿 Git Strategy
* **NEVER** push directly to `main`.
* Create branches in the format: `feature/your-feature-name` or `feat/ui-ux-redesign`.
* Open a Pull Request for review before merging.
* Ensure no secrets (API keys, passwords) are committed. Our `.gitignore` handles `.env` files automatically.

> **Let's build something impactful and win this hackathon!** 🏆
