"""
Evidence upload, list, delete, and checklist routes.
"""

import json
import os

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.core.config import settings
from app.models.user import User
from app.models.case import Case
from app.models.evidence import Evidence
from app.models.evidence_checklist import EvidenceChecklist
from app.schemas.evidence import EvidenceResponse, ExtractedEntities
from app.schemas.evidence_checklist import EvidenceChecklistItem, EvidenceChecklistResponse
from app.ai.ocr.extractor import extract_text

router = APIRouter(tags=["Evidence"])

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
}


# ── Upload ───────────────────────────────────────────────────────────────────

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
    extracted_text = extract_text(contents, file.content_type)

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

    # Auto-generate notification
    try:
        from app.api.v1.notifications import create_notification
        create_notification(
            db, user.id,
            title="Evidence Uploaded",
            message=f"'{file.filename}' has been uploaded and processed for case analysis.",
            notif_type="success",
        )
    except Exception:
        pass  # Non-critical

    return EvidenceResponse(
        id=evidence.id,
        file_name=evidence.file_name,
        mime_type=evidence.mime_type,
        extracted_text=evidence.extracted_text,
        extracted_entities=extracted_entities,
        created_at=evidence.created_at,
    )


# ── List ─────────────────────────────────────────────────────────────────────

@router.get("/cases/{case_id}/evidence", response_model=list[EvidenceResponse])
def list_evidence(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List all uploaded evidence for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    items = db.query(Evidence).filter(Evidence.case_id == case_id).order_by(Evidence.created_at).all()
    return [
        EvidenceResponse(
            id=e.id,
            file_name=e.file_name,
            mime_type=e.mime_type,
            extracted_text=e.extracted_text,
            extracted_entities=ExtractedEntities(**(e.metadata_json or {})) if e.metadata_json else None,
            created_at=e.created_at,
        )
        for e in items
    ]


# ── Delete ───────────────────────────────────────────────────────────────────

@router.delete("/evidence/{evidence_id}", status_code=status.HTTP_200_OK)
def delete_evidence(
    evidence_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Delete an evidence file (ownership check via case)."""
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    # Ownership check
    case = db.query(Case).filter(Case.id == evidence.case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found")

    # Delete file from disk
    if os.path.exists(evidence.file_path):
        os.remove(evidence.file_path)

    db.delete(evidence)
    db.commit()
    return {"detail": "Evidence deleted successfully"}


# ── Evidence Checklist ───────────────────────────────────────────────────────

@router.post(
    "/cases/{case_id}/evidence-checklist/generate",
    response_model=EvidenceChecklistResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_evidence_checklist(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """AI generates an evidence checklist based on the case category and uploaded evidence."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Delete existing checklist items for regeneration
    db.query(EvidenceChecklist).filter(EvidenceChecklist.case_id == case_id).delete()

    # Get uploaded evidence names
    uploaded = db.query(Evidence).filter(Evidence.case_id == case_id).all()
    uploaded_names = [e.file_name for e in uploaded]

    # Generate checklist
    checklist_items = _generate_checklist(case.domain, case.issue, case.description or case.summary, uploaded_names)

    created = []
    for item_data in checklist_items:
        item = EvidenceChecklist(
            case_id=case_id,
            item=item_data["item"],
            description=item_data.get("description", ""),
            required=item_data.get("required", True),
            available=item_data.get("available", False),
            status="AVAILABLE" if item_data.get("available") else "MISSING",
        )
        db.add(item)
        db.flush()
        created.append(item)

    db.commit()
    return EvidenceChecklistResponse(
        case_id=case_id,
        items=[EvidenceChecklistItem.model_validate(i) for i in created],
    )


@router.get("/cases/{case_id}/evidence-checklist", response_model=EvidenceChecklistResponse)
def get_evidence_checklist(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Fetch the evidence checklist for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    items = db.query(EvidenceChecklist).filter(EvidenceChecklist.case_id == case_id).all()
    return EvidenceChecklistResponse(
        case_id=case_id,
        items=[EvidenceChecklistItem.model_validate(i) for i in items],
    )


def _generate_checklist(domain: str | None, issue: str | None, summary: str | None, uploaded: list[str]) -> list[dict]:
    """Use the LLM to generate an evidence checklist, with a static fallback."""
    from openai import OpenAI

    api_key = os.getenv("LLM_API_KEY", "")
    if not api_key:
        return _static_checklist(domain, uploaded)

    client = OpenAI(api_key=api_key)
    uploaded_str = ", ".join(uploaded) if uploaded else "None uploaded yet"

    prompt = f"""You are a legal evidence analyst for Nyaya Saathi.

Based on the case details below, generate a checklist of evidence items
that would strengthen this legal case.

Case domain: {domain or 'unknown'}
Case issue: {issue or 'unknown'}
Case summary: {summary or 'No summary'}
Already uploaded files: {uploaded_str}

For each item, indicate whether it appears to already be available (based on uploaded filenames).

Respond ONLY with a JSON array:
[
  {{"item": "Rental Agreement", "description": "Copy of the signed rental/lease agreement", "required": true, "available": false}},
  ...
]

Generate 5-8 items.
"""

    try:
        response = client.chat.completions.create(
            model=os.getenv("LLM_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        content = response.choices[0].message.content.strip()
        # Find JSON array in response
        start = content.find("[")
        end = content.rfind("]") + 1
        if start >= 0 and end > start:
            return json.loads(content[start:end])
    except Exception:
        pass

    return _static_checklist(domain, uploaded)


def _static_checklist(domain: str | None, uploaded: list[str]) -> list[dict]:
    """Static fallback checklists by domain."""
    domain_checklists = {
        "rental": [
            {"item": "Rental Agreement", "description": "Signed copy of the rental/lease agreement", "required": True},
            {"item": "Security Deposit Receipt", "description": "Proof of security deposit payment", "required": True},
            {"item": "Bank Transaction Proof", "description": "Bank statement showing deposit transfer", "required": True},
            {"item": "Communication with Landlord", "description": "Messages, emails, or letters with the landlord", "required": False},
            {"item": "Written Refund Request", "description": "Formal written request for deposit refund", "required": True},
            {"item": "Move-out Inspection Report", "description": "Report from the move-out inspection", "required": False},
        ],
        "cyber_fraud": [
            {"item": "Transaction Screenshot", "description": "Screenshot of the fraudulent transaction", "required": True},
            {"item": "Bank Statement", "description": "Bank statement showing the unauthorized debit", "required": True},
            {"item": "FIR Copy", "description": "First Information Report from police", "required": True},
            {"item": "Cybercrime Portal Complaint", "description": "Complaint number from cybercrime.gov.in", "required": True},
            {"item": "Communication Evidence", "description": "Screenshots of messages from the fraudster", "required": False},
            {"item": "ID Proof", "description": "Your identity document for verification", "required": True},
        ],
        "employment": [
            {"item": "Employment Contract", "description": "Signed employment contract or offer letter", "required": True},
            {"item": "Payslips", "description": "Recent payslips showing salary details", "required": True},
            {"item": "Bank Statements", "description": "Bank statements showing salary credits", "required": True},
            {"item": "HR Communication", "description": "Emails or messages with HR about the issue", "required": False},
            {"item": "Resignation Letter", "description": "Copy of resignation letter, if applicable", "required": False},
        ],
        "consumer": [
            {"item": "Purchase Receipt", "description": "Invoice or receipt for the product/service", "required": True},
            {"item": "Product Photos", "description": "Photos showing the defect or issue", "required": True},
            {"item": "Warranty Card", "description": "Warranty or guarantee documentation", "required": False},
            {"item": "Complaint Correspondence", "description": "Communication with the seller about the issue", "required": True},
            {"item": "Payment Proof", "description": "Bank/card statement showing the payment", "required": True},
        ],
    }

    # Match domain
    items = []
    for key, checklist in domain_checklists.items():
        if key in (domain or "").lower():
            items = checklist
            break

    if not items:
        items = [
            {"item": "Identity Proof", "description": "Government-issued ID document", "required": True},
            {"item": "Supporting Documents", "description": "Any documents related to your case", "required": True},
            {"item": "Communication Records", "description": "Messages, emails, or letters with the other party", "required": False},
            {"item": "Financial Records", "description": "Bank statements or payment receipts", "required": False},
            {"item": "Written Complaint", "description": "Formal complaint letter", "required": True},
        ]

    # Mark items as available if filename matches loosely
    uploaded_lower = [u.lower() for u in uploaded]
    for item in items:
        item_lower = item["item"].lower()
        item["available"] = any(item_lower.split()[0] in u for u in uploaded_lower)

    return items
