"""
Nyaya Saathi — Master Legal Classification & Validation Engine
Leverages LLMClient with Structured Outputs (JSON Mode + Pydantic)
"""

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

CRITICAL RULES:
1. ABSOLUTE CLAIM FILTER: Reject/rewrite statements containing "cannot", "always", "never", "automatically", "conclusively". Use "may", "could", "appears to", "subject to verification".
2. CONTRACT VS RESTITUTION: Contractual remedies are primary. Section 70/Quantum Meruit is alternative.
3. MSME RULE: Do not determine MSMED Act eligibility solely from Udyam registration; verify supplier status.
4. SUMMARY SUIT RULE: Do not automatically assume Order 37 CPC applies without a written contract for liquidated debt.
5. FACTS: Distinguish between STATED FACTS (narrative only), DOCUMENTED FACTS (supported by evidence), and ESTABLISHED FACTS (admitted).
"""

def analyze_and_classify_legal_matter(user_input: str, evidence_text: str = "") -> MasterLegalAnalysisResult:
    """
    Executes the 11-Phase Legal Reasoning Protocol using the asynchronous LLMClient,
    wrapped synchronously for database compatibility.
    """
    client = LLMClient()
    
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Issue:\n{user_input}\n\nEvidence:\n{evidence_text}"}
    ]
    
    async def _run_classification():
        # complete_structured enforces the JSON schema of MasterLegalAnalysisResult!
        result = await client.complete_structured(
            messages=messages,
            response_model=MasterLegalAnalysisResult,
            step="legal_classification"
        )
        return result["parsed"]
        
    return asyncio.run(_run_classification())

# Backward compatibility alias
ClassificationResult = MasterLegalAnalysisResult

def classify_legal_issue(user_input: str, evidence_text: str = ""):
    """Wrapper providing backward-compatible interface."""
    return analyze_and_classify_legal_matter(user_input, evidence_text)
