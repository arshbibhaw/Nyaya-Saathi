"""
Nyaya Saathi — Classifier Accuracy Benchmark Test Suite
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.ai.classifier import classify_legal_issue

test_cases = [
    (
        "Cyber Scam",
        "I received a Telegram link promising part time job and lost 50k via UPI scam and phishing website.",
        "cyber_fraud",
    ),
    (
        "Unpaid Salary / Labour",
        "My company fired me without any notice and is not paying my last 2 months salary of 80000 and PF.",
        "employment_and_labour",
    ),
    (
        "Security Deposit / Tenancy",
        "My landlord is refusing to refund my 40,000 security deposit after I vacated the flat and disconnected water.",
        "tenancy_and_property",
    ),
    (
        "Cheque Dishonour / Banking",
        "A business client gave me a cheque of 2 lakhs which bounced due to insufficient funds and bank gave return memo.",
        "banking_and_finance",
    ),
    (
        "Police Refusal FIR / Criminal",
        "Police station is refusing to register an FIR for my stolen phone and physical assault.",
        "criminal_and_police",
    ),
    (
        "RTI Inaction / Governance",
        "I filed an RTI with the municipal corporation 45 days ago but received no reply from CPIO.",
        "governance_and_public_grievance",
    ),
    (
        "Consumer Defect / E-Commerce",
        "Ordered a refrigerator on Amazon, compressor stopped working after 3 days and seller refuses replacement.",
        "consumer",
    ),
    (
        "Suppression Test (Power bank)",
        "I bought a power bank on Flipkart and it is not charging my phone properly.",
        "consumer",
    ),
    (
        "Recovery Agent Harassment",
        "Loan recovery agents are calling my relatives and threatening me for delayed personal loan EMI.",
        "banking_and_finance",
    ),
    (
        "Divorce & Alimony",
        "Seeking mutual consent divorce and maintenance under section 125 from husband.",
        "matrimonial_and_family",
    ),
]


def run_benchmark():
    passed = 0
    print("=" * 80)
    print("       NYAYA SAATHI — CLASSIFICATION ACCURACY BENCHMARK")
    print("=" * 80 + "\n")

    for label, text, expected_domain in test_cases:
        res = classify_legal_issue(text)
        match = res.domain == expected_domain
        status_str = "PASS" if match else "FAIL"
        if match:
            passed += 1

        print(f"[{status_str}] {label}:")
        print(f"   Input: \"{text}\"")
        print(f"   Result:   {res.domain} (Confidence: {res.confidence * 100:.1f}%)")
        print(f"   Expected: {expected_domain}")
        print(f"   Forum:    {res.target_authority[:60]}...")
        if res.key_entities.get("amounts"):
            print(f"   Amounts Extracted: {res.key_entities['amounts']}")
        print()

    accuracy = (passed / len(test_cases)) * 100
    print("=" * 80)
    print(f"  BENCHMARK RESULT: {passed}/{len(test_cases)} Passed ({accuracy:.1f}% Accuracy)")
    print("=" * 80)

    assert passed == len(test_cases), f"Benchmark failed with {len(test_cases) - passed} errors"


if __name__ == "__main__":
    run_benchmark()
