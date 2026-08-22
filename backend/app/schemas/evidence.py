"""Pydantic schemas for evidence uploads."""

from datetime import datetime
from pydantic import BaseModel


class ExtractedEntities(BaseModel):
    """Structured entities pulled from OCR text."""
    dates: list[str] = []
    amounts: list[str] = []
    parties: list[str] = []
    key_statements: list[str] = []


class EvidenceResponse(BaseModel):
    """Returned after a successful evidence upload."""
    id: str
    file_name: str
    mime_type: str
    extracted_text: str | None = None
    extracted_entities: ExtractedEntities | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
