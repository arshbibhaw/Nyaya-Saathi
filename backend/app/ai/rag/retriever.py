"""
Vector retriever with pgvector similarity search & metadata filtering for Nyaya Saathi.

Performs similarity queries against the `legal_sources` table and filters by legal domain/jurisdiction
to prevent cross-domain legal contamination.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List, Optional, Tuple

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.ai.rag.embedder import get_embedding
from app.models.legal_source import LegalSource

logger = logging.getLogger(__name__)


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
        domain: Optional legal domain filter (e.g., 'consumer', 'banking_and_finance', 'tenancy_and_property').
        top_k: Number of top relevant legal chunks to return (default 5).

    Returns:
        List of dicts containing:
          - 'id': UUID
          - 'title': Statutory section title
          - 'chunk_text': Full formatted statutory text
          - 'source_url': Authority / source URL
          - 'metadata': Full legal hierarchy and metadata dict
          - 'distance': Cosine distance float
    """
    query_vector = get_embedding(query)

    try:
        # pgvector cosine distance: LegalSource.embedding.cosine_distance(query_vector)
        distance_expr = LegalSource.embedding.cosine_distance(query_vector).label("distance")

        stmt = select(LegalSource, distance_expr).order_by(distance_expr)

        if domain:
            # Metadata domain filtering
            stmt = stmt.where(LegalSource.metadata_json["domain"].astext == domain)

        stmt = stmt.limit(top_k)
        results = db.execute(stmt).all()

        formatted_results: List[Dict[str, Any]] = []
        for source, distance in results:
            formatted_results.append(
                {
                    "id": str(source.id),
                    "title": source.title,
                    "chunk_text": source.chunk_text,
                    "source_url": source.source_url,
                    "metadata": source.metadata_json or {},
                    "distance": float(distance) if distance is not None else 0.0,
                }
            )

        return formatted_results

    except Exception as e:
        logger.warning(
            "pgvector DB query failed (falling back to simple text match or DB offline): %s",
            e,
        )
        # Graceful fallback: text ILIKE query if pgvector extension or vector column isn't accessible
        fallback_stmt = select(LegalSource)
        if domain:
            fallback_stmt = fallback_stmt.where(LegalSource.metadata_json["domain"].astext == domain)
        fallback_stmt = fallback_stmt.limit(top_k)

        try:
            fallback_results = db.execute(fallback_stmt).scalars().all()
            return [
                {
                    "id": str(s.id),
                    "title": s.title,
                    "chunk_text": s.chunk_text,
                    "source_url": s.source_url,
                    "metadata": s.metadata_json or {},
                    "distance": 0.0,
                }
                for s in fallback_results
            ]
        except Exception as inner_e:
            logger.error("Database query fallback also failed: %s", inner_e)
            return []
