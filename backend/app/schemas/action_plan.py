"""Pydantic schemas for action plans."""

from pydantic import BaseModel


class ActionPlanStep(BaseModel):
    """A single step in the action plan."""
    step: int
    title: str
    description: str


class ActionPlanResponse(BaseModel):
    """Returned from GET /cases/{case_id}/plan."""
    id: str
    case_id: str
    steps: list[ActionPlanStep] = []
    status: str

    model_config = {"from_attributes": True}
