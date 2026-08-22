"""
Nyaya Saathi — Follow-Up Questions Prompt
==========================================
Versioned prompt template for generating adaptive follow-up questions.
"""

from app.ai.config import PROMPT_VERSIONS, MAX_FOLLOW_UP_QUESTIONS

PROMPT_VERSION = PROMPT_VERSIONS["questions"]

QUESTIONS_SYSTEM_PROMPT = """\
You are a follow-up question generator for Nyaya Saathi, an Indian legal navigation platform.

Given a citizen's problem description and the initial classification, generate targeted \
follow-up questions to gather the minimum information needed for an actionable response.

## Rules
- Generate at most {max_questions} questions.
- Each question must be MATERIAL — it should potentially change:
  jurisdiction, category, urgency, recommended route, or evidence requirements.
- Do NOT ask questions whose answers are already present in the user's description.
- Do NOT interrogate the user. Keep questions simple and empathetic.
- Use plain language a non-legal citizen would understand.
- If enough information already exists for an action plan, set "sufficient_for_action_plan" to true and return an empty list.

## Domain-Specific Guidance
{domain_question_guidance}

## Output Schema (respond ONLY with valid JSON)
{{
  "sufficient_for_action_plan": <bool>,
  "questions": [
    {{
      "id": "<short_slug>",
      "question": "<plain-language question>",
      "purpose": "<what this question determines: jurisdiction | urgency | evidence | route | category>",
      "priority": "high | medium"
    }}
  ]
}}
"""

QUESTIONS_USER_PROMPT = """\
Citizen's problem description:
---
{user_input}
---

Classification result:
- Category: {category}
- Subcategory: {subcategory}
- Urgency: {urgency}
- Confidence: {confidence}

Already known entities:
{known_entities}

Previously asked questions and answers:
{previous_qa}
"""


def format_questions_prompt(
    user_input: str,
    category: str,
    subcategory: str,
    urgency: str,
    confidence: float,
    known_entities: str = "None",
    previous_qa: str = "None",
    domain_question_guidance: str = "",
) -> list[dict[str, str]]:
    """Build the messages list for follow-up question generation."""
    return [
        {
            "role": "system",
            "content": QUESTIONS_SYSTEM_PROMPT.format(
                max_questions=MAX_FOLLOW_UP_QUESTIONS,
                domain_question_guidance=domain_question_guidance,
            ),
        },
        {
            "role": "user",
            "content": QUESTIONS_USER_PROMPT.format(
                user_input=user_input,
                category=category,
                subcategory=subcategory or "N/A",
                urgency=urgency,
                confidence=confidence,
                known_entities=known_entities,
                previous_qa=previous_qa,
            ),
        },
    ]
