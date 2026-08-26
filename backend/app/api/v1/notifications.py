"""
Notification routes: list, mark read, unread count, and a profile stats endpoint.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.notification import Notification
from app.models.case import Case
from app.models.evidence import Evidence
from app.models.document import Document
from app.schemas.notification import NotificationResponse, UnreadCountResponse

router = APIRouter(tags=["Notifications"])


# ── Notification CRUD ────────────────────────────────────────────────────────

@router.get("/notifications", response_model=list[NotificationResponse])
def list_notifications(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """List the user's notifications (latest 50, newest first)."""
    items = (
        db.query(Notification)
        .filter(Notification.user_id == user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
        .all()
    )
    return items


@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Mark a single notification as read."""
    notif = (
        db.query(Notification)
        .filter(Notification.id == notification_id, Notification.user_id == user.id)
        .first()
    )
    if not notif:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif


@router.post("/notifications/read-all", status_code=status.HTTP_200_OK)
def mark_all_read(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Mark all user notifications as read."""
    db.query(Notification).filter(
        Notification.user_id == user.id,
        Notification.is_read == False,
    ).update({"is_read": True})
    db.commit()
    return {"detail": "All notifications marked as read"}


@router.get("/notifications/unread-count", response_model=UnreadCountResponse)
def unread_count(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Get the count of unread notifications."""
    count = (
        db.query(func.count(Notification.id))
        .filter(Notification.user_id == user.id, Notification.is_read == False)
        .scalar()
    )
    return UnreadCountResponse(count=count or 0)


# ── Profile Stats ────────────────────────────────────────────────────────────

@router.get("/profile/stats")
def get_profile_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Return aggregated stats for the user's profile overview cards."""
    case_ids_query = db.query(Case.id).filter(Case.user_id == user.id, Case.status != "ARCHIVED")
    case_ids = [row[0] for row in case_ids_query.all()]

    active_cases = len(case_ids)

    generated_notices = (
        db.query(func.count(Document.id))
        .filter(Document.case_id.in_(case_ids))
        .scalar()
    ) if case_ids else 0

    evidence_files = (
        db.query(func.count(Evidence.id))
        .filter(Evidence.case_id.in_(case_ids))
        .scalar()
    ) if case_ids else 0

    return {
        "active_cases": active_cases,
        "generated_notices": generated_notices or 0,
        "evidence_files": evidence_files or 0,
        "privacy_standard": "AES-256",
    }


# ── Helper to create notifications from other modules ────────────────────────

def create_notification(
    db: Session,
    user_id: str,
    title: str,
    message: str,
    notif_type: str = "info",
) -> Notification:
    """Utility function to create a notification record."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
    )
    db.add(notif)
    db.commit()
    db.refresh(notif)
    return notif
