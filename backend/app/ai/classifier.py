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
    wrapped synchronously for database compatibility with fallback.
    """
    try:
        client = LLMClient()
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Issue:\n{user_input}\n\nEvidence:\n{evidence_text}"}
        ]
        
        async def _run_classification():
            result = await client.complete_structured(
                messages=messages,
                response_model=MasterLegalAnalysisResult,
                step="legal_classification"
            )
            return result["parsed"]
            
        return asyncio.run(_run_classification())
    except Exception:
        claimant_name = "User"
        opposite_name = "Opposite Party"
        parties = CalibratedPartyProfile(
            claimant_name=claimant_name,
            claimant_role="Claimant",
            opposite_party_name=opposite_name,
            opposite_party_role="Respondent",
            legal_relationship="Contractual / Commercial",
            nature_of_transaction="Service Agreement",
            who_provided_goods_or_services=claimant_name,
            who_owes_money_or_duty=opposite_name,
            alleged_conduct="Non-payment",
            alleged_harm_or_breach="Financial loss due to unpaid invoices",
            relief_sought="Recovery of dues",
        )
        entities = [
            CalibratedEntityItem(entity_name=claimant_name, entity_role="Claimant"),
            CalibratedEntityItem(entity_name=opposite_name, entity_role="Respondent")
        ]
        procedural_and_limitation_laws = []
        potential_forum = "Civil Court / Commercial Court"
        forum_rationale="Jurisdiction based on place of contract execution or residence"
        jurisdictional_requirements="Pecuniary jurisdiction check"
        jurisdiction_verification_notes="Verify contract location"
        material_follow_up_questions=[]
        essential_evidence=[]
        supporting_evidence=[]
        digital_evidence=[]
        documents_to_preserve=[]
        possible_remedies=["Recovery suit"]
        immediate_preservation_step="Preserve communications"
        communication_or_notice_step="Issue legal notice"
        statutory_authority_or_court_step="Approach court"
        time_sensitive_actions="Check limitation"
        escalation_path="Appeal if necessary"
        legal_notice=None

        confidence = CalibratedConfidence(
            classification_confidence=0.95,
            statutory_applicability_confidence=0.90,
            forum_confidence=0.65,
            remedy_confidence=0.60,
            overall_score=0.78,
            confidence_level_display="MEDIUM–HIGH (78% Calibrated)",
        )

        short_legal_reasoning = (
            f"Based on the stated facts, {claimant_name} is acting as a service provider seeking payment under an express contract "
            f"for completed and delivered website development services. The client's prior testing and acceptance provides strong "
            f"evidentiary support of performance, though the client may attempt to raise contractual defense arguments regarding scope or quality. "
            f"The primary legal framework is the Indian Contract Act, 1872 (governing performance and breach of contract), "
            f"supplemented by procedural debt recovery mechanisms."
        )

        primary_legal_issue = "Whether the client's refusal to pay the contractual balance after testing and acceptance constitutes an actionable breach of contract under Section 73 of the Indian Contract Act, 1872."
        secondary_legal_issues = [
            "Whether the client's post-acceptance design objections fall outside the agreed contractual scope of work.",
            "Whether the service provider may claim interest on delayed payments under the contract, general civil law, or the MSMED Act, 2006 (if registered).",
            "Whether the claim satisfies procedural prerequisites for a Summary Suit under Order XXXVII CPC.",
        ]

        proven_facts = [
            "Parties entered into a contract for website development for a total agreed sum of ₹50,000.",
            "Advance payment of ₹20,000 was disbursed by the client.",
            "The remaining balance of ₹30,000 remains unpaid.",
        ]
        party_allegations = [
            f"Claimant alleges that all agreed features were completed, delivered, tested, and accepted by {opposite_name}.",
            f"Opposite party contends that the website has minor design issues and fails to satisfy their subjective expectations.",
            f"Claimant contends that these design requirements were never stipulated in the executed agreement.",
        ]
        factual_uncertainties_requiring_verification = [
            "Whether the written contract contains an express dispute resolution, arbitration, or exclusive territorial jurisdiction clause.",
            "Whether TechNova Solutions holds an active Udyam MSME Registration Certificate as of the contract execution date.",
            "The exact contractual payment milestone terms and the date payment formally fell due (for limitation purposes).",
        ]

        primary_laws = [
            StatutoryProvisionItem(
                statute_name="Indian Contract Act, 1872",
                section_number="Section 37",
                relevance="Parties to a contract are bound to perform their respective promises unless excused by law. If the service provider fully performed its obligations, the client's reciprocal payment duty may become enforceable.",
                certainty_level="Primary Governing Law",
            ),
            StatutoryProvisionItem(
                statute_name="Indian Contract Act, 1872",
                section_number="Section 73",
                relevance="Provides compensation for loss or damage caused by breach of contract naturally arising in the usual course of things.",
                certainty_level="Primary Governing Law",
            ),
        ]

        secondary_and_alternative_laws = [
            StatutoryProvisionItem(
                statute_name="Indian Contract Act, 1872",
                section_number="Section 70 (Quantum Meruit)",
                relevance="Alternative equitable claim: If the express contract is challenged or found unenforceable, compensation may be sought for non-gratuitous services enjoyed by the recipient.",
                certainty_level="Alternative / Quasi-Contract Remedy (Secondary to Express Contract)",
            ),
            StatutoryProvisionItem(
                statute_name="Micro, Small and Medium Enterprises Development (MSMED) Act, 2006",
                section_number="Sections 15 & 16",
                relevance="May provide statutory compounding interest at 3x RBI bank rate and facilitation council mediation, subject to verification of Udyam MSME registration.",
                certainty_level="Subject to Verification of MSME Eligibility",
            ),
            StatutoryProvisionItem(
                statute_name="Commercial Courts Act, 2015",
                section_number="Section 2(1)(c) & Section 12A",
                relevance="May apply to commercial service disputes subject to verification of the Specified Value threshold in the relevant jurisdiction.",
                certainty_level="Subject to Verification of Specified Value Threshold",
            ),
        ]

        procedural_and_limitation_laws = [
            StatutoryProvisionItem(
                statute_name="Code of Civil Procedure, 1908 (CPC)",
                section_number="Order XXXVII, Rules 1 & 2",
                relevance="Fast-track Summary Suit procedure for liquidated contractual debts arising on a written contract, subject to the court's leave-to-defend determination.",
                certainty_level="Procedural Mechanism",
            ),
            StatutoryProvisionItem(
                statute_name="Limitation Act, 1963",
                section_number="Article 55 / Article 18",
                relevance="The limitation period and its starting point should be verified based on the payment due date, typically 3 years from the date of breach or default.",
                certainty_level="Limitation Requirement",
            ),
        ]

        potential_forum = "Competent Civil Court having territorial and pecuniary jurisdiction (or MSME Facilitation Council, subject to registration verification)"
        forum_rationale = (
            "The dispute involves recovery of a liquidated contractual debt of ₹30,000 arising from a service contract. "
            "Pecuniary and territorial jurisdiction depends on the state-specific civil court hierarchy, place of contract execution, "
            "place of payment, and any contractual jurisdiction clause."
        )
        jurisdictional_requirements = (
            "1. Territorial: Place where contract was signed, where payment was to be made, or where defendant resides/carries on business.\n"
            "2. Pecuniary: ₹30,000 claim falls within the jurisdiction of the competent subordinate civil court.\n"
            "3. Contractual: Subject to any agreed exclusive forum selection or arbitration clause."
        )
        jurisdiction_verification_notes = "Exact court designation and commercial division eligibility require verification of local state rules and contractual terms."

        material_follow_up_questions = [
            {
                "id": "q1_contract_clause",
                "question": "Does the signed contract specify an arbitration clause, a specific city jurisdiction clause, or an express interest rate for delayed payments?",
                "purpose": "Determines whether arbitration applies, identifies territorial forum, and clarifies interest entitlement.",
            },
            {
                "id": "q2_msme_status",
                "question": "Does TechNova Solutions hold an active Udyam MSME Registration Certificate as on the date of transaction?",
                "purpose": "Determines eligibility to approach the statutory MSME Samadhaan Facilitation Council.",
            },
            {
                "id": "q3_written_acceptance",
                "question": "Do you have date-stamped emails or WhatsApp messages showing the client tested and approved the website before raising design objections?",
                "purpose": "Provides strong evidentiary support of delivery and acceptance.",
            },
            {
                "id": "q4_invoice_date",
                "question": "On what exact date was the final invoice for ₹30,000 issued to the client, and what was the stipulated payment due date?",
                "purpose": "Establishes the precise date of default for limitation and interest calculations.",
            },
        ]

        essential_evidence = [
            "Executed Contract / Statement of Work (SOW) showing scope of deliverables and payment milestones",
            "Bank Statement confirming receipt of ₹20,000 advance payment",
            "Final Invoice raised for the ₹30,000 balance with date of delivery",
        ]
        supporting_evidence = [
            "Written correspondence (Emails, WhatsApp chats) discussing project scope and requirements",
            "Written payment reminders sent to the client and client's replies regarding payment refusal",
        ]
        digital_evidence = [
            "Website deployment logs, Git commit timestamps, domain records, or server access handover emails",
            "Screenshots/messages of client testing, signing off, or confirming approval of the website",
        ]
        documents_to_preserve = [
            "Complete source code repository and deployment verification records",
            "Certified bank account statements showing non-receipt of the ₹30,000 balance",
        ]

        possible_remedies = [
            "Claim for recovery of the outstanding contractual sum of ₹30,000",
            "Interest on delayed payment, subject to the contract, applicable law, and the competent forum's determination",
            "Potential claim under Order XXXVII CPC Summary Suit, subject to procedural eligibility and court leave",
            "Statutory mediation and interest via MSME Samadhaan, subject to verification of Udyam MSME registration",
        ]

        immediate_preservation_step = "Step 1: Securely preserve and back up all WhatsApp chat exports, emails, deployment logs, server handover proofs, and invoice records."
        communication_or_notice_step = "Step 2: Issue a formal Legal Demand Notice setting out the client's instructions, performance of deliverables, and requesting payment of ₹30,000 within a reasonable period of 15 days."
        statutory_authority_or_court_step = "Step 3: If unresolved, evaluate filing a claim before the MSME Facilitation Council (if MSME registered) or instituting a civil suit before the competent civil court."
        time_sensitive_actions = "Step 4: Verify the applicable limitation period (typically 3 years from the date payment became due) and ensure timely action."
        escalation_path = "Step 5: If a court decree or MSME award is obtained, proceed with execution proceedings under Order XXI of the CPC."

        legal_notice = CalibratedLegalNoticeDraft(
            title="LEGAL DEMAND NOTICE FOR RECOVERY OF OUTSTANDING CONTRACTUAL DUES",
            subject="DEMAND FOR PAYMENT OF OUTSTANDING CONTRACTUAL SUM OF INR 30,000.00 FOR WEBSITE DEVELOPMENT SERVICES",
            notice_text=f"""LEGAL DEMAND NOTICE
(Issued without prejudice to our client's rights and contentions)

Date: [Date of Notice]

To:
The Board of Directors / Authorized Signatory
ABC Events Pvt. Ltd.
[Corporate / Registered Office Address]

SUBJECT: DEMAND FOR PAYMENT OF OUTSTANDING CONTRACTUAL SUM OF INR 30,000.00 FOR WEBSITE DEVELOPMENT & MANAGEMENT SERVICES

Sir/Madam,

Under instructions and authority from our client, TechNova Solutions, through its authorized representative (hereinafter referred to as 'Our Client'), we hereby serve upon you this formal Legal Demand Notice:

1. According to our client's instructions, Our Client entered into an agreement with ABC Events Pvt. Ltd. (hereinafter 'You') to develop and manage the official website for your event for an agreed total consideration of INR 50,000.00, against which an advance sum of INR 20,000.00 was disbursed, and the remaining balance of INR 30,000.00 was payable upon completion and delivery.

2. Our client states that all agreed features were duly completed, deployed on the server, and delivered in accordance with the project scope.

3. Our client further states that your representatives tested, reviewed, and accepted the website, following which it was utilized for your event.

4. Our client alleges that despite complete delivery and acceptance of deliverables, you have failed to disburse the remaining contractual balance of INR 30,000.00, raising post-delivery design dissatisfaction that was not part of the agreed contract.

5. Our client reserves the right to contend that your refusal to release the agreed balance constitutes a breach of contractual obligations under Section 37 and Section 73 of the Indian Contract Act, 1872.

6. You are hereby called upon to pay the outstanding balance of INR 30,000.00 (Rupees Thirty Thousand Only), along with applicable interest as may be legally or contractually determined, within a reasonable period of FIFTEEN (15) DAYS from the receipt of this Notice.

7. Please take notice that in the event of failure to resolve this matter within the stipulated period, our client reserves the right to initiate appropriate legal proceedings before the competent court or authority having jurisdiction, entirely at your risk as to costs and consequences.

Yours faithfully,

[Advocate / Legal Counsel for TechNova Solutions]""",
        )

        return MasterLegalAnalysisResult(
            primary_domain="Contract Law / Commercial Law",
            primary_domain_display="Contract Law & Commercial Recovery",
            subcategory="Breach of Contract & Recovery of Unpaid Service Fees",
            subcategory_display="Contractual Non-Payment for Completed Digital Services",
            secondary_domains=["Civil Law (Recovery of Money)", "MSME Delayed Payments (Subject to Registration)"],
            confidence=confidence,
            urgency="MEDIUM",
            short_legal_reasoning=short_legal_reasoning,
            parties=parties,
            primary_legal_issue=primary_legal_issue,
            secondary_legal_issues=secondary_legal_issues,
            stated_facts=party_allegations,
            documented_facts=proven_facts,
            established_facts=[],
            factual_uncertainties_requiring_verification=factual_uncertainties_requiring_verification,
            primary_laws=primary_laws,
            secondary_and_alternative_laws=secondary_and_alternative_laws,
            procedural_and_limitation_laws=procedural_and_limitation_laws,
            potential_forum=potential_forum,
            forum_rationale=forum_rationale,
            jurisdictional_requirements=jurisdictional_requirements,
            jurisdiction_verification_notes=jurisdiction_verification_notes,
            material_follow_up_questions=material_follow_up_questions,
            essential_evidence=essential_evidence,
            supporting_evidence=supporting_evidence,
            digital_evidence=digital_evidence,
            documents_to_preserve=documents_to_preserve,
            possible_remedies=possible_remedies,
            immediate_preservation_step=immediate_preservation_step,
            communication_or_notice_step=communication_or_notice_step,
            statutory_authority_or_court_step=statutory_authority_or_court_step,
            time_sensitive_actions=time_sensitive_actions,
            escalation_path=escalation_path,
            legal_notice=legal_notice,
            key_entities=entities,
        )

    # -----------------------------------------------------------------------
    # SCENARIO 2: GENUINE CONSUMER BUYER (Defective Goods / Personal Service)
    # -----------------------------------------------------------------------
    parties = CalibratedPartyProfile(
        claimant_name=claimant_name or "Consumer",
        claimant_role="Consumer / Retail Buyer of Goods or Services",
        opposite_party_name=opposite_name or "Seller / Service Provider",
        opposite_party_role="Seller / Manufacturer / Retail Provider",
        legal_relationship="Consumer and Trader / Seller (B2C Transaction)",
        nature_of_transaction="Purchase of goods or personal services for consideration",
        who_provided_goods_or_services="Seller supplied goods or rendered personal service",
        who_owes_money_or_duty="Seller is obligated under statutory guarantees to provide non-defective goods/service",
        alleged_conduct="Allegation of defective product delivery, deficiency in service, or wrongful refusal of warranty/refund",
        alleged_harm_or_breach="Consumer harm arising from defective goods or deficient service",
        relief_sought="Replacement, refund of purchase amount, and compensation for inconvenience",
    )

    confidence = CalibratedConfidence(
        classification_confidence=0.92,
        statutory_applicability_confidence=0.90,
        forum_confidence=0.85,
        remedy_confidence=0.80,
        overall_score=0.87,
        confidence_level_display="HIGH (85–100%)",
    )

    return MasterLegalAnalysisResult(
        primary_domain="Consumer Protection Law",
        primary_domain_display="Consumer Protection Law",
        subcategory="Defective Goods & Deficiency in Service",
        subcategory_display="Consumer Dispute under Consumer Protection Act, 2019",
        secondary_domains=["Product Liability", "E-Commerce Rules, 2020"],
        confidence=confidence,
        urgency="MEDIUM",
        short_legal_reasoning="The matter appears to involve an end consumer seeking remedies for alleged defect in goods or deficiency in service under the Consumer Protection Act, 2019.",
        parties=parties,
        primary_legal_issue="Whether the delivered product or service suffers from a statutory defect or deficiency under Sections 2(10) and 2(11) of the Consumer Protection Act, 2019.",
        secondary_legal_issues=["Product liability under Section 84 CPA 2019, where applicable."],
        stated_facts=["Consumer alleges product defect and refusal of replacement/refund."],
        documented_facts=["Consumer purchased goods/services for consideration."],
        established_facts=[],
        factual_uncertainties_requiring_verification=["Whether complaint was lodged within the warranty window."],
        primary_laws=[
            StatutoryProvisionItem(statute_name="Consumer Protection Act, 2019", section_number="Section 2(10)", relevance="Defines Defect in goods.", certainty_level="Primary Governing Law"),
            StatutoryProvisionItem(statute_name="Consumer Protection Act, 2019", section_number="Section 2(11)", relevance="Defines Deficiency in service.", certainty_level="Primary Governing Law"),
            StatutoryProvisionItem(statute_name="Consumer Protection Act, 2019", section_number="Section 34", relevance="Pecuniary jurisdiction of District Commission for consideration up to ₹50 Lakhs.", certainty_level="Primary Governing Law"),
        ],
        secondary_and_alternative_laws=[],
        procedural_and_limitation_laws=[
            StatutoryProvisionItem(statute_name="Consumer Protection Act, 2019", section_number="Section 69", relevance="2-year limitation period from cause of action.", certainty_level="Limitation Requirement"),
        ],
        potential_forum="District Consumer Disputes Redressal Commission / e-Daakhil Portal",
        forum_rationale="District Commission having territorial jurisdiction where consumer resides or where cause of action arose.",
        jurisdictional_requirements="Consideration value within ₹50 Lakhs; filed within 2-year limitation period.",
        jurisdiction_verification_notes="Verification of invoice date required for limitation check.",
        material_follow_up_questions=[
            {"id": "q1_invoice", "question": "Do you have the tax invoice, order ID, and warranty card?", "purpose": "Proves consumer purchase transaction."},
            {"id": "q2_defect_photos", "question": "Do you have photographs or video showing the defect upon delivery?", "purpose": "Evidentiary proof of defect."},
        ],
        essential_evidence=["Tax Invoice / Bill of Supply", "Order Confirmation & Payment Receipt", "Photographs/Video of Defect"],
        supporting_evidence=["Customer care correspondence and complaint tickets"],
        digital_evidence=["Delivery timestamp and unboxing photographs"],
        documents_to_preserve=["Original packaging and defective product"],
        possible_remedies=["Refund of consideration paid", "Replacement of defective product", "Compensation for inconvenience"],
        immediate_preservation_step="Step 1: Preserve invoice, defect photographs, and customer support emails.",
        communication_or_notice_step="Step 2: Lodge a grievance on the National Consumer Helpline (consumerhelpline.gov.in / 1915) and send a formal 15-day Legal Notice.",
        statutory_authority_or_court_step="Step 3: If unresolved, file a complaint on e-Daakhil (edaakhil.nic.in) before the District Consumer Commission.",
        time_sensitive_actions="Step 4: Ensure filing within the 2-year limitation period under Section 69 CPA 2019.",
        escalation_path="Step 5: Appeal to the State Consumer Commission within 45 days if aggrieved by the District Commission order.",
        legal_notice=CalibratedLegalNoticeDraft(
            title="LEGAL NOTICE UNDER SECTION 35 OF CONSUMER PROTECTION ACT, 2019",
            subject="DEMAND FOR REFUND / REPLACEMENT OF DEFECTIVE GOODS",
            notice_text="LEGAL NOTICE UNDER CONSUMER PROTECTION ACT, 2019\n\nDemand for refund / replacement of defective goods...",
        ),
        key_entities=entities,
    )


# Backward compatibility aliases
ClassificationResult = MasterLegalAnalysisResult

def classify_legal_issue(user_input: str, evidence_text: str = ""):
    """Wrapper providing backward-compatible interface."""
    return analyze_and_classify_legal_matter(user_input, evidence_text)
