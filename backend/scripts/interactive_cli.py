"""
Nyaya Saathi — Interactive Legal Navigation CLI
================================================
Master 11-Phase Indian Legal Reasoning, Classification & Precision Validation Engine.

Usage:
    .venv\\Scripts\\python.exe -m scripts.interactive_cli
"""

from __future__ import annotations

import sys
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Ensure utf-8 output encoding for Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from app.ai.classifier import analyze_and_classify_legal_matter


def run_interactive():
    print("=" * 80)
    print("       NYAYA SAATHI -- ADVANCED AI CITIZEN LEGAL NAVIGATOR")
    print("      Master Indian Legal Reasoning & Precision Validation Engine")
    print("=" * 80)
    print("\nDescribe your legal situation in plain words (e.g. startup unpaid website contract,")
    print("bounced cheque, tenant deposit dispute, defective laptop, wrongful termination, etc.)\n")

    try:
        user_problem = input("> Enter legal issue description: ").strip()
    except (EOFError, KeyboardInterrupt):
        print("\nExiting.")
        return

    if not user_problem:
        print("No problem description provided. Exiting.")
        return

    print("\n(Optional) Any evidence details (e.g. contract terms, advance paid, emails, delivery proof)?")
    try:
        evidence_input = input("> Evidence / details (press Enter to skip): ").strip()
    except (EOFError, KeyboardInterrupt):
        evidence_input = ""

    print("\n" + "=" * 80)
    print("  EXECUTING 11-PHASE INDIAN LEGAL REASONING PROTOCOL...")
    print("=" * 80)

    # Run complete master legal reasoning
    res = analyze_and_classify_legal_matter(user_problem, evidence_text=evidence_input)

    # -----------------------------------------------------------------------
    # [1] LEGAL CLASSIFICATION
    # -----------------------------------------------------------------------
    print("\n[1] LEGAL CLASSIFICATION")
    print("-" * 70)
    print(f" • Primary Domain:         {res.primary_domain}")
    print(f" • Sub-category:           {res.subcategory_display}")
    if res.secondary_domains:
        print(f" • Secondary Domains:      {', '.join(res.secondary_domains)}")
    print(f" • Calibrated Confidence:  {res.confidence.confidence_level_display} ({res.confidence.overall_score * 100:.1f}%)")
    print(f"   - Classification:       {res.confidence.classification_confidence * 100:.0f}%")
    print(f"   - Law Applicability:    {res.confidence.statutory_applicability_confidence * 100:.0f}%")
    print(f"   - Forum Jurisdiction:   {res.confidence.forum_confidence * 100:.0f}%")
    print(f"   - Remedy Entitlement:   {res.confidence.remedy_confidence * 100:.0f}%")
    print(f" • Urgency Level:          {res.urgency}")
    print(f" • Short Legal Reasoning:  {res.short_legal_reasoning}")

    # -----------------------------------------------------------------------
    # [2] PARTY AND RELATIONSHIP ANALYSIS
    # -----------------------------------------------------------------------
    print("\n[2] PARTY AND RELATIONSHIP ANALYSIS")
    print("-" * 70)
    print(f" • Person Seeking Relief:  {res.parties.claimant_name}")
    print(f" • Opposite Party:         {res.parties.opposite_party_name}")
    print(f" • Legal Roles:            Claimant: {res.parties.claimant_role} | Opposite Party: {res.parties.opposite_party_role}")
    print(f" • Nature of Relationship: {res.parties.legal_relationship}")
    print(f" • Transaction / Event:    {res.parties.nature_of_transaction}")
    print(f" • Performance of Duty:    {res.parties.who_provided_goods_or_services}")
    print(f" • Alleged Monetary Dues:  {res.parties.who_owes_money_or_duty}")
    print(f" • Alleged Conduct:        {res.parties.alleged_conduct}")

    # -----------------------------------------------------------------------
    # [3] CORE LEGAL ISSUES & FACT CATEGORIZATION
    # -----------------------------------------------------------------------
    print("\n[3] CORE LEGAL ISSUES & FACT CATEGORIZATION")
    print("-" * 70)
    print(f" • Primary Legal Issue:    {res.primary_legal_issue}")
    if res.secondary_legal_issues:
        print(" • Secondary Legal Issues:")
        for sec in res.secondary_legal_issues:
            print(f"    - {sec}")
    if res.proven_facts:
        print(" • Proven / Documented Facts:")
        for fact in res.proven_facts:
            print(f"    [Fact] {fact}")
    if res.party_allegations:
        print(" • Party Contentions & Allegations:")
        for alleg in res.party_allegations:
            print(f"    [Allegation] {alleg}")
    if res.factual_uncertainties_requiring_verification:
        print(" • Factual Uncertainties Requiring Verification:")
        for unc in res.factual_uncertainties_requiring_verification:
            print(f"    [Verification] {unc}")

    # -----------------------------------------------------------------------
    # [4] APPLICABLE LEGAL FRAMEWORK
    # -----------------------------------------------------------------------
    print("\n[4] APPLICABLE LEGAL FRAMEWORK")
    print("-" * 70)
    print(" • Primary Statutes:")
    for p in res.primary_laws:
        print(f"    - {p.statute_name} [{p.section_number}] ({p.certainty_level}):")
        print(f"      {p.relevance}")
    if res.secondary_and_alternative_laws:
        print(" • Secondary & Specialized Laws:")
        for p in res.secondary_and_alternative_laws:
            print(f"    - {p.statute_name} [{p.section_number}] ({p.certainty_level}):")
            print(f"      {p.relevance}")
    if res.procedural_and_limitation_laws:
        print(" • Procedural & Limitation Laws:")
        for p in res.procedural_and_limitation_laws:
            print(f"    - {p.statute_name} [{p.section_number}] ({p.certainty_level}):")
            print(f"      {p.relevance}")

    # -----------------------------------------------------------------------
    # [5] POTENTIAL FORUM AND JURISDICTION
    # -----------------------------------------------------------------------
    print("\n[5] POTENTIAL FORUM AND JURISDICTION")
    print("-" * 70)
    print(f" • Potential Forum:        {res.potential_forum}")
    print(f" • Forum Rationale:        {res.forum_rationale}")
    print(f" • Jurisdictional Basis:   {res.jurisdictional_requirements}")
    if res.jurisdiction_verification_notes:
        print(f" • Verification Note:      {res.jurisdiction_verification_notes}")

    # -----------------------------------------------------------------------
    # [6] MATERIAL FOLLOW-UP QUESTIONS
    # -----------------------------------------------------------------------
    print("\n[6] MATERIAL FOLLOW-UP QUESTIONS")
    print("-" * 70)
    for i, q in enumerate(res.material_follow_up_questions, 1):
        print(f" [{i}] {q['question']}")
        print(f"     Purpose: {q['purpose']}")

    # -----------------------------------------------------------------------
    # [7] RELEVANT EVIDENCE
    # -----------------------------------------------------------------------
    print("\n[7] RELEVANT EVIDENCE")
    print("-" * 70)
    print(" • Essential Evidence:")
    for ev in res.essential_evidence:
        print(f"    - {ev}")
    print(" • Supporting Evidence:")
    for ev in res.supporting_evidence:
        print(f"    - {ev}")
    print(" • Digital Evidence:")
    for ev in res.digital_evidence:
        print(f"    - {ev}")
    print(" • Documents to Preserve:")
    for ev in res.documents_to_preserve:
        print(f"    - {ev}")

    # -----------------------------------------------------------------------
    # [8] POSSIBLE REMEDIES
    # -----------------------------------------------------------------------
    print("\n[8] POSSIBLE REMEDIES")
    print("-" * 70)
    for rem in res.possible_remedies:
        print(f" • {rem}")

    # -----------------------------------------------------------------------
    # [9] ACTION PLAN
    # -----------------------------------------------------------------------
    print("\n[9] ACTION PLAN")
    print("-" * 70)
    print(f" 1. {res.immediate_preservation_step}")
    print(f" 2. {res.communication_or_notice_step}")
    print(f" 3. {res.statutory_authority_or_court_step}")
    print(f" 4. {res.time_sensitive_actions}")
    print(f" 5. {res.escalation_path}")

    # -----------------------------------------------------------------------
    # [10] LEGAL NOTICE OR DRAFT
    # -----------------------------------------------------------------------
    if res.legal_notice:
        print("\n[10] LEGAL NOTICE DRAFT")
        print("-" * 70)
        print(res.legal_notice.notice_text)

    print("\n" + "=" * 80)
    print("  ✅ 11-PHASE MASTER LEGAL ANALYSIS & NAVIGATION COMPLETED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    run_interactive()
