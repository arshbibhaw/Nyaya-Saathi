"""User Pydantic schemas."""

from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str | None = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str | None = None

    model_config = {"from_attributes": True}
