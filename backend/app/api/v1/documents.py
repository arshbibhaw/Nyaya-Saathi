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
        "doc_type": "Legal Notice",
        "content": "This is a mock legal notice for unpaid wages...",
        "created_at": "2023-10-15T12:00:00Z"
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
        "content": f"This is a mock generated {doc_in.doc_type} based on your case details. Please review and edit as needed.",
        "created_at": "2023-10-15T12:00:00Z"
    }


@router.get("/plan")
async def get_action_plan(
    case_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Fetch the generated action plan for the case."""
    # Mock response
    return {
        "case_id": case_id,
        "plan_status": "generated",
        "steps": [
            {
                "step": 1,
                "title": "Gather all employment contracts and bank statements.",
                "description": "Ensure you have proof of employment and missing deposits."
            },
            {
                "step": 2,
                "title": "Send a formal legal notice.",
                "description": "Use the document generator to draft a notice for unpaid dues under the Payment of Wages Act."
            },
            {
                "step": 3,
                "title": "File a complaint with the Labour Commissioner.",
                "description": "If the notice is ignored for 15 days, escalate to the local labour office."
            }
        ]
    }
