"""Pydantic schemas for follow-up questions."""

from datetime import datetime
from pydantic import BaseModel


class QuestionResponse(BaseModel):
    """A single follow-up question with its answer status."""
    id: str
    question: str
    answer: str | None = None
    role: str
    timestamp: datetime

    model_config = {"from_attributes": True}


class QuestionAnswer(BaseModel):
    """Payload for answering a follow-up question."""
    answer: str


class GenerateQuestionsRequest(BaseModel):
    """Optional payload for question generation (can be empty)."""
    pass
