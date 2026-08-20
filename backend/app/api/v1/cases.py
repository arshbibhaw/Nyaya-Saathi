"""Cases route handlers — CRUD for legal cases."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.case import Case
from app.models.user import User
from app.schemas.case import CaseCreate, CaseOut
from app.core.security import get_current_user

router = APIRouter()


@router.get("/", response_model=List[CaseOut])
async def list_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all cases for the current user."""
    cases = db.query(Case).filter(Case.user_id == current_user.id).all()
    return cases


@router.post("/", response_model=CaseOut)
async def create_case(
    case_in: CaseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new legal case."""
    new_case = Case(
        user_id=current_user.id,
        issue=case_in.initial_issue,
        domain="General Law", # Can be extracted with LLM in future
        status="open"
    )
    db.add(new_case)
    db.commit()
    db.refresh(new_case)
    return new_case


@router.get("/{case_id}", response_model=CaseOut)
async def get_case(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve a specific case by ID."""
    case = db.query(Case).filter(Case.case_id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case
