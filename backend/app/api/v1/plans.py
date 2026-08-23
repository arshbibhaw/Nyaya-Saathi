"""
Action plan routes: get, generate, update step status.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.action_plan import ActionPlan
from app.schemas.action_plan import ActionPlanResponse, ActionPlanStep, ActionPlanStepUpdate
from app.services.case_service import generate_action_plan_with_llm

router = APIRouter(tags=["Action Plans"])


@router.get("/cases/{case_id}/plan", response_model=ActionPlanResponse)
def get_plan(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Fetch the action plan for a case. Auto-generates if none exists."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    plan = db.query(ActionPlan).filter(ActionPlan.case_id == case_id).first()

    if not plan:
        plan = generate_action_plan_with_llm(db, case)

    steps = [ActionPlanStep(**s) for s in (plan.steps or [])]

    return ActionPlanResponse(
        id=plan.id,
        case_id=plan.case_id,
        steps=steps,
        status=plan.status,
    )


@router.post(
    "/cases/{case_id}/action-plan/generate",
    response_model=ActionPlanResponse,
    status_code=status.HTTP_201_CREATED,
)
def generate_plan(
    case_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Explicitly generate or regenerate the action plan for a case."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    # Delete existing plans for regeneration
    db.query(ActionPlan).filter(ActionPlan.case_id == case_id).delete()
    db.commit()

    plan = generate_action_plan_with_llm(db, case)
    steps = [ActionPlanStep(**s) for s in (plan.steps or [])]

    return ActionPlanResponse(
        id=plan.id,
        case_id=plan.case_id,
        steps=steps,
        status=plan.status,
    )


@router.patch("/cases/{case_id}/action-plan/steps/{step_index}")
def update_step_status(
    case_id: str,
    step_index: int,
    payload: ActionPlanStepUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Mark an action plan step as PENDING, IN_PROGRESS, or COMPLETED."""
    case = db.query(Case).filter(Case.id == case_id, Case.user_id == user.id).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found")

    plan = db.query(ActionPlan).filter(ActionPlan.case_id == case_id).first()
    if not plan or not plan.steps:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action plan not found")

    if step_index < 0 or step_index >= len(plan.steps):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Step index {step_index} out of range (0-{len(plan.steps) - 1})",
        )

    valid_statuses = {"PENDING", "IN_PROGRESS", "COMPLETED"}
    if payload.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid status. Valid values: {valid_statuses}",
        )

    # Update the step (JSON column — must reassign the whole list for SQLAlchemy to detect the change)
    steps = list(plan.steps)
    steps[step_index]["status"] = payload.status
    plan.steps = steps

    from sqlalchemy.orm.attributes import flag_modified
    flag_modified(plan, "steps")

    db.commit()
    db.refresh(plan)

    return ActionPlanResponse(
        id=plan.id,
        case_id=plan.case_id,
        steps=[ActionPlanStep(**s) for s in plan.steps],
        status=plan.status,
    )
