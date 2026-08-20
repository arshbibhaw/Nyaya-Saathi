"""Auth Pydantic schemas."""

from pydantic import BaseModel
from app.schemas.user import UserOut


class Token(BaseModel):
    access_token: str
    token_type: str


class AuthResponse(BaseModel):
    token: str
    user: UserOut
