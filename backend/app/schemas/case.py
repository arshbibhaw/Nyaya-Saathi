"""Case Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel


from typing import Optional, List, Dict, Any

class CaseCreate(BaseModel):
    initial_issue: str
    location: Optional[str] = None
    urgency: Optional[str] = None

class Jurisdiction(BaseModel):
    country: str
    state: str

class CaseOut(BaseModel):
    caseId: str
    category: str
    jurisdiction: Jurisdiction
    summary: str
    priority: str
    status: str
    created_at: datetime
    evidence: List[Dict[str, Any]] = []
    sources: List[Dict[str, Any]] = []
    actionPlan: List[Dict[str, Any]] = []
    timeline: List[Dict[str, Any]] = []

    model_config = {"from_attributes": True}
