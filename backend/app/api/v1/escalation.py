"""
Escalation routes: create and view escalation requests.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.escalation import Escalation
from app.schemas.escalation import EscalationCreate, EscalationResponse

router = APIRouter(tags=["Escalation"])


@router.post(
    "/cases/{case_id}/escalation",
    response_model=EscalationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_escalation(
    case_id: str,
    payload: EscalationCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Request human legal assistance for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Check for existing active escalation
    existing = (
        db.query(Escalation)
        .filter(
            Escalation.case_id == case_id,
            Escalation.status.in_(["REQUESTED", "UNDER_REVIEW"]),
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An active escalation request already exists for this case",
        )

    escalation = Escalation(
        case_id=case_id,
        user_id=user.id,
        reason=payload.reason,
        urgency=payload.urgency,
    )
    db.add(escalation)

    # Update case status
    case.status = "ESCALATED"

    db.commit()
    db.refresh(escalation)
    return escalation


@router.get("/cases/{case_id}/escalation", response_model=list[EscalationResponse])
def get_escalations(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """View all escalation requests for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    escalations = (
        db.query(Escalation)
        .filter(Escalation.case_id == case_id)
        .order_by(Escalation.created_at.desc())
        .all()
    )
    return escalations
