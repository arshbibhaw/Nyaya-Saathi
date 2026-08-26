import argparse
import logging
import os
import sys
import uuid
from typing import List

# Ensure we can import the app
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import fitz  # PyMuPDF
from app.db.session import SessionLocal
from app.models.legal_source import LegalSource
from sqlalchemy.orm import Session

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text from a PDF file."""
    text = ""
    try:
        with fitz.open(file_path) as doc:
            for page in doc:
                text += page.get_text() + "\n"
    except Exception as e:
        logger.error(f"Failed to read PDF {file_path}: {e}")
    return text


def chunk_text(text: str, chunk_size_words: int = 500, overlap_words: int = 50) -> List[str]:
    """Chunk text into segments with overlap."""
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size_words - overlap_words):
        chunk = " ".join(words[i : i + chunk_size_words])
        if chunk.strip():
            chunks.append(chunk)
    return chunks


def get_embedding_stub(text: str) -> List[float]:
    """
    STUB: Generate an embedding for the given text.
    The AI team will replace this with a real LLM embedding call (e.g. OpenAI text-embedding-3-small).
    Returns a dummy 1536-dimensional vector for now.
    """
    # 1536 is standard for OpenAI embeddings
    return [0.01] * 1536


def ingest_file(db: Session, file_path: str, domain: str, jurisdiction: str):
    """Process a single file and ingest into the database."""
    logger.info(f"Ingesting file: {file_path}")
    
    if not os.path.exists(file_path):
        logger.error(f"File not found: {file_path}")
        return

    # Extract Text
    if file_path.lower().endswith(".pdf"):
        text = extract_text_from_pdf(file_path)
    elif file_path.lower().endswith(".txt"):
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()
    else:
        logger.warning(f"Unsupported file type: {file_path}")
        return

    if not text.strip():
        logger.warning(f"No text extracted from {file_path}")
        return

    # Chunk Text
    chunks = chunk_text(text)
    logger.info(f"Generated {len(chunks)} chunks.")

    # Embed and Insert
    source_id = str(uuid.uuid4())
    inserted_count = 0
    
    for i, chunk_text_str in enumerate(chunks):
        embedding = get_embedding_stub(chunk_text_str)
        
        # In a real app, title could be extracted from metadata or AI
        title = f"{os.path.basename(file_path)} - Part {i+1}"
        
        db_source = LegalSource(
            id=f"{source_id}-{i}",
            title=title,
            content=chunk_text_str,
            source_url=f"local://{file_path}",
            domain=domain,
            jurisdiction=jurisdiction,
            embedding=embedding
        )
        db.add(db_source)
        inserted_count += 1
        
    db.commit()
    logger.info(f"Successfully inserted {inserted_count} chunks into the database.")


def main():
    parser = argparse.ArgumentParser(description="Ingest legal documents into the knowledge base.")
    parser.add_argument("file_or_dir", help="Path to a file or directory of raw documents.")
    parser.add_argument("--domain", default="consumer_rights", help="Legal domain category.")
    parser.add_argument("--jurisdiction", default="India", help="Jurisdiction of the law.")
    args = parser.parse_args()

    db = SessionLocal()
    try:
        path = args.file_or_dir
        if os.path.isfile(path):
            ingest_file(db, path, args.domain, args.jurisdiction)
        elif os.path.isdir(path):
            for filename in os.listdir(path):
                filepath = os.path.join(path, filename)
                if os.path.isfile(filepath):
                    ingest_file(db, filepath, args.domain, args.jurisdiction)
        else:
            logger.error(f"Invalid path: {path}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
