"""
Document generation routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.document import Document
from app.schemas.document import DocumentResponse
from app.services.case_service import generate_document_draft

router = APIRouter(tags=["Documents"])


@router.get("/cases/{case_id}/document", response_model=DocumentResponse)
def get_document(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Fetch the generated document draft for a case.
    If no document exists yet, generates one using the AI service.
    """
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Look for an existing document
    doc = db.query(Document).filter(Document.case_id == case_id).first()

    if not doc:
        doc = generate_document_draft(db, case)

    return doc
