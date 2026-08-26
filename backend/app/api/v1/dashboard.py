"""
Dashboard route: aggregated case data for the authenticated user.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.case import Case
from app.models.evidence import Evidence
from app.models.action_plan import ActionPlan
from app.models.document import Document
from app.models.escalation import Escalation

router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return aggregated dashboard data for the current user."""
    user_cases = db.query(Case).filter(Case.user_id == user.id, Case.status != "ARCHIVED").all()
    case_ids = [c.id for c in user_cases]

    # Count by status
    status_counts = {}
    for case in user_cases:
        status_counts[case.status] = status_counts.get(case.status, 0) + 1

    # Evidence count
    evidence_count = (
        db.query(func.count(Evidence.id))
        .filter(Evidence.case_id.in_(case_ids))
        .scalar()
    ) if case_ids else 0

    # Document count
    document_count = (
        db.query(func.count(Document.id))
        .filter(Document.case_id.in_(case_ids))
        .scalar()
    ) if case_ids else 0

    # Escalation count
    escalation_count = (
        db.query(func.count(Escalation.id))
        .filter(Escalation.case_id.in_(case_ids), Escalation.status.in_(["REQUESTED", "UNDER_REVIEW"]))
        .scalar()
    ) if case_ids else 0

    # Action plan step stats
    completed_actions = 0
    pending_actions = 0
    if case_ids:
        plans = db.query(ActionPlan).filter(ActionPlan.case_id.in_(case_ids)).all()
        for plan in plans:
            for step in (plan.steps or []):
                if step.get("status") == "COMPLETED":
                    completed_actions += 1
                else:
                    pending_actions += 1

    # Recent cases (up to 5)
    recent_cases = [
        {
            "id": c.id,
            "title": c.title or c.domain or "Untitled Case",
            "status": c.status,
            "urgency": c.urgency,
            "domain": c.domain,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in sorted(user_cases, key=lambda x: x.created_at or "", reverse=True)[:5]
    ]

    return {
        "total_cases": len(user_cases),
        "status_counts": status_counts,
        "evidence_uploaded": evidence_count,
        "documents_generated": document_count,
        "active_escalations": escalation_count,
        "completed_actions": completed_actions,
        "pending_actions": pending_actions,
        "recent_cases": recent_cases,
    }
