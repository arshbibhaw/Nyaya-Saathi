"""Pydantic schemas for generated documents."""

from datetime import datetime
from pydantic import BaseModel


class DocumentGenerateRequest(BaseModel):
    """Payload for POST /cases/:id/documents/generate."""
    doc_type: str = "complaint"  # complaint | notice | letter | consumer_grievance | salary_request


class DocumentResponse(BaseModel):
    """Returned from GET /cases/{case_id}/document(s)."""
    id: str
    case_id: str
    doc_type: str
    content: str
    generated_at: datetime

    model_config = {"from_attributes": True}
