"""
Document generation routes: generate, list, get.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.document import Document
from app.schemas.document import DocumentResponse, DocumentGenerateRequest
from app.services.case_service import generate_document_with_llm

router = APIRouter(tags=["Documents"])


@router.post(
    "/cases/{case_id}/documents/generate",
    response_model=DocumentResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_document(
    case_id: str,
    payload: DocumentGenerateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Generate a legal document draft for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    doc = generate_document_with_llm(db, case, payload.doc_type)
    return doc


@router.get("/cases/{case_id}/documents", response_model=list[DocumentResponse])
def list_documents(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all generated documents for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    docs = db.query(Document).filter(Document.case_id == case_id).order_by(Document.generated_at.desc()).all()
    return docs


@router.get("/cases/{case_id}/document", response_model=DocumentResponse)
def get_document(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Fetch the latest generated document for a case. Auto-generates if none exists."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    doc = db.query(Document).filter(Document.case_id == case_id).order_by(Document.generated_at.desc()).first()

    if not doc:
        doc = generate_document_with_llm(db, case, "complaint")

    return doc


@router.get("/documents/{document_id}", response_model=DocumentResponse)
def get_document_by_id(
    document_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get a single document by ID (ownership check via case)."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    case = db.query(Case).filter(Case.id == doc.case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")

    return doc
