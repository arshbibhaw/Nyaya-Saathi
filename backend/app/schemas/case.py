"""Pydantic schemas for cases and chat."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


VALID_STATUSES = {"ACTIVE", "PENDING_EVIDENCE", "ANALYZING", "PLAN_GENERATED", "RESOLVED", "ESCALATED", "ARCHIVED"}


class CaseCreate(BaseModel):
    """Payload for POST /cases/ — user describes their problem."""
    initial_issue: str
    location: Optional[str] = None


class CaseResponse(BaseModel):
    """Returned after case creation or retrieval."""
    id: str
    title: str | None = None
    description: str | None = None
    domain: str | None = None
    issue: str | None = None
    subcategory: str | None = None
    urgency: str | None = None
    status: str
    summary: str | None = None
    location: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CaseUpdate(BaseModel):
    """Payload for PATCH /cases/{id}."""
    title: str | None = None
    description: str | None = None
    location: str | None = None


class CaseStatusUpdate(BaseModel):
    """Payload for PATCH /cases/{id}/status."""
    status: str


class ChatMessage(BaseModel):
    """Single message sent by the user in a case conversation."""
    message: str


class ChatResponse(BaseModel):
    """AI response to a chat message."""
    response: str
    sources: list[dict] = []
    follow_up_questions: list[str] = []


class MessageResponse(BaseModel):
    """Single message in the conversation history."""
    id: str
    role: str
    content: str
    timestamp: datetime

    model_config = {"from_attributes": True}
