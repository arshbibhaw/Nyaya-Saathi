"""
Prompt Templates package for Nyaya Saathi.
"""

from app.ai.prompts.action_plan import format_action_plan_prompt
from app.ai.prompts.classify import format_classify_prompt
from app.ai.prompts.document import format_document_prompt
from app.ai.prompts.evidence import format_evidence_prompt
from app.ai.prompts.generate import format_generate_prompt
from app.ai.prompts.questions import format_questions_prompt
from app.ai.prompts.safety import format_safety_prompt

__all__ = [
    "format_action_plan_prompt",
    "format_classify_prompt",
    "format_document_prompt",
    "format_evidence_prompt",
    "format_generate_prompt",
    "format_questions_prompt",
    "format_safety_prompt",
]
