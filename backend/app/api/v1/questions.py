"""
Follow-up questions routes: generate, list, answer.
"""

import json
import os
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.case_question import CaseQuestion
from app.schemas.question import QuestionResponse, QuestionAnswer

router = APIRouter(tags=["Follow-up Questions"])


@router.post(
    "/cases/{case_id}/questions/generate",
    response_model=list[QuestionResponse],
    status_code=status.HTTP_201_CREATED,
)
def generate_questions(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """AI generates follow-up questions based on the case context."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Build context for question generation
    domain = case.domain or "general"
    issue = case.issue or "unknown"
    summary = case.description or case.summary or ""

    questions_text = _generate_follow_up_questions(domain, issue, summary)

    # Parse and persist questions
    created = []
    for q_text in questions_text:
        q = CaseQuestion(
            case_id=case_id,
            question=q_text,
            role="assistant",
        )
        db.add(q)
        db.flush()
        created.append(q)

    db.commit()

    return [QuestionResponse.model_validate(q) for q in created]


@router.get("/cases/{case_id}/questions", response_model=list[QuestionResponse])
def list_questions(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all follow-up questions and their answers for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    questions = (
        db.query(CaseQuestion)
        .filter(CaseQuestion.case_id == case_id, CaseQuestion.role == "assistant")
        .order_by(CaseQuestion.timestamp)
        .all()
    )
    return [QuestionResponse.model_validate(q) for q in questions]


@router.post(
    "/cases/{case_id}/questions/{question_id}/answer",
    response_model=QuestionResponse,
)
def answer_question(
    case_id: str,
    question_id: str,
    payload: QuestionAnswer,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """User answers a follow-up question."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    question = (
        db.query(CaseQuestion)
        .filter(CaseQuestion.id == question_id, CaseQuestion.case_id == case_id)
        .first()
    )
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    question.answer = payload.answer
    db.commit()
    db.refresh(question)
    return QuestionResponse.model_validate(question)


def _generate_follow_up_questions(domain: str, issue: str, summary: str) -> list[str]:
    """Use the LLM to generate context-aware follow-up questions."""
    from openai import OpenAI

    api_key = os.getenv("LLM_API_KEY", "")
    if not api_key:
        # Fallback static questions
        return _static_follow_up_questions(domain)

    client = OpenAI(api_key=api_key)

    prompt = f"""You are a legal intake assistant for Nyaya Saathi, an Indian legal aid platform.

Based on the following case information, generate 4-6 specific follow-up questions
that would help build a stronger legal case.

Case domain: {domain}
Case issue: {issue}
Case summary: {summary}

Respond ONLY with a JSON array of question strings, no other text.
Example: ["When did this incident occur?", "Do you have a written agreement?"]
"""

    try:
        response = client.chat.completions.create(
            model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        content = response.choices[0].message.content.strip()
        # Parse JSON array from response
        if content.startswith("["):
            return json.loads(content)
        return _static_follow_up_questions(domain)
    except Exception:
        return _static_follow_up_questions(domain)


def _static_follow_up_questions(domain: str) -> list[str]:
    """Fallback static questions organized by domain."""
    domain_questions = {
        "rental": [
            "When did you pay the security deposit?",
            "Do you have a rental agreement?",
            "When did you move out?",
            "Did you formally request a refund from the landlord?",
            "Do you have proof of payment (bank transfer, receipt)?",
        ],
        "cyber_fraud": [
            "When did the fraud occur?",
            "What amount was lost?",
            "Have you reported this to your bank?",
            "Do you have screenshots of the transaction?",
            "Have you filed a complaint on cybercrime.gov.in?",
        ],
        "employment": [
            "How long have you worked with this employer?",
            "Do you have an employment contract or offer letter?",
            "What is the salary amount that is unpaid?",
            "Have you raised this issue with HR?",
            "Do you have payslips showing the discrepancy?",
        ],
        "consumer": [
            "When did you purchase the product or service?",
            "Do you have the receipt or invoice?",
            "Have you contacted the seller about this issue?",
            "What was the cost of the product or service?",
            "Do you have photos of the defective product?",
        ],
    }

    # Match domain loosely
    for key, questions in domain_questions.items():
        if key in (domain or "").lower():
            return questions

    return [
        "When did this incident occur?",
        "Do you have any written documentation?",
        "Have you contacted the other party about this issue?",
        "What is the financial impact, if any?",
        "Have you reported this to any authority?",
    ]
