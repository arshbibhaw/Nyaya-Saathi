"""Pydantic schemas for notifications."""

from datetime import datetime
from pydantic import BaseModel


class NotificationResponse(BaseModel):
    """Public notification representation."""
    id: str
    title: str
    message: str
    type: str = "info"
    is_read: bool = False
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class NotificationMarkRead(BaseModel):
    """Payload to mark notifications as read."""
    notification_ids: list[str] | None = None  # None = mark all


class UnreadCountResponse(BaseModel):
    """Unread notification count."""
    count: int
