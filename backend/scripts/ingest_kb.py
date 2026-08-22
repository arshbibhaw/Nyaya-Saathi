"""
CLI script to ingest authoritative legal source documents into Nyaya Saathi vector database.

Usage:
    # Run from backend directory:
    python -m scripts.ingest_kb
    python -m scripts.ingest_kb --dry-run
    python -m scripts.ingest_kb --source-dir ../data/legal_sources
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.ai.rag.chunker import chunk_legal_source_file
from app.ai.rag.embedder import get_embedding
from app.db.session import SessionLocal
from app.models.legal_source import LegalSource

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("ingest_kb")


def ingest_sources(source_dir: Path, dry_run: bool = False) -> int:
    """Read all legal source JSONs from source_dir, generate embeddings, and save to database."""
    if not source_dir.exists():
        logger.error("Source directory does not exist: %s", source_dir)
        return 0

    json_files = sorted(list(source_dir.glob("*.json")))
    if not json_files:
        logger.warning("No JSON files found in %s", source_dir)
        return 0

    logger.info("Found %d legal source dataset file(s) in %s", len(json_files), source_dir)

    total_chunks = 0
    all_chunks = []

    for file_path in json_files:
        logger.info("Processing %s...", file_path.name)
        chunks = chunk_legal_source_file(file_path)
        logger.info("  -> Generated %d statutory chunk(s)", len(chunks))
        all_chunks.extend(chunks)
        total_chunks += len(chunks)

    logger.info("Total chunks generated across all acts: %d", total_chunks)

    if dry_run:
        logger.info("[DRY RUN] Simulating ingestion for %d chunks:", len(all_chunks))
        for i, chunk in enumerate(all_chunks[:5], 1):
            logger.info("  Sample Chunk #%d: %s (Domain: %s)", i, chunk.title, chunk.domain)
        logger.info("[DRY RUN] Complete. No changes written to database.")
        return total_chunks

    # Connect to database and insert
    logger.info("Connecting to database for batch ingestion...")
    db = SessionLocal()
    inserted_count = 0

    try:
        for i, chunk in enumerate(all_chunks, 1):
            logger.info("Embedding [%d/%d]: %s", i, total_chunks, chunk.title)
            vector = get_embedding(chunk.chunk_text)

            source_record = LegalSource(
                title=chunk.title,
                source_url=chunk.source_url,
                chunk_text=chunk.chunk_text,
                embedding=vector,
                metadata_json=chunk.to_metadata_dict(),
            )
            db.add(source_record)
            inserted_count += 1

        db.commit()
        logger.info("Successfully committed %d legal sources to database!", inserted_count)

    except Exception as e:
        logger.error("Error during database insertion: %s", e)
        db.rollback()
        raise
    finally:
        db.close()

    return inserted_count


def main():
    parser = argparse.ArgumentParser(description="Ingest legal sources into Nyaya Saathi database.")
    parser.add_argument(
        "--source-dir",
        type=str,
        default="../data/legal_sources",
        help="Path to directory containing legal source JSON files (default: ../data/legal_sources)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Parse and validate chunks and embeddings without writing to database",
    )

    args = parser.parse_args()
    source_dir = Path(args.source_dir).resolve()

    count = ingest_sources(source_dir, dry_run=args.dry_run)
    logger.info("Finished processing %d total legal chunk(s).", count)


if __name__ == "__main__":
    main()
