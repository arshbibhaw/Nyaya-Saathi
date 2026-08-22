"""Cases route handlers — CRUD for legal cases."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.case import Case
from app.models.user import User
from app.schemas.case import CaseCreate, CaseOut
from app.core.security import get_current_user

from datetime import datetime

router = APIRouter()

def get_demo_case_data(case_id: str, created_at: datetime):
    return {
        "caseId": case_id,
        "category": "Cyber Financial Fraud",
        "jurisdiction": {
            "country": "India",
            "state": "Maharashtra"
        },
        "summary": "You reported that ₹20,000 was transferred after a person impersonated a bank representative.",
        "priority": "High",
        "status": "Active",
        "created_at": created_at,
        "evidence": [
            {
                "id": "ev-1",
                "filename": "transaction_screenshot.png",
                "date": "18 Aug 2026",
                "insights": ["Amount: ₹20,000", "Transaction: TXN••••9281", "Date: 18 Aug 2026"]
            }
        ],
        "sources": [
            {
                "id": "src-1",
                "type": "Official government source",
                "name": "India Code",
                "provision": "Information Technology Act, 2000 - Section 66D",
                "explanation": "Provides punishment for cheating by personation by using computer resource."
            }
        ],
        "actionPlan": [
            {
                "step": 1,
                "title": "Preserve transaction evidence",
                "status": "completed"
            },
            {
                "step": 2,
                "title": "Collect communication records",
                "status": "completed"
            },
            {
                "step": 3,
                "title": "Report the incident",
                "status": "current",
                "explanation": "File a complaint on the National Cyber Crime Reporting Portal.",
                "link": "https://cybercrime.gov.in"
            },
            {
                "step": 4,
                "title": "Prepare supporting documents",
                "status": "waiting"
            }
        ],
        "timeline": [
            {"time": "18 Aug · 14:55", "event": "Case created"},
            {"time": "18 Aug · 15:01", "event": "Legal sources retrieved"},
            {"time": "18 Aug · 15:04", "event": "Evidence files analyzed"},
            {"time": "18 Aug · 15:07", "event": "Action plan generated"}
        ]
    }


@router.get("/", response_model=List[CaseOut])
async def list_cases(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all cases for the current user."""
    cases = db.query(Case).filter(Case.user_id == current_user.id).all()
    # Mock return for demo
    return [get_demo_case_data(case.case_id, case.created_at) for case in cases]


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
    return get_demo_case_data(new_case.case_id, new_case.created_at)


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
    return get_demo_case_data(case.case_id, case.created_at)
