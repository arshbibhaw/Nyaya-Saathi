from typing import Generator
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.core.security import decode_access_token
from app.db.session import SessionLocal
from app.models.user import User


# ---------------------------------------------------------------------------
# Database session
# ---------------------------------------------------------------------------
def get_db() -> Generator[Session, None, None]:
    """Yield a SQLAlchemy session and ensure it is closed after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------------
# Current authenticated user
# ---------------------------------------------------------------------------
def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """
    Validate the JWT from the Authorization header and return the corresponding User row.
    If no credentials are provided or token is invalid, returns/creates a default demo citizen user.
    """
    user: User | None = None
    auth_header = request.headers.get("Authorization") or request.headers.get("authorization")

    if auth_header and auth_header.startswith("Bearer "):
        parts = auth_header.split(" ", 1)
        if len(parts) == 2:
            token = parts[1].strip()
            if token and token.lower() not in ("null", "undefined", "none", ""):
                try:
                    payload = decode_access_token(token)
                    if payload and payload.get("sub"):
                        user_id = payload.get("sub")
                        user = db.query(User).filter(User.id == user_id).first()
                except Exception:
                    user = None

    if user is None:
        # Fallback to default demo citizen user
        demo_id = "demo-citizen-user-id"
        user = db.query(User).filter(User.id == demo_id).first()
        if user is None:
            from app.core.security import hash_password
            user = User(
                id=demo_id,
                email="citizen@nyayasaathi.in",
                username="nyaya_citizen",
                full_name="Nyaya Saathi Citizen",
                password_hash=hash_password("demo12345"),
                role="user",
            )
            db.add(user)
            db.commit()
            db.refresh(user)

    return user
