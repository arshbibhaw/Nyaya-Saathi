"""
OCR / text extraction from uploaded evidence files.

Uses PyMuPDF (fitz) for native PDFs and falls back to pytesseract
for image-based documents.
"""

import os


def extract_text(file_path: str, mime_type: str) -> str:
    """
    Extract text content from a file.

    Parameters
    ----------
    file_path : str
        Absolute path to the uploaded file on disk.
    mime_type : str
        The MIME type of the file (e.g. ``application/pdf``, ``image/png``).

    Returns
    -------
    str
        Extracted text content.
    """
    if not os.path.exists(file_path):
        return ""

    if mime_type == "application/pdf":
        return _extract_from_pdf(file_path)
    elif mime_type.startswith("image/"):
        return _extract_from_image(file_path)
    else:
        return ""


def _extract_from_pdf(file_path: str) -> str:
    """Extract text from a PDF using PyMuPDF (fitz)."""
    try:
        import fitz  # PyMuPDF

        text_parts: list[str] = []
        with fitz.open(file_path) as doc:
            for page in doc:
                text_parts.append(page.get_text())

        full_text = "\n".join(text_parts).strip()

        # If the PDF is image-based (no selectable text), fall back to OCR
        if not full_text:
            return _extract_from_image(file_path)

        return full_text
    except ImportError:
        return "[PyMuPDF not installed — cannot extract text from PDF]"
    except Exception as e:
        return f"[PDF extraction error: {e}]"


def _extract_from_image(file_path: str) -> str:
    """Extract text from an image using Tesseract OCR."""
    try:
        from PIL import Image
        import pytesseract

        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
        return text.strip()
    except ImportError:
        return "[pytesseract or Pillow not installed — cannot perform OCR]"
    except Exception as e:
        return f"[OCR extraction error: {e}]"
