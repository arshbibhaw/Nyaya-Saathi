"""LegalSource ORM model — stores chunked legal text with pgvector embeddings."""

import uuid

from sqlalchemy import String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base

# pgvector column type — gracefully degrades if pgvector is not installed
try:
    from pgvector.sqlalchemy import Vector

    _VECTOR_AVAILABLE = True
except ImportError:
    _VECTOR_AVAILABLE = False


class LegalSource(Base):
    __tablename__ = "legal_sources"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    chunk_text: Mapped[str] = mapped_column(Text, nullable=False)

    # The embedding column uses pgvector's Vector type when available.
    # If pgvector is not installed, it falls back to a JSON column so the
    # rest of the application still boots (useful for local dev without
    # the postgres extension).
    if _VECTOR_AVAILABLE:
        embedding = mapped_column(Vector(1536), nullable=True)
    else:
        embedding = mapped_column(JSON, nullable=True)

    metadata_json: Mapped[dict | None] = mapped_column(
        JSON,
        nullable=True,
        comment="domain, jurisdiction, authority, tier, language",
    )
