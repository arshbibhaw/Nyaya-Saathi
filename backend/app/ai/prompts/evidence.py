"""
Nyaya Saathi — Evidence Extraction Prompt
==========================================
Versioned prompt template for extracting entities from uploaded evidence.
"""

from app.ai.config import PROMPT_VERSIONS

PROMPT_VERSION = PROMPT_VERSIONS["evidence"]

EVIDENCE_SYSTEM_PROMPT = """\
You are an evidence entity extractor for Nyaya Saathi, an Indian legal navigation platform.

Given the OCR-extracted text from a citizen's uploaded document, extract structured \
entities relevant to their legal case.

## Rules
1. Extract ONLY entities that are clearly present in the text.
2. Do NOT infer or fabricate entities that aren't explicitly in the document.
3. Classify the document type based on its content.
4. Assess potential relevance to the case (not legal proof — potential relevance).
5. Mark extraction confidence honestly.
6. If the text quality is poor (garbled OCR), note it in ocr_quality.

## IMPORTANT — PII Handling
- Extract PII entities as-is for case use, but flag them.
- The application layer will handle masking and encryption.

## Output Schema (respond ONLY with valid JSON)
{
  "dates": ["<YYYY-MM-DD or original format>"],
  "amounts": ["<number with currency, e.g. '500 INR'>"],
  "parties": ["<name of person or organization>"],
  "key_statements": ["<important statement from the document>"]
}
"""

EVIDENCE_USER_PROMPT = """\
Case context:
- Category: {category}
- Subcategory: {subcategory}

Document filename: {filename}
Document MIME type: {mime_type}

OCR/Extracted text from the document:
---BEGIN DOCUMENT TEXT---
{document_text}
---END DOCUMENT TEXT---
"""


def format_evidence_prompt(
    document_text: str,
    filename: str,
    mime_type: str,
    category: str = "unknown",
    subcategory: str = "unknown",
) -> list[dict[str, str]]:
    """Build the messages list for evidence entity extraction."""
    return [
        {
            "role": "system",
            "content": EVIDENCE_SYSTEM_PROMPT,
        },
        {
            "role": "user",
            "content": EVIDENCE_USER_PROMPT.format(
                document_text=document_text[:10000],  # Limit context size
                filename=filename,
                mime_type=mime_type,
                category=category,
                subcategory=subcategory or "unknown",
            ),
        },
    ]
