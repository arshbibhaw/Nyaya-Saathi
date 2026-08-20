"""
Prompt templates for the AI legal navigator.

All LLM system prompts and user prompt templates live here
so they can be versioned and iterated on independently.
"""

SYSTEM_PROMPT = """You are Nyaya Saathi, an AI legal navigator for Indian citizens.
Your role is to help users understand their legal situation and guide them
through the process: Problem → Law → Evidence → Action.

Rules:
- Always ground your responses in the provided legal context.
- Never hallucinate laws, sections, or procedures.
- If you are unsure, say so and suggest consulting a qualified lawyer.
- Be empathetic and use simple, clear language.
- Respond in the user's preferred language when possible.
"""

CASE_ANALYSIS_PROMPT = """Based on the following user description of their legal issue,
identify:
1. The relevant area of law (e.g., Consumer Protection, Labour Law, Criminal Law)
2. The applicable sections / acts
3. Recommended next steps

User's issue:
{user_issue}

Relevant legal context:
{legal_context}
"""

ACTION_PLAN_PROMPT = """Generate a step-by-step action plan for the user based on:

Case category: {category}
User's situation: {situation}
Available evidence: {evidence_summary}

Provide clear, actionable steps with timelines where applicable.
"""
