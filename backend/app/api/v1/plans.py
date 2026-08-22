"""
Action plan routes.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.action_plan import ActionPlan
from app.schemas.action_plan import ActionPlanResponse, ActionPlanStep
from app.services.case_service import generate_action_plan

router = APIRouter(tags=["Action Plans"])


@router.get("/cases/{case_id}/plan", response_model=ActionPlanResponse)
def get_plan(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """
    Fetch the action plan for a case.
    If no plan exists yet, generates one using the AI service.
    """
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Look for an existing plan
    plan = db.query(ActionPlan).filter(ActionPlan.case_id == case_id).first()

    if not plan:
        # Generate a new plan via the AI service
        plan = generate_action_plan(db, case)

    # Parse the JSON steps into typed objects
    steps = [ActionPlanStep(**s) for s in (plan.steps or [])]

    return ActionPlanResponse(
        id=plan.id,
        case_id=plan.case_id,
        steps=steps,
        status=plan.status,
    )
