"""Documents and Plan route handlers."""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.case import Case
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()


class DocumentRequest(BaseModel):
    doc_type: str


@router.get("/document")
async def get_document(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch the previously generated document."""
    # Mock response
    return {
        "id": f"doc-{uuid.uuid4()}",
        "case_id": case_id,
        "doc_type": "Cyber Complaint Draft",
        "content": "To the Cyber Cell,\n\nI am writing to report a fraudulent transaction of ₹20,000 on 18 Aug 2026...",
        "created_at": "2026-08-18T15:00:00Z"
    }


@router.post("/document")
async def generate_document(
    case_id: str,
    doc_in: DocumentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate a legal document."""
    # Mock response
    return {
        "id": f"doc-{uuid.uuid4()}",
        "case_id": case_id,
        "doc_type": doc_in.doc_type,
        "content": f"This is a mock generated {doc_in.doc_type} for your cyber fraud complaint. Please review and edit.",
        "created_at": "2026-08-18T15:00:00Z"
    }


@router.get("/plan")
async def get_action_plan(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch the generated action plan for the case."""
    # Mock response for Cyber Financial Fraud demo
    return {
        "case_id": case_id,
        "plan_status": "generated",
        "steps": [
            {
                "step": 1,
                "title": "Preserve transaction evidence",
                "description": "Ensure you have screenshots of the transaction and communication.",
                "status": "completed"
            },
            {
                "step": 2,
                "title": "Collect communication records",
                "description": "Gather call logs or messages from the impersonator.",
                "status": "completed"
            },
            {
                "step": 3,
                "title": "Report the incident",
                "description": "File a complaint on the National Cyber Crime Reporting Portal.",
                "status": "current",
                "link": "https://cybercrime.gov.in"
            },
            {
                "step": 4,
                "title": "Prepare supporting documents",
                "description": "Draft a formal complaint letter to your bank.",
                "status": "waiting"
            }
        ]
    }
