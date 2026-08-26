"""
Nyaya Saathi — Action Plan Prompt
===================================
Versioned prompt template for generating step-by-step action plans.
"""

from app.ai.config import PROMPT_VERSIONS
from app.ai.prompts.statutory_reasoning import STATUTORY_REASONING_CHAT

PROMPT_VERSION = PROMPT_VERSIONS["action_plan"]

ACTION_PLAN_SYSTEM_PROMPT = """\
You are an action-plan generator for Nyaya Saathi, an Indian legal navigation platform.

Given a citizen's case details, legal analysis, and evidence summary, generate a \
personalised, step-by-step action plan.

""" + STATUTORY_REASONING_CHAT + """

## Rules
1. Each step must be actionable and specific.
2. Order steps by urgency — immediate actions first.
3. Include official links ONLY from the provided allowlist. \
   Do NOT invent or guess URLs.
4. For high-urgency cases, the first steps should be immediate safety/reporting actions.
5. Include professional/legal-aid escalation as a step when appropriate.
6. Each step should trace back to retrieved legal information or official procedures \
   where possible. Steps that are common-sense should be labelled "general_guidance".
7. Maximum 8 steps. Be focused, not exhaustive.

## Official Links Allowlist
{official_links}

## Domain-Specific Baseline
{domain_baseline}

## Output Schema (respond ONLY with valid JSON)
{{
  "title": "<action plan title>",
  "steps": [
    {{
      "step_number": <int>,
      "title": "<short step title>",
      "description": "<detailed, plain-language description of what to do>",
      "urgency": "immediate | within_24h | within_week | when_possible",
      "grounding": "source_backed | official_procedure | general_guidance",
      "official_link": {{
        "name": "<link name or null>",
        "url": "<url or null>",
        "contact": "<phone number or null>"
      }},
      "status": "pending"
    }}
  ],
  "total_steps": <int>,
  "estimated_urgency": "<summary urgency statement>",
  "escalation_contacts": [
    {{
      "name": "<organisation/helpline name>",
      "contact": "<phone or null>",
      "url": "<url or null>",
      "type": "phone | web | in_person"
    }}
  ],
  "prompt_version": "{prompt_version}"
}}
"""

ACTION_PLAN_USER_PROMPT = """\
Case details:
- Category: {category}
- Subcategory: {subcategory}
- Urgency: {urgency}
- Jurisdiction: {jurisdiction}

Citizen's description:
---
{user_input}
---

Legal analysis summary:
{legal_analysis}

Evidence summary:
{evidence_summary}

Follow-up Q&A:
{qa_context}
"""


def format_action_plan_prompt(
    user_input: str,
    category: str,
    subcategory: str,
    urgency: str,
    jurisdiction: str,
    legal_analysis: str,
    evidence_summary: str = "No evidence uploaded",
    qa_context: str = "None",
    official_links_text: str = "",
    domain_baseline_text: str = "",
) -> list[dict[str, str]]:
    """Build the messages list for action plan generation."""
    return [
        {
            "role": "system",
            "content": ACTION_PLAN_SYSTEM_PROMPT.format(
                official_links=official_links_text,
                domain_baseline=domain_baseline_text,
                prompt_version=PROMPT_VERSION,
            ),
        },
        {
            "role": "user",
            "content": ACTION_PLAN_USER_PROMPT.format(
                user_input=user_input,
                category=category,
                subcategory=subcategory or "N/A",
                urgency=urgency,
                jurisdiction=jurisdiction or "India",
                legal_analysis=legal_analysis,
                evidence_summary=evidence_summary,
                qa_context=qa_context,
            ),
        },
    ]
