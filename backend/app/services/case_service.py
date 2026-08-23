"""
Case service — orchestrates AI calls for case creation, chat, plans, and documents.
"""

import logging
from sqlalchemy.orm import Session

from app.models.case import Case
from app.models.case_question import CaseQuestion
from app.models.action_plan import ActionPlan
from app.models.document import Document
from app.schemas.case import ChatResponse
from app.ai.classifier import analyze_and_classify_legal_matter
from app.ai.rag.retriever import retrieve_relevant_legal_sources
from app.ai.rag.generator import generate_response

logger = logging.getLogger(__name__)


def classify_and_create_case(db: Session, user_id: str, initial_issue: str) -> Case:
    """
    Create a new case using the 11-Phase Legal Reasoning Engine.

    1. Calls the AI classifier to determine the legal domain and issue.
    2. Persists the Case row.
    3. Stores the initial user message as the first CaseQuestion.
    4. Automatically generates the structured Action Plan.
    5. Automatically generates the Draft Document (if applicable).
    """
    # 1. Advanced 11-Phase Analysis
    analysis = analyze_and_classify_legal_matter(initial_issue)

    # 2. Persist Case
    case = Case(
        user_id=user_id,
        domain=analysis.primary_domain,
        issue=analysis.primary_legal_issue,
        status="new",
        summary=initial_issue,
    )
    db.add(case)
    db.commit()
    db.refresh(case)

    # 3. Store initial question
    first_msg = CaseQuestion(case_id=case.id, question=initial_issue, role="user")
    db.add(first_msg)

    # 4. Generate & Attach Structured Action Plan
    steps = [
        {
            "step": 1,
            "title": "Immediate Preservation",
            "description": analysis.immediate_preservation_step,
        },
        {
            "step": 2,
            "title": "Communication or Notice",
            "description": analysis.communication_or_notice_step,
        },
        {
            "step": 3,
            "title": "Statutory Authority or Court",
            "description": analysis.statutory_authority_or_court_step,
        },
        {
            "step": 4,
            "title": "Time Sensitive Actions",
            "description": analysis.time_sensitive_actions,
        },
        {
            "step": 5,
            "title": "Escalation Path",
            "description": analysis.escalation_path,
        },
    ]

    plan = ActionPlan(
        case_id=case.id,
        steps=steps,
        status="generated",
    )
    db.add(plan)

    # 5. Generate & Attach Draft Document (if created by classifier)
    if analysis.legal_notice:
        content = (
            f"SUBJECT: {analysis.legal_notice.subject}\n\n"
            f"{analysis.legal_notice.notice_text}"
        )
        doc = Document(
            case_id=case.id,
            doc_type="legal_notice",
            content=content,
        )
        db.add(doc)

    db.commit()
    return case


def handle_chat(db: Session, case: Case, message: str) -> ChatResponse:
    """
    Handle a single chat turn:
    Mocked to avoid OpenAI API calls.
    """
    ai_text = (
        f"Based on the analysis of your case ({case.domain}), regarding your question: '{message}', "
        f"I recommend referring to the Action Plan for the immediate next steps. "
        f"Please ensure you preserve all relevant evidence such as invoices and communication logs."
    )

    sources = [
        {"title": "Consumer Protection Act, 2019", "source_url": "#"},
        {"title": "Indian Contract Act, 1872", "source_url": "#"}
    ]

    return ChatResponse(
        response=ai_text,
        sources=sources,
        follow_up_questions=["Do you have any other questions regarding this matter?"],
    )


def generate_action_plan(db: Session, case: Case) -> ActionPlan:
    """
    Fetch the pre-generated action plan for a case.
    """
    plan = db.query(ActionPlan).filter(ActionPlan.case_id == case.id).first()
    if plan:
        return plan
    
    # Fallback if somehow not created
    plan = ActionPlan(
        case_id=case.id,
        steps=[],
        status="pending",
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def generate_document_draft(db: Session, case: Case) -> Document:
    """
    Fetch the pre-generated document draft for a case.
    """
    doc = db.query(Document).filter(Document.case_id == case.id).first()
    if doc:
        return doc
    
    # Fallback
    doc = Document(
        case_id=case.id,
        doc_type="legal_notice",
        content="No draft available based on current facts.",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc
