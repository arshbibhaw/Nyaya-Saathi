"""
Case service — orchestrates AI calls for case creation, chat, plans, and documents.
"""

import json
import logging
import os
import re
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
    # 1. Advanced Analysis & Classification
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
            "title": "Immediate Evidence Preservation",
            "description": analysis.immediate_preservation_step,
            "status": "PENDING",
        },
        {
            "step": 2,
            "title": "Statutory Notice or Communication",
            "description": analysis.communication_or_notice_step,
            "status": "PENDING",
        },
        {
            "step": 3,
            "title": "Filing with Regulatory / Judicial Authority",
            "description": analysis.statutory_authority_or_court_step,
            "status": "PENDING",
        },
        {
            "step": 4,
            "title": "Time-Sensitive Limitation Actions",
            "description": analysis.time_sensitive_actions,
            "status": "PENDING",
        },
        {
            "step": 5,
            "title": "Escalation & Enforcement Roadmap",
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
    Analyzes case domain, question context, and returns tailored Indian legal guidance.
    """
    from app.ai.chat_engine import generate_dynamic_chat_response

    # Gather past conversation history
    history = (
        db.query(CaseQuestion)
        .filter(CaseQuestion.case_id == case.id)
        .order_by(CaseQuestion.timestamp)
        .all()
    )
    history_dicts = [
        {"role": q.role, "content": q.question} for q in history
    ]

    ai_text, sources, follow_ups = generate_dynamic_chat_response(
        case_domain=case.domain,
        case_issue=case.issue,
        case_description=case.description or case.summary,
        case_location=case.location,
        user_message=message,
        conversation_history=history_dicts,
    )

    # Persist assistant turn in DB
    ai_msg = CaseQuestion(case_id=case.id, question=ai_text, role="assistant")
    db.add(ai_msg)
    db.commit()

    return ChatResponse(
        response=ai_text,
        reply=ai_text,
        sources=sources,
        follow_up_questions=follow_ups,
    )



def handle_chat_stream(db: Session, case: Case, message: str):
    """
    Handle a single chat turn as an SSE stream.
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
    if not sources:
        sources = [{"title": f"{case.domain or 'Indian Statutory Law'} Framework", "source_url": "https://indiacode.nic.in"}]

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

    # If stream was empty, use handle_chat logic
    if not full_response.strip():
        resp = handle_chat(db, case, message)
        full_response = resp.reply or resp.response or "Legal guidance processed."
        yield f"data: {json.dumps({'type': 'chunk', 'text': full_response})}\n\n"
    else:
        # Persist the AI response
        ai_msg = CaseQuestion(case_id=case.id, question=full_response, role="assistant")
        db.add(ai_msg)
        db.commit()


def generate_action_plan_with_llm(db: Session, case: Case) -> ActionPlan:
    """
    Generate an action plan using LLM or structured classification.
    """
    plan = db.query(ActionPlan).filter(ActionPlan.case_id == case.id).first()
    if plan:
        return plan

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
    """Call LLM or generate domain-calibrated action plan steps."""
    api_key = os.getenv("LLM_API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
    if api_key:
        try:
            from openai import OpenAI
            from app.ai.prompts.templates import ACTION_PLAN_PROMPT
            client = OpenAI(api_key=api_key, timeout=3.0, max_retries=0)
            prompt = ACTION_PLAN_PROMPT.format(
                domain=case.domain or "unknown",
                issue=case.issue or "unknown",
                summary=case.description or case.summary or "No summary",
                evidence_summary="No evidence uploaded yet.",
            )
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
                for s in steps:
                    s.setdefault("status", "PENDING")
                return steps
        except Exception as e:
            logger.warning("LLM action plan generation failed: %s", e)

    # Use analysis from classifier
    analysis = analyze_and_classify_legal_matter(case.description or case.summary or case.issue or "")
    return [
        {"step": 1, "title": "Immediate Preservation", "description": analysis.immediate_preservation_step, "status": "PENDING"},
        {"step": 2, "title": "Communication or Notice", "description": analysis.communication_or_notice_step, "status": "PENDING"},
        {"step": 3, "title": "Statutory Authority / Court", "description": analysis.statutory_authority_or_court_step, "status": "PENDING"},
        {"step": 4, "title": "Time-Sensitive Actions", "description": analysis.time_sensitive_actions, "status": "PENDING"},
        {"step": 5, "title": "Escalation & Enforcement", "description": analysis.escalation_path, "status": "PENDING"},
    ]


def generate_document_with_llm(db: Session, case: Case, doc_type: str = "complaint") -> Document:
    """
    Generate a legal document draft using LLM or structured classification.
    """
    api_key = os.getenv("LLM_API_KEY", "") or os.getenv("OPENAI_API_KEY", "")
    content = ""

    if api_key:
        try:
            from openai import OpenAI
            from app.ai.prompts.templates import DOCUMENT_DRAFT_PROMPT
            from app.models.evidence import Evidence
            client = OpenAI(api_key=api_key, timeout=3.0, max_retries=0)

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
    """Dynamic domain-aware document draft."""
    analysis = analyze_and_classify_legal_matter(case.description or case.summary or case.issue or "")
    if analysis.legal_notice:
        return f"""{analysis.legal_notice.title}
{'=' * 50}

SUBJECT: {analysis.legal_notice.subject}

{analysis.legal_notice.notice_text}

---
DISCLAIMER: This is an AI-generated draft prepared by Nyaya Saathi.
It is for informational purposes and should be reviewed before formal submission.
"""

    return f"""DRAFT {doc_type.upper()}
{'=' * 40}

SUBJECT: {case.issue or 'Legal Matter'}

Date: [Date]
To: [Opposite Party / Authority Name and Address]
From: [Your Name and Address]

Dear Sir/Madam,

I am writing to formally bring to your attention the following matter:

{case.description or case.summary or 'Please provide case details.'}

Legal Domain: {case.domain or 'General Civil'}
Applicable Law: {case.issue or 'Statutory provisions'}

I request your immediate attention to this matter and a resolution within 15 days.

Sincerely,
[Your Name]
[Your Contact Information]

---
DISCLAIMER: This is an AI-generated draft prepared by Nyaya Saathi.
"""


def generate_action_plan(db: Session, case: Case) -> ActionPlan:
    return generate_action_plan_with_llm(db, case)


def generate_document_draft(db: Session, case: Case) -> Document:
    return generate_document_with_llm(db, case, "legal_notice")
