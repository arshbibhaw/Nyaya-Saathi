"""Pydantic schemas for generated documents."""

from datetime import datetime
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    """Returned from GET /cases/{case_id}/document."""
    id: str
    case_id: str
    doc_type: str
    content: str
    generated_at: datetime

    model_config = {"from_attributes": True}
