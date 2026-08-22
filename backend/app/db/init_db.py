"""
Database initialisation helper.

Called on application startup to create all tables (hackathon convenience).
In production, prefer Alembic migrations.
"""

from sqlalchemy import text

from app.db.session import engine, Base

# Import all models so Base.metadata knows about them.
import app.models  # noqa: F401


def init_db() -> None:
    """Create the pgvector extension (if available) and all tables."""
    with engine.connect() as conn:
        try:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
            conn.commit()
        except Exception:
            # pgvector extension may not be installed locally — proceed anyway
            conn.rollback()

    Base.metadata.create_all(bind=engine)
