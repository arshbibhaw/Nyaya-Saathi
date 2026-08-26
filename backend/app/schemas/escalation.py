"""Pydantic schemas for escalation requests."""

from datetime import datetime
from pydantic import BaseModel


class EscalationCreate(BaseModel):
    """Payload for POST /cases/:id/escalation."""
    reason: str
    urgency: str = "MEDIUM"


class EscalationResponse(BaseModel):
    """Returned after escalation creation or retrieval."""
    id: str
    case_id: str
    user_id: str
    reason: str
    urgency: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class EscalationStatusUpdate(BaseModel):
    """Payload for PATCH /admin/escalations/:id."""
    status: str  # REQUESTED | UNDER_REVIEW | COMPLETED | CANCELLED
