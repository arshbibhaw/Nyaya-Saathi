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
from app.ai.rag.generator import generate_response, generate_response_stream

logger = logging.getLogger(__name__)


def classify_and_create_case(db: Session, user_id: str, initial_issue: str, location: str | None = None) -> Case:
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
        title=analysis.primary_domain_display,
        description=analysis.short_legal_reasoning,
        domain=analysis.primary_domain,
        issue=analysis.primary_legal_issue,
        subcategory=analysis.subcategory_display,
        urgency=analysis.urgency,
        location=location,
        status="ACTIVE",
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

    1. Retrieve relevant legal context via RAG.
    2. Gather conversation history.
    3. Generate an AI response grounded in retrieved sources.
    """
    # 1. Retrieve legal context
    context_chunks = retrieve_relevant_legal_sources(
        db=db,
        query=message,
        domain=case.domain,
    )

    # 2. Gather conversation history
    history = (
        db.query(CaseQuestion)
        .filter(CaseQuestion.case_id == case.id)
        .order_by(CaseQuestion.timestamp)
        .all()
    )
    history_dicts = [
        {"role": q.role, "content": q.question} for q in history
    ]

    # 3. Generate response
    ai_text = generate_response(
        query=message,
        context=context_chunks,
        case_history=history_dicts,
    )

    # Extract source references from context
    sources = [
        {"title": c.get("title", ""), "source_url": c.get("source_url", "")}
        for c in context_chunks
    ]

    return ChatResponse(
        response=ai_text,
        sources=sources,
        follow_up_questions=[],
    )


def handle_chat_stream(db: Session, case: Case, message: str):
    """
    Handle a single chat turn as an SSE stream:
    1. Retrieve relevant legal context via RAG.
    2. Yield sources immediately.
    3. Stream AI response chunks.
    4. Persist the full response to DB once complete.
    """
    import json

    # 1. Retrieve legal context
    context_chunks = retrieve_relevant_legal_sources(
        db=db,
        query=message,
        domain=case.domain,
    )

    # 2. Gather conversation history
    history = (
        db.query(CaseQuestion)
        .filter(CaseQuestion.case_id == case.id)
        .order_by(CaseQuestion.timestamp)
        .all()
    )
    history_dicts = [
        {"role": q.role, "content": q.question} for q in history
    ]

    # Extract source references from context
    sources = [
        {"title": c.get("title", ""), "source_url": c.get("source_url", "")}
        for c in context_chunks
    ]

    # Yield sources first
    yield f"data: {json.dumps({'type': 'sources', 'sources': sources})}\n\n"

    # 3. Stream generated response
    full_response = ""
    for chunk in generate_response_stream(
        query=message,
        context=context_chunks,
        case_history=history_dicts,
    ):
        full_response += chunk
        yield f"data: {json.dumps({'type': 'chunk', 'text': chunk})}\n\n"

    # 4. Persist the AI response
    ai_msg = CaseQuestion(case_id=case.id, question=full_response, role="assistant")
    db.add(ai_msg)
    db.commit()


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
