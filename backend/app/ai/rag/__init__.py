"""
RAG (Retrieval-Augmented Generation) package for Nyaya Saathi.

Provides:
  - Hierarchical legal text chunking (`chunker.py`)
  - OpenAI / fallback vector embeddings (`embedder.py`)
  - pgvector similarity search & metadata filtering (`retriever.py`)
"""

from app.ai.rag.chunker import LegalChunk, chunk_legal_source_file, chunk_legal_source_dict
from app.ai.rag.embedder import get_embedding, get_embeddings_batch
from app.ai.rag.retriever import retrieve_relevant_legal_sources

__all__ = [
    "LegalChunk",
    "chunk_legal_source_file",
    "chunk_legal_source_dict",
    "get_embedding",
    "get_embeddings_batch",
    "retrieve_relevant_legal_sources",
]
