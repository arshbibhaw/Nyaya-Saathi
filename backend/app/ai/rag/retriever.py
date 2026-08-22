"""
RAG retriever stub.

Searches the legal knowledge base (pgvector) for chunks relevant to
the user's query.  The AI teammate should implement the actual vector
search here.
"""

from sqlalchemy.orm import Session


def retrieve_legal_context(
    query: str,
    domain: str,
    db: Session,
    top_k: int = 5,
) -> list[dict]:
    """
    Retrieve the most relevant legal source chunks for *query*.

    Parameters
    ----------
    query : str
        The user's message or search query.
    domain : str
        The classified legal domain (used for metadata filtering).
    db : Session
        SQLAlchemy session (needed to query the legal_sources table).
    top_k : int
        Maximum number of chunks to return.

    Returns
    -------
    list[dict]
        Each dict contains ``title``, ``source_url``, ``chunk_text``,
        and ``metadata``.

    .. note::
        **STUB** — returns an empty list.  Replace with:
        1. Embed *query* using the embedding model.
        2. Run a pgvector similarity search against ``legal_sources``.
        3. Optionally filter by ``domain`` in ``metadata_json``.
        4. Return the top-k results.
    """
    # TODO: Implement vector search
    #
    # from app.models.legal_source import LegalSource
    # from pgvector.sqlalchemy import Vector
    #
    # query_embedding = embed(query)  # call your embedding model
    # results = (
    #     db.query(LegalSource)
    #     .order_by(LegalSource.embedding.cosine_distance(query_embedding))
    #     .limit(top_k)
    #     .all()
    # )
    # return [
    #     {
    #         "title": r.title,
    #         "source_url": r.source_url,
    #         "chunk_text": r.chunk_text,
    #         "metadata": r.metadata_json,
    #     }
    #     for r in results
    # ]

    return []
