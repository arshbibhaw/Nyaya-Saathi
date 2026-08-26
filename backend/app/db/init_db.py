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
    """Create all tables and ensure required columns exist."""
    try:
        if "postgresql" in str(engine.url):
            with engine.connect() as conn:
                try:
                    conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
                    conn.commit()
                except Exception:
                    conn.rollback()
    except Exception:
        pass

    Base.metadata.create_all(bind=engine)

    columns_to_add = [
        ("users", "username", "VARCHAR(255)"),
        ("users", "role", "VARCHAR(50) DEFAULT 'user'"),
        ("users", "preferred_language", "VARCHAR(50) DEFAULT 'en'"),
        ("users", "location", "VARCHAR(255)"),
        ("users", "created_at", "TIMESTAMP"),
        ("users", "updated_at", "TIMESTAMP"),
        ("cases", "title", "VARCHAR(500)"),
        ("cases", "description", "TEXT"),
        ("cases", "domain", "VARCHAR(100)"),
        ("cases", "issue", "TEXT"),
        ("cases", "subcategory", "VARCHAR(100)"),
        ("cases", "urgency", "VARCHAR(50) DEFAULT 'MEDIUM'"),
        ("cases", "summary", "TEXT"),
        ("cases", "location", "VARCHAR(255)"),
        ("cases", "status", "VARCHAR(50) DEFAULT 'ACTIVE'"),
        ("cases", "created_at", "TIMESTAMP"),
        ("cases", "updated_at", "TIMESTAMP"),
        ("cases", "relevant_laws", "TEXT"),
    ]
    with engine.connect() as conn:
        for tbl, col, ctype in columns_to_add:
            try:
                conn.execute(text(f"ALTER TABLE {tbl} ADD COLUMN {col} {ctype}"))
                conn.commit()
            except Exception:
                conn.rollback()


