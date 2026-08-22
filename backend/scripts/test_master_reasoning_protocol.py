"""
Nyaya Saathi — Master Legal Reasoning Benchmark Verification Suite
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Ensure utf-8 output encoding for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from app.ai.classifier import analyze_and_classify_legal_matter


def test_technova_case():
    print("=" * 80)
    print("TEST 1: TECHNOVA SOLUTIONS VS ABC EVENTS (CONTRACTUAL NON-PAYMENT)")
    print("=" * 80)

    user_input = (
        "A student-led startup, TechNova Solutions, signed a contract with ABC Events Pvt. Ltd. "
        "to develop and manage the official website for an event for a total payment of ₹50,000, "
        "out of which ₹20,000 was paid in advance and the remaining ₹30,000 was to be paid after completion "
        "of the project. TechNova completed the website and delivered all the agreed features, but ABC Events "
        "refused to pay the remaining amount, claiming that the website had minor design issues and did not "
        "meet their expectations. TechNova argues that these design requirements were never mentioned in the "
        "contract and that the client had already tested and accepted the website. The legal issue is whether "
        "ABC Events can legally refuse the remaining payment due to minor dissatisfaction after accepting the "
        "completed project, and whether TechNova can claim the unpaid ₹30,000 along with compensation or interest for the delay."
    )

    evidence = (
        "Signed contract specifying scope and payment terms, proof of Rs 20,000 advance payment, "
        "emails and WhatsApp chats discussing requirements, screenshots showing completion and delivery, "
        "messages showing client tested and approved website, bank records proving unpaid Rs 30,000 balance."
    )

    res = analyze_and_classify_legal_matter(user_input, evidence_text=evidence)

    print(f"Domain:           {res.primary_domain}")
    print(f"Subcategory:      {res.subcategory_display}")
    print(f"Confidence:       {res.confidence_level} ({res.confidence_score * 100:.1f}%)")
    print(f"Claimant Role:    {res.parties.claimant_role}")
    print(f"Opposite Role:    {res.parties.opposite_party_role}")
    print(f"Relationship:     {res.parties.legal_relationship}")
    print(f"Primary Law:      {res.primary_laws[0].statute_name} [{res.primary_laws[0].section_number}]")
    print(f"Forum:            {res.potential_forum}")
    print(f"Remedies:         {res.possible_remedies[0]}")
    print(f"Notice Drafted:   {'YES' if res.legal_notice else 'NO'}")

    assert "Contract" in res.primary_domain or "Commercial" in res.primary_domain
    assert "Service Provider" in res.parties.claimant_role
    assert "Indian Contract Act" in res.primary_laws[0].statute_name
    assert "30,000" in res.short_legal_reasoning
    assert res.confidence_score >= 0.85
    print("\n>>> TEST 1 PASSED: Correctly identified as Breach of Contract / Debt Recovery (NOT Consumer)!\n")


def test_consumer_case():
    print("=" * 80)
    print("TEST 2: DEFECTIVE LAPTOP PURCHASE (CONSUMER PROTECTION)")
    print("=" * 80)

    user_input = "I purchased a Dell laptop on Amazon for Rs. 65,000. It arrived with a cracked screen and seller refuses refund."
    res = analyze_and_classify_legal_matter(user_input)

    print(f"Domain:        {res.primary_domain}")
    print(f"Claimant Role: {res.parties.claimant_role}")
    print(f"Primary Law:   {res.primary_laws[0].statute_name}")
    print(f"Forum:         {res.potential_forum}")

    assert "Consumer" in res.primary_domain
    assert "Consumer" in res.parties.claimant_role
    assert "Consumer Protection Act" in res.primary_laws[0].statute_name
    print("\n>>> TEST 2 PASSED: Correctly identified as Consumer Protection!\n")


if __name__ == "__main__":
    test_technova_case()
    test_consumer_case()
    print("=" * 80)
    print("ALL REASONING & CLASSIFICATION PROTOCOL TESTS PASSED WITH 100% ACCURACY!")
    print("=" * 80)
