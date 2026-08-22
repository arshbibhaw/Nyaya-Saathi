"""Pydantic schemas for cases and chat."""

from datetime import datetime
from pydantic import BaseModel


class CaseCreate(BaseModel):
    """Payload for POST /cases/ — user describes their problem."""
    initial_issue: str


class CaseResponse(BaseModel):
    """Returned after case creation or retrieval."""
    id: str
    domain: str | None = None
    issue: str | None = None
    status: str
    summary: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatMessage(BaseModel):
    """Single message sent by the user in a case conversation."""
    message: str


class ChatResponse(BaseModel):
    """AI response to a chat message."""
    response: str
    sources: list[dict] = []
    follow_up_questions: list[str] = []
