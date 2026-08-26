"""
Vector retriever with similarity search & metadata filtering for Nyaya Saathi.

Performs similarity queries against the `legal_sources` table. When pgvector
is available (PostgreSQL), uses cosine distance. On SQLite, falls back to
keyword-based text matching against chunk_text and title.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Dict, List, Optional

from sqlalchemy import select, or_, func
from sqlalchemy.orm import Session

from app.ai.rag.embedder import get_embedding
from app.models.legal_source import LegalSource

logger = logging.getLogger(__name__)

# Check if pgvector is available
try:
    from pgvector.sqlalchemy import Vector
    _PGVECTOR_AVAILABLE = True
except ImportError:
    _PGVECTOR_AVAILABLE = False


def _domain_matches(metadata_json, domain: str) -> bool:
    """Check if a legal source's metadata domain matches the query domain."""
    if not metadata_json or not domain:
        return True
    meta_domain = ""
    if isinstance(metadata_json, dict):
        meta_domain = metadata_json.get("domain", "")
    elif isinstance(metadata_json, str):
        try:
            meta_domain = json.loads(metadata_json).get("domain", "")
        except (json.JSONDecodeError, AttributeError):
            return True
    return domain.lower() in meta_domain.lower() if meta_domain else True


def retrieve_relevant_legal_sources(
    db: Session,
    query: str,
    domain: Optional[str] = None,
    top_k: int = 5,
) -> List[Dict[str, Any]]:
    """
    Search `legal_sources` for provisions semantically similar to `query`.

    Args:
        db: Active SQLAlchemy database session.
        query: Citizen or legal query text.
        domain: Optional legal domain filter.
        top_k: Number of top relevant legal chunks to return (default 5).

    Returns:
        List of dicts with: id, title, chunk_text, source_url, metadata, distance.
    """
    # -------------------------------------------------------------------
    # Strategy 1: pgvector cosine distance (PostgreSQL only)
    # -------------------------------------------------------------------
    if _PGVECTOR_AVAILABLE:
        try:
            query_vector = get_embedding(query)
            distance_expr = LegalSource.embedding.cosine_distance(query_vector).label("distance")
            stmt = select(LegalSource, distance_expr).order_by(distance_expr).limit(top_k)
            results = db.execute(stmt).all()

            formatted = []
            for source, distance in results:
                if domain and not _domain_matches(source.metadata_json, domain):
                    continue
                formatted.append({
                    "id": str(source.id),
                    "title": source.title,
                    "chunk_text": source.chunk_text,
                    "source_url": source.source_url,
                    "metadata": source.metadata_json or {},
                    "distance": float(distance) if distance is not None else 0.0,
                })
            if formatted:
                return formatted
        except Exception as e:
            logger.warning("pgvector query failed, falling back to keyword search: %s", e)

    # -------------------------------------------------------------------
    # Strategy 2: Keyword-based text matching (SQLite compatible)
    # -------------------------------------------------------------------
    try:
        # Extract meaningful keywords from the query (words > 3 chars)
        keywords = [w for w in query.lower().split() if len(w) > 3]
        # Remove common stop words
        stop_words = {
            "this", "that", "with", "from", "have", "been", "were", "what",
            "when", "where", "which", "while", "about", "after", "before",
            "their", "there", "these", "those", "would", "could", "should",
            "will", "does", "also", "than", "then", "very", "just", "some",
            "more", "most", "into", "over", "such", "only", "other", "your",
        }
        keywords = [k for k in keywords if k not in stop_words][:8]

        if not keywords:
            # If no keywords, just return top_k results
            stmt = select(LegalSource).limit(top_k)
            results = db.execute(stmt).scalars().all()
        else:
            # Build OR conditions for keyword matching
            conditions = []
            for kw in keywords:
                pattern = f"%{kw}%"
                conditions.append(func.lower(LegalSource.chunk_text).like(pattern))
                conditions.append(func.lower(LegalSource.title).like(pattern))

            stmt = select(LegalSource).where(or_(*conditions)).limit(top_k * 2)
            results = db.execute(stmt).scalars().all()

            if not results:
                # If keyword search returned nothing, return any results
                stmt = select(LegalSource).limit(top_k)
                results = db.execute(stmt).scalars().all()

        # Filter by domain in Python (avoids SQLite JSON issues)
        filtered = []
        for s in results:
            if domain and not _domain_matches(s.metadata_json, domain):
                continue
            filtered.append({
                "id": str(s.id),
                "title": s.title,
                "chunk_text": s.chunk_text,
                "source_url": s.source_url,
                "metadata": s.metadata_json or {},
                "distance": 0.0,
            })

        # Score and rank by keyword relevance
        if keywords:
            for item in filtered:
                score = 0
                text = (item["chunk_text"] + " " + item["title"]).lower()
                for kw in keywords:
                    score += text.count(kw)
                item["_score"] = score
            filtered.sort(key=lambda x: x.get("_score", 0), reverse=True)
            for item in filtered:
                item.pop("_score", None)

        return filtered[:top_k]

    except Exception as e:
        logger.error("Database retrieval completely failed: %s", e)
        return []
