"""
Case service — orchestrates AI calls for case creation, chat, plans, and documents.
"""

import json
import logging
import os
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
    2. Persists the Case row with all fields.
    3. Stores the initial user message as the first CaseQuestion.
    4. Automatically generates the structured Action Plan.
    5. Automatically generates the Draft Document (if applicable).
    """
    # 1. Advanced 11-Phase Analysis
    analysis = analyze_and_classify_legal_matter(initial_issue)

    # 2. Persist Case with all spec-required fields
    case = Case(
        user_id=user_id,
        title=analysis.primary_domain_display,
        description=initial_issue,
        domain=analysis.primary_domain,
        issue=analysis.primary_legal_issue,
        subcategory=analysis.subcategory,
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
            "status": "PENDING",
        },
        {
            "step": 2,
            "title": "Communication or Notice",
            "description": analysis.communication_or_notice_step,
            "status": "PENDING",
        },
        {
            "step": 3,
            "title": "Statutory Authority or Court",
            "description": analysis.statutory_authority_or_court_step,
            "status": "PENDING",
        },
        {
            "step": 4,
            "title": "Time Sensitive Actions",
            "description": analysis.time_sensitive_actions,
            "status": "PENDING",
        },
        {
            "step": 5,
            "title": "Escalation Path",
            "description": analysis.escalation_path,
            "status": "PENDING",
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


def handle_chat_stream(db: Session, case: Case, message: str):
    """
    Handle a single chat turn as an SSE stream:
    1. Retrieve relevant legal context via RAG.
    2. Yield sources immediately.
    3. Stream AI response chunks.
    4. Persist the full response to DB once complete.
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


def generate_action_plan_with_llm(db: Session, case: Case) -> ActionPlan:
    """
    Generate an action plan using the LLM, with a static fallback.
    """
    # Check for existing plan
    plan = db.query(ActionPlan).filter(ActionPlan.case_id == case.id).first()
    if plan:
        return plan

    # Try LLM generation
    steps = _llm_generate_action_plan(case)

    plan = ActionPlan(
        case_id=case.id,
        steps=steps,
        status="generated",
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


def _llm_generate_action_plan(case: Case) -> list[dict]:
    """Call the LLM to generate action plan steps."""
    from openai import OpenAI
    from app.ai.prompts.templates import ACTION_PLAN_PROMPT

    api_key = os.getenv("LLM_API_KEY", "")
    if not api_key:
        return _fallback_action_plan_steps(case.domain)

    client = OpenAI(api_key=api_key)

    prompt = ACTION_PLAN_PROMPT.format(
        domain=case.domain or "unknown",
        issue=case.issue or "unknown",
        summary=case.description or case.summary or "No summary",
        evidence_summary="No evidence uploaded yet.",
    )

    try:
        response = client.chat.completions.create(
            model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        content = response.choices[0].message.content.strip()
        start = content.find("[")
        end = content.rfind("]") + 1
        if start >= 0 and end > start:
            steps = json.loads(content[start:end])
            # Ensure each step has a status
            for s in steps:
                s.setdefault("status", "PENDING")
            return steps
    except Exception as e:
        logger.warning("LLM action plan generation failed: %s", e)

    return _fallback_action_plan_steps(case.domain)


def _fallback_action_plan_steps(domain: str | None) -> list[dict]:
    """Static fallback action plan steps."""
    return [
        {"step": 1, "title": "Collect Evidence", "description": "Gather all relevant documents and communications.", "status": "PENDING"},
        {"step": 2, "title": "Document the Issue", "description": "Write a clear timeline of events with dates and details.", "status": "PENDING"},
        {"step": 3, "title": "Send Written Notice", "description": "Send a formal written complaint or notice to the other party.", "status": "PENDING"},
        {"step": 4, "title": "File Official Complaint", "description": "Submit a complaint with the relevant authority or consumer forum.", "status": "PENDING"},
        {"step": 5, "title": "Seek Legal Assistance", "description": "Consult a lawyer or legal aid service if the issue remains unresolved.", "status": "PENDING"},
    ]


def generate_document_with_llm(db: Session, case: Case, doc_type: str = "complaint") -> Document:
    """
    Generate a legal document draft using the LLM.
    """
    from openai import OpenAI
    from app.ai.prompts.templates import DOCUMENT_DRAFT_PROMPT

    api_key = os.getenv("LLM_API_KEY", "")
    content = ""

    if api_key:
        client = OpenAI(api_key=api_key)

        # Gather evidence summary
        from app.models.evidence import Evidence
        evidence_items = db.query(Evidence).filter(Evidence.case_id == case.id).all()
        evidence_summary = "\n".join(
            f"- {e.file_name}: {(e.extracted_text or '')[:200]}" for e in evidence_items
        ) if evidence_items else "No evidence uploaded yet."

        prompt = DOCUMENT_DRAFT_PROMPT.format(
            doc_type=doc_type,
            domain=case.domain or "unknown",
            issue=case.issue or "unknown",
            summary=case.description or case.summary or "No summary",
            evidence_summary=evidence_summary,
        )

        try:
            response = client.chat.completions.create(
                model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
            )
            content = response.choices[0].message.content
        except Exception as e:
            logger.warning("LLM document generation failed: %s", e)
            content = _fallback_document(case, doc_type)
    else:
        content = _fallback_document(case, doc_type)

    doc = Document(
        case_id=case.id,
        doc_type=doc_type,
        content=content,
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


def _fallback_document(case: Case, doc_type: str) -> str:
    """Static fallback document when LLM is unavailable."""
    return f"""DRAFT {doc_type.upper()}
{'=' * 40}

SUBJECT: {case.issue or 'Legal Matter'}

Date: [Date]
To: [Recipient Name and Address]
From: [Your Name and Address]

Dear Sir/Madam,

I am writing to formally bring to your attention the following matter:

{case.description or case.summary or 'Please provide case details.'}

Domain: {case.domain or 'Not classified'}
Issue: {case.issue or 'Not specified'}

I request your immediate attention to this matter and a resolution within a reasonable timeframe.

Sincerely,
[Your Name]
[Your Contact Information]

---
DISCLAIMER: This is an AI-generated draft document prepared by Nyaya Saathi.
It is for informational purposes only and should be reviewed by a qualified
legal professional before submission.
"""


# Legacy compatibility aliases
def generate_action_plan(db: Session, case: Case) -> ActionPlan:
    """Legacy wrapper — redirects to generate_action_plan_with_llm."""
    return generate_action_plan_with_llm(db, case)


def generate_document_draft(db: Session, case: Case) -> Document:
    """Legacy wrapper — redirects to generate_document_with_llm."""
    return generate_document_with_llm(db, case, "legal_notice")
