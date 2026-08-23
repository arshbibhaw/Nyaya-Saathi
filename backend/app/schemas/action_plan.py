"""Pydantic schemas for action plans."""

from pydantic import BaseModel


class ActionPlanStep(BaseModel):
    """A single step in the action plan."""
    step: int
    title: str
    description: str
    status: str = "PENDING"  # PENDING | IN_PROGRESS | COMPLETED


class ActionPlanStepUpdate(BaseModel):
    """Payload for PATCH /cases/:id/action-plan/steps/:stepIndex."""
    status: str  # PENDING | IN_PROGRESS | COMPLETED


class ActionPlanResponse(BaseModel):
    """Returned from GET /cases/{case_id}/plan."""
    id: str
    case_id: str
    steps: list[ActionPlanStep] = []
    status: str

    model_config = {"from_attributes": True}
