"""
Evidence upload route.
"""

import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.case import Case
from app.models.evidence import Evidence
from app.schemas.evidence import EvidenceResponse, ExtractedEntities
from app.ai.ocr.extractor import extract_text

router = APIRouter(tags=["Evidence"])

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
}


@router.post(
    "/cases/{case_id}/evidence",
    response_model=EvidenceResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_evidence(
    case_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Upload a PDF or image as evidence, trigger OCR, and store extracted data."""
    # Verify case ownership
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Validate file type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type: {file.content_type}. Allowed: {ALLOWED_MIME_TYPES}",
        )

    # Save file to disk
    upload_dir = os.path.join(settings.UPLOAD_DIR, case_id)
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, file.filename)

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit",
        )

    with open(file_path, "wb") as f:
        f.write(contents)

    # Run OCR / text extraction
    extracted_text = extract_text(file_path, file.content_type)

    # Use LLM to extract entities
    from app.ai.llm.client import LLMClient
    from app.ai.prompts.evidence import format_evidence_prompt
    
    extracted_entities = ExtractedEntities()
    
    if extracted_text and extracted_text.strip():
        messages = format_evidence_prompt(
            document_text=extracted_text,
            filename=file.filename,
            mime_type=file.content_type,
            category=case.domain or "unknown",
            subcategory=case.issue or "unknown",
        )
        
        try:
            client = LLMClient()
            result = await client.complete_structured(
                messages=messages,
                response_model=ExtractedEntities,
                step="evidence",
                case_id=case_id,
            )
            extracted_entities = result["parsed"]
        except Exception as e:
            # Fallback if extraction fails
            print(f"Entity extraction failed: {e}")

    # Persist
    evidence = Evidence(
        case_id=case_id,
        file_name=file.filename,
        mime_type=file.content_type,
        file_path=file_path,
        extracted_text=extracted_text,
        metadata_json=extracted_entities.model_dump(),
    )
    db.add(evidence)
    db.commit()
    db.refresh(evidence)

    return EvidenceResponse(
        id=evidence.id,
        file_name=evidence.file_name,
        mime_type=evidence.mime_type,
        extracted_text=evidence.extracted_text,
        extracted_entities=extracted_entities,
        created_at=evidence.created_at,
    )
