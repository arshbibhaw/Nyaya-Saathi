"""
OCR module — extract text from uploaded PDFs and images.

Uses PyMuPDF for PDF text extraction and pytesseract for image OCR.
"""

import fitz  # PyMuPDF


def extract_text_from_pdf(file_path: str) -> str:
    """Extract text content from a PDF file using PyMuPDF."""
    text_parts: list[str] = []
    with fitz.open(file_path) as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n".join(text_parts)


def extract_text_from_image(file_path: str) -> str:
    """Extract text from an image file using Tesseract OCR."""
    try:
        import pytesseract
        from PIL import Image

        image = Image.open(file_path)
        return pytesseract.image_to_string(image)
    except Exception as e:
        return f"OCR extraction failed: {e}"
