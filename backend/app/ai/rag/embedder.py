"""
Vector embedding generator for Nyaya Saathi.

Supports:
  1. OpenAI Embeddings API (text-embedding-3-small, 1536 dims) when OPENAI_API_KEY is present.
  2. Local deterministic fallback embeddings for offline development / test environments.
"""

from __future__ import annotations

import hashlib
import logging
import math
from typing import List, Optional

from app.core.config import settings

logger = logging.getLogger(__name__)


def _generate_fallback_embedding(text: str, dimensions: int = 1536) -> List[float]:
    """
    Generate a deterministic, unit-normalized pseudo-embedding vector for offline testing.

    Uses sha256 rolling hashes to populate `dimensions` floats, then L2 normalizes.
    This guarantees repeatable vectors for testing vector similarity queries offline.
    """
    vector: List[float] = []
    current_seed = text.encode("utf-8")

    while len(vector) < dimensions:
        hash_digest = hashlib.sha256(current_seed).digest()
        for i in range(0, len(hash_digest), 4):
            if len(vector) >= dimensions:
                break
            val = int.from_bytes(hash_digest[i : i + 4], byteorder="big", signed=True)
            vector.append(float(val) / (2**31))
        current_seed = hash_digest

    # L2 normalize
    norm = math.sqrt(sum(x * x for x in vector)) or 1.0
    return [x / norm for x in vector]


def get_embedding(text: str) -> List[float]:
    """
    Generate embedding vector for a given text query or chunk.

    Returns a 1536-dimensional float vector.
    """
    api_key = settings.OPENAI_API_KEY.strip()
    if api_key and not api_key.startswith("sk-..."):
        try:
            from openai import OpenAI

            client = OpenAI(api_key=api_key)
            response = client.embeddings.create(
                model=settings.EMBEDDING_MODEL,
                input=text,
            )
            return response.data[0].embedding
        except Exception as e:
            logger.warning("OpenAI embedding API call failed: %s. Falling back to local embedder.", e)

    return _generate_fallback_embedding(text, dimensions=settings.EMBEDDING_DIMENSIONS)


def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """Generate embedding vectors for a batch of texts."""
    api_key = settings.OPENAI_API_KEY.strip()
    if api_key and not api_key.startswith("sk-..."):
        try:
            from openai import OpenAI

            client = OpenAI(api_key=api_key)
            response = client.embeddings.create(
                model=settings.EMBEDDING_MODEL,
                input=texts,
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            logger.warning("OpenAI batch embedding call failed: %s. Falling back to local embedder.", e)

    return [_generate_fallback_embedding(t, dimensions=settings.EMBEDDING_DIMENSIONS) for t in texts]
