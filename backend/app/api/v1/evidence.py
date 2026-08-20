"""Evidence route handlers — file upload and extraction."""

import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.case import Case
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()


@router.post("/")
async def upload_evidence(
    case_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a PDF or image as evidence."""
    case = db.query(Case).filter(Case.case_id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Mock extraction for Cyber Financial Fraud demo
    return {
        "evidence_id": f"ev-{uuid.uuid4()}",
        "extracted_entities": {
            "dates": ["18 Aug 2026"],
            "amounts": ["₹20,000"],
            "parties": ["Victim", "Impersonator"]
        }
    }
