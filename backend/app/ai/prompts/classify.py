"""
Nyaya Saathi — Classification Prompt
======================================
Versioned prompt template for legal issue classification.
"""

from app.ai.config import PROMPT_VERSIONS

PROMPT_VERSION = PROMPT_VERSIONS["classify"]

CLASSIFY_SYSTEM_PROMPT = """\
You are a legal issue classifier for Nyaya Saathi, an Indian legal navigation platform.

Given a citizen's description of their legal problem, classify it into exactly one \
primary category and subcategory from the taxonomy below.

## Rules
- Base classification ONLY on what the user has described.
- Do NOT assume facts not stated by the user.
- If the description is too vague to classify with confidence ≥ 0.6, set category to "unknown".
- `confidence` is YOUR confidence in the classification, NOT a measure of legal correctness.
- Extract key entities (amounts, dates, parties, locations, payment methods) ONLY if explicitly mentioned.
- Assess urgency based on time-sensitivity and potential harm.
- If the problem clearly spans two domains, include a `secondary_category`.
- `follow_up_needed` should be true if you need more information before a useful action plan can be generated.

## Taxonomy
{taxonomy}

## Output Schema (respond ONLY with valid JSON)
{{
  "category": "<slug from taxonomy or 'unknown'>",
  "subcategory": "<slug from taxonomy or null>",
  "secondary_category": "<slug or null>",
  "urgency": "critical | high | medium | low",
  "confidence": <float 0.0–1.0>,
  "reasoning": "<brief explanation of why this classification was chosen>",
  "key_entities": {{
    "amount": "<string or null>",
    "date": "<string or null>",
    "parties": ["<string>"],
    "location": "<string or null>",
    "payment_method": "<string or null>"
  }},
  "follow_up_needed": <bool>
}}
"""

CLASSIFY_USER_PROMPT = """\
Citizen's problem description:
---
{user_input}
---

{additional_context}
"""


def format_classify_prompt(
    user_input: str,
    taxonomy_text: str,
    additional_context: str = "",
) -> list[dict[str, str]]:
    """
    Build the messages list for the classification LLM call.

    Parameters
    ----------
    user_input : str
        The citizen's raw problem description.
    taxonomy_text : str
        YAML/text representation of the legal domain taxonomy.
    additional_context : str
        Any previously answered follow-up Q&A to include.

    Returns
    -------
    list[dict]
        Messages in OpenAI chat-completion format.
    """
    return [
        {
            "role": "system",
            "content": CLASSIFY_SYSTEM_PROMPT.format(taxonomy=taxonomy_text),
        },
        {
            "role": "user",
            "content": CLASSIFY_USER_PROMPT.format(
                user_input=user_input,
                additional_context=additional_context,
            ),
        },
    ]
