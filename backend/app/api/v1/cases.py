"""
Case routes: create, list, get, update, status, archive, classify, chat, messages.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.case_question import CaseQuestion
from app.schemas.case import (
    CaseCreate, CaseResponse, CaseUpdate, CaseStatusUpdate,
    ChatMessage, ChatResponse, MessageResponse, VALID_STATUSES,
)
from app.services.case_service import classify_and_create_case, handle_chat_stream

router = APIRouter(prefix="/cases", tags=["Cases"])


# ── CRUD ─────────────────────────────────────────────────────────────────────

@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    payload: CaseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new case from a natural-language issue description."""
    case = classify_and_create_case(db, user.id, payload.initial_issue, location=payload.location)
    return case


@router.get("/", response_model=list[CaseResponse])
def list_cases(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all cases belonging to the authenticated user."""
    cases = (
        db.query(Case)
        .filter(Case.user_id == user.id, Case.status != "ARCHIVED")
        .order_by(Case.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    return cases


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get a single case by ID (must belong to the authenticated user)."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")
    return case


@router.patch("/{case_id}", response_model=CaseResponse)
def update_case(
    case_id: str,
    payload: CaseUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update case fields (title, description, location)."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    if payload.title is not None:
        case.title = payload.title
    if payload.description is not None:
        case.description = payload.description
    if payload.location is not None:
        case.location = payload.location

    db.commit()
    db.refresh(case)
    return case


@router.patch("/{case_id}/status", response_model=CaseResponse)
def update_case_status(
    case_id: str,
    payload: CaseStatusUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Change the status of a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    if payload.status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status. Valid values: {VALID_STATUSES}",
        )

    case.status = payload.status
    db.commit()
    db.refresh(case)
    return case


@router.delete("/{case_id}", status_code=status.HTTP_200_OK)
def archive_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Soft-archive a case by setting its status to ARCHIVED."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    case.status = "ARCHIVED"
    db.commit()
    return {"detail": "Case archived successfully"}


# ── Classify ─────────────────────────────────────────────────────────────────

@router.post("/{case_id}/classify", response_model=CaseResponse)
def classify_case(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Re-classify an existing case using the AI classifier."""
    from app.ai.classifier import analyze_and_classify_legal_matter

    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    text = case.description or case.summary or case.issue or ""
    if not text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Case has no description to classify",
        )

    analysis = analyze_and_classify_legal_matter(text)
    case.domain = analysis.primary_domain
    case.issue = analysis.primary_legal_issue
    case.subcategory = analysis.subcategory
    case.urgency = analysis.urgency
    case.title = analysis.primary_domain_display
    case.status = "ACTIVE"

    db.commit()
    db.refresh(case)
    return case


# ── Chat ─────────────────────────────────────────────────────────────────────

@router.post("/{case_id}/chat")
def chat(
    case_id: str,
    payload: ChatMessage,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Send a message in the context of a case and stream an AI response."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Persist the user message
    user_msg = CaseQuestion(case_id=case_id, question=payload.message, role="user")
    db.add(user_msg)
    db.commit()

    # Stream AI response
    return StreamingResponse(
        handle_chat_stream(db, case, payload.message),
        media_type="text/event-stream"
    )


@router.get("/{case_id}/messages", response_model=list[MessageResponse])
def get_messages(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Retrieve the full conversation history for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    messages = (
        db.query(CaseQuestion)
        .filter(CaseQuestion.case_id == case_id)
        .order_by(CaseQuestion.timestamp)
        .all()
    )

    return [
        MessageResponse(
            id=m.id,
            role=m.role,
            content=m.question,
            timestamp=m.timestamp,
        )
        for m in messages
    ]
