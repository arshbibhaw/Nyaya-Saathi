"""
AI package for Nyaya Saathi.

Provides:
  - High-accuracy legal classifier (`classifier.py`)
  - OCR document intelligence (`ocr/extractor.py`)
  - RAG retrieval & knowledge base chunking (`rag/`)
  - LLM client & multi-provider completions (`llm/`)
  - Versioned prompt templates (`prompts/`)
"""

from app.ai.classifier import ClassificationResult, classify_legal_issue
from app.ai.ocr.extractor import extract_text
from app.ai.rag.chunker import chunk_legal_source_file
from app.ai.rag.embedder import get_embedding
from app.ai.rag.retriever import retrieve_relevant_legal_sources

__all__ = [
    "ClassificationResult",
    "classify_legal_issue",
    "extract_text",
    "chunk_legal_source_file",
    "get_embedding",
    "retrieve_relevant_legal_sources",
]
