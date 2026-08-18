# Nyaya Saathi

> From Legal Confusion to Clear Action.

Nyaya Saathi is an AI-assisted legal-access platform designed to help citizens navigate common legal problems through understandable legal information, evidence organization, actionable next steps, and structured document generation.

Instead of functioning as a generic legal chatbot, Nyaya Saathi focuses on the complete journey from a citizen's problem to a clear and informed course of action.

## Problem

Legal information may be publicly available, but accessing and understanding it can still be difficult for ordinary citizens.

People often struggle to:

* Understand complex legal terminology.
* Identify the relevant legal domain or provision.
* Determine what action should be taken next.
* Understand which documents or evidence are required.
* Prepare structured complaints or applications.
* Identify the appropriate authority or source of assistance.
* Know when professional legal assistance is necessary.

This creates a gap between **having access to legal information** and **being able to act on it effectively**.

## Solution

Nyaya Saathi bridges this gap through an AI-assisted legal navigation workflow:

```text
Citizen's Problem
       |
       v
AI Issue Understanding
       |
       v
Verified Legal Information
       |
       v
Evidence Analysis
       |
       v
Personalized Action Plan
       |
       v
Document Generation
       |
       v
Appropriate Legal Assistance
```

The core philosophy of the platform is:

**Problem → Law → Evidence → Action**

## Key Features

### 1. AI Legal Navigator

Users can describe their legal problem using natural language instead of having to know specific legal terminology.

The system identifies the likely legal domain and asks relevant follow-up questions to better understand the situation.

### 2. Verified Legal RAG

Nyaya Saathi uses Retrieval-Augmented Generation to ground AI responses in a curated legal knowledge base.

```text
User Query
    |
    v
Query Understanding
    |
    v
Vector Retrieval
    |
    v
Relevant Legal Sources
    |
    v
Context-Aware LLM
    |
    v
Grounded Response
```

The objective is to reduce unsupported AI-generated claims and provide source-aware legal information.

### 3. Evidence Analyzer

Users can upload relevant documents such as:

* PDFs
* Agreements
* Screenshots
* Invoices
* Emails
* Other supporting documents

The system can extract structured information such as:

* Dates
* Names
* Amounts
* Important statements
* Potential evidence
* Missing information

### 4. Smart Action Plans

Instead of returning a large block of legal information, Nyaya Saathi converts the identified issue into a sequential action plan.

For example:

```text
Identify the issue
       |
Collect relevant evidence
       |
Review applicable procedure
       |
Prepare required documentation
       |
Follow the appropriate official process
       |
Seek professional assistance if required
```

### 5. Document Generator

Based on the collected case information, Nyaya Saathi can generate structured drafts such as:

* Complaints
* Applications
* Grievances
* Notices
* Supporting statements

Generated documents are intended as drafts for user review and do not replace professional legal advice.

### 6. Human-in-the-Loop Escalation

Complex or high-risk cases should not be handled solely through automated guidance.

Nyaya Saathi is designed to identify situations where users may need appropriate professional, legal-aid, or authority-level assistance.

## User Flow

```text
+----------------------+
| Describe Legal Issue |
+----------+-----------+
           |
           v
+----------------------+
| AI Issue Detection   |
+----------+-----------+
           |
           v
+----------------------+
| Follow-up Questions  |
+----------+-----------+
           |
           v
+----------------------+
| Legal RAG Retrieval  |
+----------+-----------+
           |
           v
+----------------------+
| Evidence Analysis    |
+----------+-----------+
           |
           v
+----------------------+
| Smart Action Plan    |
+----------+-----------+
           |
           v
+----------------------+
| Document Generation  |
+----------+-----------+
           |
           v
+----------------------+
| Human Assistance     |
+----------------------+
```

## System Architecture

```text
                         +-------------------+
                         |       User        |
                         | Text / Voice /    |
                         | PDF / Image       |
                         +---------+---------+
                                   |
                                   v
                         +-------------------+
                         |    Frontend       |
                         | Next.js + TS      |
                         +---------+---------+
                                   |
                                   v
                         +-------------------+
                         |     FastAPI       |
                         |   Application     |
                         |      Layer        |
                         +---------+---------+
                                   |
                                   v
                         +-------------------+
                         | AI Orchestrator   |
                         +---------+---------+
                                   |
                +------------------+------------------+
                |                  |                  |
                v                  v                  v
        +-------------+    +-------------+    +-------------+
        | Classifier  |    | RAG Engine  |    | OCR / NLP   |
        +-------------+    +------+------+    +-------------+
                                  |
                                  v
                       +----------------------+
                       | Legal Knowledge Base |
                       +----------+-----------+
                                  |
                                  v
                       +----------------------+
                       | PostgreSQL + pgvector|
                       +----------------------+
```

## AI and RAG Pipeline

The AI pipeline follows a retrieval-grounded approach.

### 1. Input Processing

The system accepts:

* Natural-language queries
* Documents
* Images
* Potentially voice input in future versions

### 2. Preprocessing

Text and documents are processed using:

* Language detection
* Text normalization
* OCR
* Entity extraction
* Document parsing

### 3. Legal Issue Classification

The user's problem is classified into an appropriate legal domain.

Example:

```text
"My employer has not paid my salary for three months."

                |
                v

Legal Domain: Employment / Labour
                |
                v

Potential Issue: Unpaid Wages
```

### 4. Retrieval

The query is converted into an embedding and compared against the legal knowledge base.

```text
User Query
    |
    v
Embedding
    |
    v
Vector Search
    |
    v
Top Relevant Sources
```

### 5. Context Construction

Relevant retrieved information is combined with the user's case context.

### 6. LLM Response Generation

The language model generates:

* Simplified legal explanations
* Relevant information
* Evidence requirements
* Action plans
* Document drafts

### 7. Safety and Validation Layer

The response should be checked for:

* Unsupported claims
* Missing context
* High-risk situations
* Need for professional assistance

## Technology Stack

| Layer               | Technology                     |
| ------------------- | ------------------------------ |
| Frontend            | Next.js                        |
| Language            | TypeScript                     |
| UI                  | Tailwind CSS, shadcn/ui        |
| Backend             | FastAPI                        |
| Backend Language    | Python                         |
| Database            | PostgreSQL                     |
| Vector Search       | pgvector                       |
| AI                  | Large Language Model           |
| RAG                 | Retrieval-Augmented Generation |
| Embeddings          | Embedding Model                |
| OCR                 | Tesseract / OCR Service        |
| Document Processing | PyMuPDF                        |
| Authentication      | JWT / OAuth                    |
| Version Control     | Git, GitHub                    |
| Deployment          | Vercel + Cloud Backend         |

## Database Structure

The initial database can be structured around the following entities:

```text
Users
  |
  +---- Cases
          |
          +---- Case Questions
          |
          +---- Evidence
          |
          +---- Action Plans
          |
          +---- Documents

Legal Sources
  |
  +---- Embeddings
```

### Core Tables

#### Users

Stores basic account and preference information.

#### Cases

Stores individual legal issues reported by users.

#### Case Questions

Stores follow-up questions and user responses.

#### Evidence

Stores uploaded evidence metadata and extracted information.

#### Legal Sources

Stores curated legal content and associated metadata.

#### Action Plans

Stores recommended actions and their status.

#### Documents

Stores generated document drafts.

## MVP Scope

The hackathon MVP focuses on one complete, polished end-to-end workflow.

### Included

* User authentication
* Natural-language legal problem input
* Legal issue classification
* Follow-up questions
* RAG-based legal information retrieval
* Source-aware responses
* PDF/image upload
* Basic OCR and evidence extraction
* Action-plan generation
* Document draft generation
* Case dashboard

### Future Scope

* Multilingual voice interface
* Regional-language support
* Advanced document understanding
* Legal-aid directory
* Lawyer integration
* Case tracking
* State-specific legal workflows
* Authority and portal integrations
* Accessibility-focused interfaces

## Example Use Case

### Cyber Fraud

A user reports:

> Someone called pretending to be a bank representative and I transferred money to them.

Nyaya Saathi can:

1. Identify the issue as a potential cyber/financial fraud.
2. Determine whether the situation may require immediate action.
3. Ask relevant follow-up questions.
4. Help organize transaction records and communication evidence.
5. Retrieve relevant authoritative guidance.
6. Provide a structured action plan.
7. Generate a complaint draft.
8. Direct the user toward appropriate official or professional assistance.

The same architecture can be extended to other domains such as:

* Consumer disputes
* Employment issues
* Rental disputes
* Cybercrime
* Financial fraud
* Property-related issues
* Government grievances
* Other common legal-access scenarios

## Project Roadmap

### Phase 1 — Hackathon MVP

* AI Legal Navigator
* Legal RAG
* Evidence Upload
* Smart Action Plans
* Document Generation

### Phase 2 — Beta Platform

* Multilingual support
* Voice interface
* Advanced OCR
* Case dashboard
* Legal-aid directory

### Phase 3 — Legal Assistance Network

* Lawyer integration
* Legal-aid organizations
* Professional escalation
* Case tracking
* Authority/portal workflows

### Phase 4 — Scale

* Regional languages
* State-specific workflows
* Expanded legal knowledge base
* Accessibility features
* Institutional partnerships

## Project Structure

```text
nyaya-saathi/
|
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── public/
|
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   ├── rag/
│   │   ├── ocr/
│   │   └── utils/
│   └── requirements.txt
|
├── data/
│   └── legal_sources/
|
├── docs/
│   ├── architecture/
│   └── presentation/
|
├── .env.example
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Python 3.10+
* PostgreSQL
* Git

### Clone the Repository

```bash
git clone https://github.com/<your-username>/nyaya-saathi.git
cd nyaya-saathi
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

Create and activate a virtual environment:

```bash
cd backend

python -m venv .venv
```

Windows:

```bash
.venv\Scripts\activate
```

macOS/Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the API:

```bash
uvicorn app.main:app --reload
```

## Environment Variables

Create a `.env` file based on `.env.example`.

Example:

```env
DATABASE_URL=
LLM_API_KEY=
EMBEDDING_API_KEY=
JWT_SECRET=
VECTOR_DATABASE_URL=
```

Never commit API keys, credentials, database passwords, or other secrets to the repository.

## Responsible AI and Legal Disclaimer

Nyaya Saathi is designed as an **AI-assisted legal navigation and information platform**.

It does not replace:

* Lawyers
* Legal professionals
* Courts
* Government authorities
* Official legal advice

AI-generated information may be incomplete or incorrect. Users should verify important information against authoritative sources and seek qualified professional assistance for complex, urgent, or high-risk matters.

The platform should prioritize authoritative legal sources and clearly communicate the source and limitations of generated information wherever possible.

## Security and Privacy

Because legal cases may involve sensitive personal information, privacy and security should be treated as core product requirements.

The platform should follow principles such as:

* Data minimization
* Secure authentication
* Role-based access control
* Encryption in transit and at rest
* Secure document storage
* Controlled access to case information
* Secure handling of uploaded evidence
* No hardcoded credentials
* Appropriate data retention policies

## Future Vision

Nyaya Saathi aims to reduce the gap between **legal information and meaningful access to legal assistance**.

The long-term vision is to build an accessible legal-navigation ecosystem where citizens can move from:

```text
"I have a legal problem."

        to

"I understand my situation."

        to

"I know what I need to do next."
```

## Contribution

Contributions are welcome.

For major changes, please open an issue first to discuss the proposed changes.

When contributing:

1. Create a feature branch.
2. Keep changes focused.
3. Follow the existing project structure.
4. Add appropriate documentation.
5. Test changes before submitting a pull request.

## License

This project is currently intended as a hackathon project.

Add an appropriate open-source license before public distribution.

---

## Core Principle

**Nyaya Saathi does not replace legal professionals. It makes the path to legal help clearer.**

**Problem → Law → Evidence → Action**
