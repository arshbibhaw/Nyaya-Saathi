"""Pydantic schemas for user authentication."""

from datetime import datetime
from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    """Payload for POST /auth/register."""
    email: EmailStr
    username: str
    password: str
    full_name: str | None = None


class UserUpdate(BaseModel):
    """Payload for PUT /auth/profile."""
    username: str | None = None
    full_name: str | None = None


class UserLogin(BaseModel):
    """Payload for POST /auth/login."""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Payload for PATCH /users/me."""
    full_name: str | None = None
    preferred_language: str | None = None
    location: str | None = None


class UserResponse(BaseModel):
    """Public-facing user representation (never exposes password_hash)."""
    id: str
    email: str
    username: str | None = None
    full_name: str | None = None
    role: str = "user"
    preferred_language: str | None = None
    location: str | None = None
    created_at: datetime | None = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT token returned after successful login/register."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# Legacy alias used by auth.py schema import
UserOut = UserResponse
