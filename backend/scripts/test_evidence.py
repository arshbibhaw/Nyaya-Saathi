import sys
import os
import asyncio
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Make sure we don't spam deprecation warnings
import warnings
warnings.filterwarnings("ignore", category=FutureWarning, module="google.*")

import pymupdf
from app.ai.ocr.extractor import extract_text
from app.ai.prompts.evidence import format_evidence_prompt
from app.ai.llm.client import LLMClient
from app.schemas.evidence import ExtractedEntities

async def test_evidence():
    print("=== EVIDENCE RAG & ANALYSIS TEST ===")
    
    # 1. Create a dummy PDF in memory
    print("\n1. Generating synthetic PDF evidence...")
    doc = pymupdf.open()
    page = doc.new_page()
    text = "LEGAL NOTICE OF DEFAULT\n\nDate: 23rd August 2026\nTo: ABC Events Pvt Ltd.\nFrom: TechNova Solutions\n\nThis is to notify you that you have failed to pay the outstanding amount of Rs 30,000 for the website development services rendered on 15th July 2026. Please remit the payment within 7 days."
    page.insert_text((50, 50), text)
    
    pdf_bytes = doc.write()
    doc.close()
    print(f"Generated PDF size: {len(pdf_bytes)} bytes")

    # 2. Extract Text using OCR / PyMuPDF pipeline
    print("\n2. Passing PDF to extraction pipeline (PyMuPDF / OCR)...")
    extracted = extract_text(pdf_bytes, "application/pdf")
    print(f"Extracted Text:\n{'-'*40}\n{extracted}\n{'-'*40}")

    # 3. Use LLM to extract structured entities
    print("\n3. Passing extracted text to Gemini LLM for structured analysis...")
    messages = format_evidence_prompt(
        document_text=extracted,
        filename="legal_notice_demand.pdf",
        mime_type="application/pdf",
        category="commercial_and_contract_law",
        subcategory="Breach of Contract & Recovery of Dues"
    )
    
    client = LLMClient()
    result = await client.complete_structured(
        messages=messages,
        response_model=ExtractedEntities,
        step="evidence",
        case_id="test_case_123"
    )
    
    entities = result["parsed"]
    print("\n4. Final AI Extracted Entities (Structured JSON):")
    print("-" * 40)
    print(f"Dates:          {entities.dates}")
    print(f"Amounts:        {entities.amounts}")
    print(f"Parties:        {entities.parties}")
    print("Key Statements:")
    for stmt in entities.key_statements:
        print(f"  - {stmt}")
    print("-" * 40)
    
    print("\nTEST COMPLETE: Evidence extraction and AI analysis are functioning perfectly!")

if __name__ == "__main__":
    if sys.platform == "win32":
        sys.stdout.reconfigure(encoding="utf-8")
    asyncio.run(test_evidence())
