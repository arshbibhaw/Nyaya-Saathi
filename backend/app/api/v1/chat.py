"""Chat route handlers — AI legal navigator conversation."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.case import Case
from app.models.user import User
from app.core.security import get_current_user

router = APIRouter()


class ChatMessageRequest(BaseModel):
    message: str


class Citation(BaseModel):
    id: str
    text: str
    relevance: float


class ChatResponse(BaseModel):
    reply: str
    citations: list[Citation]


@router.post("/", response_model=ChatResponse)
async def send_message(
    case_id: str,
    chat_in: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to the AI legal navigator."""
    case = db.query(Case).filter(Case.case_id == case_id, Case.user_id == current_user.id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Mock response for Cyber Financial Fraud demo
    return {
        "reply": f"I understand your issue regarding: '{chat_in.message}'. Based on the Information Technology Act, 2000, specifically Section 66D (Cheating by personation by using computer resource), you should immediately report this fraudulent transaction. We have added this to your action plan. Would you like me to help you draft the complaint?",
        "citations": [
            {
                "id": "cit-1",
                "text": "Information Technology Act, 2000 - Section 66D",
                "relevance": 0.98
            }
        ]
    }
