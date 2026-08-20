# Nyaya Saathi — Architecture Overview

## High-Level Architecture

```
┌─────────────────┐     ┌──────────────────────────────────────┐
│   Next.js App   │────▶│          FastAPI Backend              │
│   (frontend/)   │ API │  ┌──────┐  ┌──────┐  ┌───────────┐  │
│                 │◀────│  │Routes│  │  AI  │  │  DB Layer │  │
└─────────────────┘     │  │ v1/  │──│ RAG  │──│ PostgreSQL│  │
                        │  │      │  │ OCR  │  │ pgvector  │  │
                        │  └──────┘  └──────┘  └───────────┘  │
                        └──────────────────────────────────────┘
```

## Data Flow

1. **User submits issue** → Frontend sends to `/api/v1/chat`
2. **AI Navigator** → Classifies issue, retrieves relevant law via RAG
3. **Evidence Upload** → `/api/v1/evidence/upload` → OCR extraction
4. **Action Plan** → AI generates step-by-step roadmap
5. **Document Generation** → `/api/v1/documents/generate` → legal drafts

## Key Design Decisions

- **Monorepo**: Single repo with clear ownership boundaries per teammate.
- **RAG over fine-tuning**: Grounded responses using authoritative legal sources prevent hallucinations.
- **pgvector**: Keeps vector search co-located with relational data — simpler ops.
- **Alembic migrations**: Schema changes are versioned and reproducible.
