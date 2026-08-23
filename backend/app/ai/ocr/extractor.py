"""
Evidence text extraction — OCR module.

Two-strategy approach per AGENT_SPECIFICATION §6:
  1. PyMuPDF (fitz)   — fast native text extraction for digital PDFs
  2. pytesseract      — fallback OCR for scanned PDFs / screenshots / images

Usage:
    from app.ai.ocr.extractor import extract_text

    text = extract_text(file_bytes, "application/pdf")
"""

from __future__ import annotations

import io
import logging
from typing import Optional

import pymupdf  # PyMuPDF (replaces deprecated 'fitz' import)
import pytesseract
from PIL import Image

from app.core.config import settings

logger = logging.getLogger(__name__)
import os

# Configure tesseract binary path from env
pytesseract.pytesseract.tesseract_cmd = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")

# MIME types we treat as images (send to tesseract directly)
_IMAGE_MIMES = {
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/tiff",
    "image/bmp",
    "image/webp",
}


def extract_text_pymupdf(file_bytes: bytes) -> str:
    """
    Extract text from a native (digital) PDF using PyMuPDF.

    Returns concatenated text from all pages. If the PDF is image-based
    (scanned), this will return an empty or near-empty string — callers
    should fall back to tesseract.
    """
    doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    pages: list[str] = []
    for page in doc:
        text = page.get_text("text")
        if text:
            pages.append(text.strip())
    doc.close()
    return "\n\n".join(pages)


def extract_text_tesseract(image_bytes: bytes) -> str:
    """
    Run Tesseract OCR on a single image (PNG, JPEG, TIFF, etc.).

    Used as a fallback when PyMuPDF returns no text (scanned PDFs)
    or when the upload is a screenshot / photo.
    """
    image = Image.open(io.BytesIO(image_bytes))
    text: str = pytesseract.image_to_string(image)
    return text.strip()


def _ocr_pdf_pages(file_bytes: bytes) -> str:
    """
    Render each page of a PDF to an image and run OCR.

    Used when PyMuPDF text extraction fails (scanned / image-based PDFs).
    """
    doc = pymupdf.open(stream=file_bytes, filetype="pdf")
    pages: list[str] = []
    for page in doc:
        # Render at 2x zoom for better OCR accuracy
        pix = page.get_pixmap(dpi=300)
        img_bytes = pix.tobytes("png")
        text = extract_text_tesseract(img_bytes)
        if text:
            pages.append(text)
    doc.close()
    return "\n\n".join(pages)


def extract_text(file_bytes: bytes, mime_type: str) -> Optional[str]:
    """
    Main dispatcher — pick the right extraction strategy based on MIME type.

    Strategy:
      - PDF → try PyMuPDF first; if <50 chars extracted, fall back to OCR
      - Image → go straight to Tesseract
      - Other → return None (unsupported)

    Args:
        file_bytes: Raw bytes of the uploaded file.
        mime_type:  MIME type string (e.g., "application/pdf", "image/png").

    Returns:
        Extracted text, or None if the MIME type is unsupported.
    """
    mime = mime_type.lower().strip()

    if mime == "application/pdf":
        logger.info("Attempting PyMuPDF text extraction for PDF")
        text = extract_text_pymupdf(file_bytes)

        # If native extraction yielded very little, the PDF is probably scanned
        if len(text) < 50:
            logger.info(
                "PyMuPDF returned <%d chars — falling back to Tesseract OCR",
                len(text),
            )
            text = _ocr_pdf_pages(file_bytes)

        return text or None

    if mime in _IMAGE_MIMES:
        logger.info("Running Tesseract OCR for image (%s)", mime)
        text = extract_text_tesseract(file_bytes)
        return text or None

    logger.warning("Unsupported MIME type for OCR: %s", mime)
    return None
