"""Pydantic schemas for user authentication."""

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    """Payload for POST /auth/register."""
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """Payload for POST /auth/login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Public-facing user representation (never exposes password_hash)."""
    id: str
    email: str

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """JWT token returned after successful login/register."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
