"""
Case routes: create, list, get, and chat.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.case_question import CaseQuestion
from app.schemas.case import CaseCreate, CaseResponse, ChatMessage, ChatResponse
from app.services.case_service import classify_and_create_case, handle_chat

router = APIRouter(prefix="/cases", tags=["Cases"])


@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_case(
    payload: CaseCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Create a new case from a natural-language issue description."""
    case = classify_and_create_case(db, user.id, payload.initial_issue)
    return case


@router.get("/", response_model=list[CaseResponse])
def list_cases(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all cases belonging to the authenticated user."""
    cases = db.query(Case).filter(Case.user_id == user.id).order_by(Case.created_at.desc()).offset(skip).limit(limit).all()
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


@router.post("/{case_id}/chat", response_model=ChatResponse)
def chat(
    case_id: str,
    payload: ChatMessage,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Send a message in the context of a case and get an AI response."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Persist the user message
    user_msg = CaseQuestion(case_id=case_id, question=payload.message, role="user")
    db.add(user_msg)
    db.commit()

    # Generate AI response
    response = handle_chat(db, case, payload.message)

    # Persist the AI response
    ai_msg = CaseQuestion(case_id=case_id, question=response.response, role="assistant")
    db.add(ai_msg)
    db.commit()

    return response
