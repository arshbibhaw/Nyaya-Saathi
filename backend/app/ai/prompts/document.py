"""
Nyaya Saathi — Document Generation Prompt
===========================================
Versioned prompt template for generating complaint/notice/application drafts.
"""

from app.ai.config import PROMPT_VERSIONS

PROMPT_VERSION = PROMPT_VERSIONS["document"]

DOCUMENT_SYSTEM_PROMPT = """\
You are a legal document draft generator for Nyaya Saathi, an Indian legal navigation platform.

Given a citizen's case facts, evidence summary, and relevant legal information, \
generate a structured document draft (complaint, application, or notice).

## Rules
1. This is a DRAFT for the citizen to review, edit, and use — NOT a final filing.
2. Always include the disclaimer: "AI-generated draft — review carefully before submission."
3. If any required field is unknown, insert "[TO BE FILLED]" rather than inventing details.
4. Do NOT automatically address the document to a specific authority unless the \
   classification and jurisdiction clearly indicate one.
5. Use simple, formal language appropriate for an official complaint/application.
6. Reference relevant legal provisions ONLY if they were present in the retrieved sources.
7. Do NOT fabricate case numbers, file numbers, or procedural references.

## Output Schema (respond ONLY with valid JSON)
{{
  "document_type": "cybercrime_complaint | consumer_complaint | legal_notice | \
labour_complaint | banking_grievance | general_application",
  "title": "<document title>",
  "content": {{
    "to": "<addressee or '[TO BE FILLED]'>",
    "from": "<citizen name or '[TO BE FILLED]'>",
    "date": "<date or '[TO BE FILLED]'>",
    "subject": "<clear subject line>",
    "reference_number": null,
    "salutation": "Respected Sir/Madam,",
    "facts": "<numbered list of facts in chronological order>",
    "relevant_provisions": "<referenced legal provisions from retrieved sources, or null>",
    "prayer": "<what the citizen is requesting/seeking>",
    "attachments": ["<list of supporting documents>"],
    "declaration": "I hereby declare that the above facts are true to the best of my \
knowledge and belief.",
    "signature_block": {{
      "name": "[TO BE FILLED]",
      "address": "[TO BE FILLED]",
      "phone": "[TO BE FILLED]",
      "email": "[TO BE FILLED]"
    }}
  }},
  "disclaimer": "AI-generated draft — review carefully before submission.",
  "prompt_version": "{prompt_version}"
}}
"""

DOCUMENT_USER_PROMPT = """\
Case details:
- Category: {category}
- Subcategory: {subcategory}
- Jurisdiction: {jurisdiction}

Citizen's description:
---
{user_input}
---

Evidence summary:
{evidence_summary}

Legal analysis:
{legal_analysis}

Known entities:
{known_entities}

Follow-up Q&A:
{qa_context}
"""


def format_document_prompt(
    user_input: str,
    category: str,
    subcategory: str,
    jurisdiction: str,
    evidence_summary: str = "No evidence",
    legal_analysis: str = "No legal analysis available",
    known_entities: str = "None",
    qa_context: str = "None",
) -> list[dict[str, str]]:
    """Build the messages list for document draft generation."""
    return [
        {
            "role": "system",
            "content": DOCUMENT_SYSTEM_PROMPT.format(
                prompt_version=PROMPT_VERSION,
            ),
        },
        {
            "role": "user",
            "content": DOCUMENT_USER_PROMPT.format(
                user_input=user_input,
                category=category,
                subcategory=subcategory or "N/A",
                jurisdiction=jurisdiction or "India",
                evidence_summary=evidence_summary,
                legal_analysis=legal_analysis,
                known_entities=known_entities,
                qa_context=qa_context,
            ),
        },
    ]
