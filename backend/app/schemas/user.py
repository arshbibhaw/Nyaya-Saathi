"""Pydantic schemas for user authentication."""

from pydantic import BaseModel, EmailStr


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


class UserResponse(BaseModel):
    """Public-facing user representation (never exposes password_hash)."""
    id: str
    email: str
    username: str | None = None
    full_name: str | None = None

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT token returned after successful login/register."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
