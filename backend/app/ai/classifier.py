"""
Nyaya Saathi — Master Legal Classification & Validation Engine
Leverages LLMClient with Structured Outputs (JSON Mode + Pydantic)
"""

import re
import asyncio
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.ai.llm.client import LLMClient


# ===========================================================================
# Pydantic Schemas for Structured Output
# ===========================================================================

class CalibratedPartyProfile(BaseModel):
    claimant_name: str
    claimant_role: str
    opposite_party_name: str
    opposite_party_role: str
    legal_relationship: str
    nature_of_transaction: str
    who_provided_goods_or_services: str
    who_owes_money_or_duty: str
    alleged_conduct: str
    alleged_harm_or_breach: str
    relief_sought: str

class StatutoryProvisionItem(BaseModel):
    statute_name: str
    section_number: str
    relevance: str
    certainty_level: str

class CalibratedConfidence(BaseModel):
    classification_confidence: float
    statutory_applicability_confidence: float
    forum_confidence: float
    remedy_confidence: float
    overall_score: float
    confidence_level_display: str

class CalibratedLegalNoticeDraft(BaseModel):
    title: str
    subject: str
    notice_text: str

class MasterLegalAnalysisResult(BaseModel):
    primary_domain: str
    primary_domain_display: str
    subcategory: str
    subcategory_display: str
    secondary_domains: List[str]
    confidence: CalibratedConfidence
    urgency: str
    short_legal_reasoning: str

    parties: CalibratedPartyProfile

    primary_legal_issue: str
    secondary_legal_issues: List[str]
    stated_facts: List[str]
    documented_facts: List[str]
    established_facts: List[str]
    factual_uncertainties_requiring_verification: List[str]

    primary_laws: List[StatutoryProvisionItem]
    secondary_and_alternative_laws: List[StatutoryProvisionItem]
    procedural_and_limitation_laws: List[StatutoryProvisionItem]

    potential_forum: str
    forum_rationale: str
    jurisdictional_requirements: str
    jurisdiction_verification_notes: str

    material_follow_up_questions: List[Dict[str, str]]

    essential_evidence: List[str]
    supporting_evidence: List[str]
    digital_evidence: List[str]
    documents_to_preserve: List[str]

    possible_remedies: List[str]

    immediate_preservation_step: str
    communication_or_notice_step: str
    statutory_authority_or_court_step: str
    time_sensitive_actions: str
    escalation_path: str

    legal_notice: Optional[CalibratedLegalNoticeDraft] = None


# ===========================================================================
# LLM Integration
# ===========================================================================

SYSTEM_PROMPT = """You are the Nyaya Saathi Legal Classification Engine (India).
You must analyze the user's issue and return ONLY a valid JSON object matching the requested schema.
Use the provided Legal Context to strictly base your analysis, reasoning, and statutory citations.
"""

def analyze_and_classify_legal_matter(user_input: str, evidence_text: str = "", rag_context: str = "") -> MasterLegalAnalysisResult:
    """
    Executes comprehensive Indian Legal Classification and Reasoning Protocol.
    Returns domain-specific statutory provisions, action plans, evidence requirements, and legal notice drafts.
    """
    text = f"User Input: {user_input}\nEvidence: {evidence_text}\n\nLegal Context from Database:\n{rag_context if rag_context else 'None provided.'}"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": text}
    ]

    try:
        # FastAPI runs sync def routes in a threadpool, so asyncio.run is safe here.
        client = LLMClient()
        result = asyncio.run(
            client.complete_structured(
                messages=messages,
                response_model=MasterLegalAnalysisResult,
                step="classification"
            )
        )
        return result["parsed"]
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Classification failed, falling back: {e}")
        # Very basic fallback so it doesn't crash the whole app if LLM is down
        return MasterLegalAnalysisResult(
            primary_domain="General Legal Matter",
            primary_domain_display="General Legal Matter",
            subcategory="Unknown",
            subcategory_display="Unknown",
            secondary_domains=[],
            confidence=CalibratedConfidence(
                classification_confidence=0.5,
                statutory_applicability_confidence=0.5,
                forum_confidence=0.5,
                remedy_confidence=0.5,
                overall_score=0.5,
                confidence_level_display="LOW (Fallback)"
            ),
            urgency="UNKNOWN",
            short_legal_reasoning="Failed to dynamically classify. Please consult a legal professional.",
            parties=CalibratedPartyProfile(
                claimant_name="User",
                claimant_role="Claimant",
                opposite_party_name="Unknown",
                opposite_party_role="Respondent",
                legal_relationship="Unknown",
                nature_of_transaction="Unknown",
                who_provided_goods_or_services="Unknown",
                who_owes_money_or_duty="Unknown",
                alleged_conduct="Unknown",
                alleged_harm_or_breach="Unknown",
                relief_sought="Unknown",
            ),
            primary_legal_issue="Unknown issue.",
            secondary_legal_issues=[],
            stated_facts=[user_input],
            documented_facts=[],
            established_facts=[],
            factual_uncertainties_requiring_verification=[],
            primary_laws=[],
            secondary_and_alternative_laws=[],
            procedural_and_limitation_laws=[],
            potential_forum="Unknown",
            forum_rationale="Unknown",
            jurisdictional_requirements="Unknown",
            jurisdiction_verification_notes="Unknown",
            material_follow_up_questions=[],
            essential_evidence=[],
            supporting_evidence=[],
            digital_evidence=[],
            documents_to_preserve=[],
            possible_remedies=[],
            immediate_preservation_step="Preserve all documents.",
            communication_or_notice_step="Send a formal notice.",
            statutory_authority_or_court_step="Approach relevant authority.",
            time_sensitive_actions="Act promptly within limitation.",
            escalation_path="Consult legal counsel.",
            legal_notice=None
        )

# Backward compatibility aliases
ClassificationResult = MasterLegalAnalysisResult

def classify_legal_issue(user_input: str, evidence_text: str = "", rag_context: str = ""):
    """Wrapper providing backward-compatible interface."""
    return analyze_and_classify_legal_matter(user_input, evidence_text, rag_context)
