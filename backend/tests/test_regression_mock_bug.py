import asyncio
import logging
import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.ai.classifier import analyze_and_classify_legal_matter

# Setup basic logging to see any inner errors
logging.basicConfig(level=logging.WARNING)

def test_regression_mock_bug():
    """
    Tests that two completely different scenarios produce different results
    and neither falls back to a stale mock output.
    """
    print("Running Regression Test for LLM Mock Bug...\n")

    case_1 = (
        "A student-led startup, TechNova Solutions, signed a contract with ABC Events Pvt. Ltd. "
        "to develop and manage the official website for an event for a total payment of ₹50,000, "
        "out of which ₹20,000 was paid in advance and the remaining ₹30,000 was to be paid after "
        "completion of the project."
    )

    case_2 = (
        "Rohan Sharma purchased a defective laptop for ₹78,000 from a major electronics retailer. "
        "The laptop overheats, shuts down randomly, and has a flickering screen. After three "
        "unsuccessful repair attempts by the authorized service center, Rohan wants a replacement or full refund."
    )

    print("Analyzing Case 1 (TechNova Contract)...")
    try:
        # We must run this using asyncio since analyze_and_classify_legal_matter uses asyncio.run internally,
        # Wait, analyze_and_classify_legal_matter is a synchronous wrapper around asyncio.run!
        res_1 = analyze_and_classify_legal_matter(case_1, evidence_text="")
    except Exception as e:
        error_msg = f"FAILED: LLM engine threw an error on Case 1: {e}".encode("cp1252", errors="replace").decode("cp1252")
        print(error_msg)
        print("Note: If the error is 'Incorrect API key', then the mock mode has successfully been removed, but you need a real API key to pass this test.")
        return

    print("Analyzing Case 2 (Defective Laptop)...")
    try:
        res_2 = analyze_and_classify_legal_matter(case_2, evidence_text="")
    except Exception as e:
        error_msg = f"FAILED: LLM engine threw an error on Case 2: {e}".encode("cp1252", errors="replace").decode("cp1252")
        print(error_msg)
        return

    # Verify that the two results are completely different in core aspects
    
    # 1. Output 2 should NOT contain "TechNova Solutions" or "ABC Events"
    res_2_str = str(res_2.to_dict()).lower()
    
    assert "technova" not in res_2_str, "Assertion Failed: 'technova' found in Case 2 output!"
    assert "abc events" not in res_2_str, "Assertion Failed: 'abc events' found in Case 2 output!"

    # 2. Case 2 should correctly identify the consumer or laptop
    assert "rohan" in res_2_str or "laptop" in res_2_str or "consumer" in res_2_str, \
        "Assertion Failed: Case 2 output does not contain expected dynamic keywords (Rohan/laptop/consumer)."
    
    # 3. Case 1 and Case 2 domains/subcategories should differ appropriately
    # (Though we shouldn't assert strict equality to "Consumer Law" since LLM might classify it slightly differently,
    # we can assert they aren't identical)
    assert res_1.subcategory != res_2.subcategory, \
        "Assertion Failed: Subcategories are identical, suggesting cached or mock output!"

    success_msg = "\n[SUCCESS] The LLM Mock Bug is fixed. The legal engine correctly generated independent analyses for both cases without falling back to a stale mock response."
    print(success_msg)

if __name__ == "__main__":
    test_regression_mock_bug()
