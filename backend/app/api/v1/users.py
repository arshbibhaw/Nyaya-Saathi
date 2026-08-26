"""
User profile routes: view and update profile.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
def get_profile(user: User = Depends(get_current_user)):
    """Return the current user's profile."""
    return UserResponse.model_validate(user)


@router.patch("/me", response_model=UserResponse)
def update_profile(
    payload: UserUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Update the current user's profile fields."""
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.preferred_language is not None:
        user.preferred_language = payload.preferred_language
    if payload.location is not None:
        user.location = payload.location

    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)
