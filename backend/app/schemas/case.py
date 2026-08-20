"""Case Pydantic schemas."""

from datetime import datetime

from pydantic import BaseModel


class CaseCreate(BaseModel):
    initial_issue: str


class CaseOut(BaseModel):
    case_id: str
    domain: str
    issue: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
