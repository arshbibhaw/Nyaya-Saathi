"""Pydantic schemas for evidence checklist."""

from datetime import datetime
from pydantic import BaseModel


class EvidenceChecklistItem(BaseModel):
    """A single item in the evidence checklist."""
    id: str
    item: str
    description: str | None = None
    required: bool = True
    available: bool = False
    status: str = "MISSING"
    created_at: datetime

    model_config = {"from_attributes": True}


class EvidenceChecklistResponse(BaseModel):
    """Full evidence checklist for a case."""
    case_id: str
    items: list[EvidenceChecklistItem] = []
