# Nyaya Saathi: Project Handoff & Completion Plan

The core backend infrastructure (database schemas, authentication, core API routes, and automated test suite) is **100% complete and passing**. The only remaining backend tasks belong to the AI integration scope.

Below is the complete plan for the rest of the project, including the exact instructions and context you can copy-paste to your teammates once your branch (`arsh/backend-setup`) is merged into `main`.

---

## 📌 Teammate Context & Setup Commands (Share this section)

> **Context:** "The core backend plumbing is now fully completed and foolproof. The database schema, user authentication (JWT + bcrypt), Pytest suites, and all core API endpoints (`/cases`, `/auth`, `/evidence`) are stable and tested. You can now focus entirely on your specific domains without worrying about the foundational routing or database setup."

### Backend Setup Instructions (For Teammate 2 - AI Engineer)

Once you pull from `main`, run the following commands to get the backend running locally:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Activate your virtual environment
# For Windows:
.venv\Scripts\activate
# For Mac/Linux:
source .venv/bin/activate

# 3. Install dependencies (we pinned bcrypt to <4.0.0 for Windows compatibility)
pip install -r requirements.txt

# 4. Setup your environment variables
# Copy the example and FILL IN YOUR LLM API KEYS (OpenAI/Claude/etc)
cp .env.example .env

# 5. Apply database migrations
alembic upgrade head

# 6. Run the test suite to verify everything works
pytest tests/

# 7. Start the local server
uvicorn main:app --reload
```

### Frontend Setup Instructions (For Teammate 3 - Frontend Engineer)

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install Node dependencies
npm install

# 3. Configure environment variables
# Create a .env.local file and set the backend API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1" > .env.local

# 4. Start the development server
npm run dev
```

---

## 🚀 Rest of Project Completion Plan

### Phase 1: AI Integration & RAG (Teammate 2)
**Directory Focus:** `backend/app/ai/`, `backend/app/services/case_service.py`, `backend/scripts/`

1. **Knowledge Base Ingestion:** 
   - Update `scripts/ingest_data.py` to recursively load legal PDFs/Markdown from `data/raw/`.
   - Implement LangChain text splitters and generate embeddings (e.g., OpenAI `text-embedding-3-small`).
   - Push the vectors to the `legal_sources` PostgreSQL table.
2. **Issue Classification & RAG:**
   - Remove the AI "stubs" in `case_service.py`.
   - Update `app/ai/classifier.py` to intelligently categorize the legal domain.
   - Build `app/ai/rag/retriever.py` to search `legal_sources` using `pgvector`.
3. **Structured Generation (Action Plans & Documents):**
   - Update `generate_action_plan()` and `generate_document_draft()` in `case_service.py` to use structured outputs from the LLM (returning highly structured JSON to the frontend instead of raw markdown).
4. **Entity Extraction (OCR):**
   - In `app/api/v1/evidence.py`, pipe the extracted OCR text into an LLM call to populate the `ExtractedEntities` schema (dates, amounts, involved parties).

### Phase 2: Frontend Implementation (Teammate 3)
**Directory Focus:** `frontend/src/`

1. **Authentication State:**
   - Build `/login` and `/register` pages.
   - Implement a context or global state to handle JWT tokens (storing them securely and attaching them to the `Authorization: Bearer <token>` header in Axios/Fetch requests).
2. **Dashboard & Case Management:**
   - Build the main dashboard to list cases (fetching from `GET /api/v1/cases`).
   - Create the "New Case" flow (POST to `/api/v1/cases` with `initial_issue`).
3. **Case Detail & Chat Interface:**
   - Build the interactive chat UI mapping to `POST /api/v1/cases/{case_id}/chat`.
   - Ensure the UI renders semantic steps (Action Plans) and Source Citations distinctly from standard chat text.
4. **Evidence Upload UI:**
   - Build a file dropzone mapping to `POST /api/v1/cases/{case_id}/evidence`. Ensure it handles multipart/form-data.

### Phase 3: Final Integration & Future Scope (You/Team)
- **End-to-End Testing:** Verify that a user can register, describe an issue, receive an AI-generated action plan grounded in the legal knowledge base, and upload evidence.
- **Dockerization (Future Scope):** Wrap the frontend, backend, and PostgreSQL database into `docker-compose.yml` for seamless deployment.
- **CI/CD Pipelines (Future Scope):** Setup GitHub actions for automated testing and deployment.
