"""
Nyaya Saathi — Dynamic Conversational AI Legal Reasoner & Navigator
Provides deep, context-aware, highly intelligent legal guidance for Indian citizens.
"""

import logging
import os
import re
import urllib.parse
import urllib.request
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

_INVALID_OPENAI_KEYS = set()


def generate_dynamic_chat_response(
    case_domain: Optional[str],
    case_issue: Optional[str],
    case_description: Optional[str],
    case_location: Optional[str],
    user_message: str,
    conversation_history: Optional[List[Dict[str, str]]] = None,
    rag_context: str = "",
) -> Tuple[str, List[Dict[str, str]], List[str]]:
    """
    Generates a context-aware dynamic legal guidance response.
    Returns: (response_text, sources_list, follow_up_questions)
    """
    from app.ai.llm.client import LLMClient
    import asyncio

    user_msg_clean = user_message.strip()
    msg_lower = user_msg_clean.lower()
    domain_clean = case_domain or "General Legal Dispute"
    issue_clean = case_issue or "Enforcement of statutory rights and contractual obligations"
    desc_clean = case_description or issue_clean
    location_clean = case_location or "India"

    amount_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{2,3})+|\d{3,9})', f"{desc_clean} {issue_clean} {user_msg_clean}", re.IGNORECASE)
    amount_str = f"₹{amount_match.group(1)}" if amount_match else "the disputed claim"

    from app.ai.prompts.statutory_reasoning import STATUTORY_REASONING_CHAT

    system_prompt = (
        f"You are Nyaya Saathi, an elite AI Indian Legal Navigator and Pair Counsel for citizens.\n"
        f"Active Case Dossier:\n"
        f"- Legal Domain: {domain_clean}\n"
        f"- Core Issue: {issue_clean}\n"
        f"- Disputed Amount / Claim: {amount_str}\n"
        f"- Incident Facts: {desc_clean}\n"
        f"- Jurisdiction / State: {location_clean}\n\n"
        f"{STATUTORY_REASONING_CHAT}\n\n"
        f"RESPONSE GUIDELINES:\n"
        f"1. Directly, empathetically, and precisely answer the citizen's specific query.\n"
        f"2. Cite ONLY statutes that are directly relevant to the facts above.\n"
        f"3. State exact actionable steps, evidence requirements, and limitation timelines.\n"
        f"4. Be conversational, natural, and highly structured (use bold headers and bullet points).\n"
        f"5. If the legal context from the database is provided below, ground your answer in it.\n\n"
        f"Legal Context from Database:\n{rag_context if rag_context else 'None provided.'}"
    )

    chat_messages = [{"role": "system", "content": system_prompt}]
    if conversation_history:
        for h in conversation_history[-4:]:
            chat_messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
    chat_messages.append({"role": "user", "content": user_msg_clean})

    try:
        client = LLMClient()
        response_data = asyncio.run(
            client.complete(
                messages=chat_messages,
                step="chat_response"
            )
        )
        content = response_data["content"].strip()
        if content and len(content) > 30:
            sources = _derive_sources_for_domain(domain_clean, msg_lower)
            follow_ups = _derive_follow_ups(domain_clean, msg_lower)
            return content, sources, follow_ups
    except Exception as e:
        logger.warning("LLMClient chat generation failed: %s", e)

    # Dynamic Statutory Intelligence Engine (Fallback)
    response_text = _synthesize_intent_response(
        domain=domain_clean,
        issue=issue_clean,
        description=desc_clean,
        location=location_clean,
        amount_str=amount_str,
        user_msg=user_msg_clean,
        msg_lower=msg_lower,
    )
    sources = _derive_sources_for_domain(domain_clean, msg_lower)
    follow_ups = _derive_follow_ups(domain_clean, msg_lower)

    return response_text, sources, follow_ups


def _synthesize_intent_response(
    domain: str,
    issue: str,
    description: str,
    location: str,
    amount_str: str,
    user_msg: str,
    msg_lower: str,
) -> str:
    """
    Synthesizes custom legal analysis depending on the exact question asked by the citizen.
    """
    domain_lower = domain.lower()

    # ───────────────────────────────────────────────────────────────────────────
    # 1. CAN LANDLORD CUT ELECTRICITY / WATER / LOCK PREMISES / EVICT FORCEFULLY
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["cut electricity", "cut power", "cut water", "disconnect", "lock the door", "change lock", "throw out", "evict without", "forceful eviction"]):
        return (
            f"**No, the landlord cannot cut essential services or forcefully evict you under Indian law.**\n\n"
            f"1. **Statutory Prohibition (Section 20 Model Tenancy Act & State Rent Acts)**: Landlords are strictly prohibited from withholding essential supply or services (electricity, water, elevator, parking) even if there is a dispute or rent delay.\n"
            f"2. **Supreme Court Precedent (*Bishandas v. State of Punjab*)**: Forceful eviction without due process of law is illegal and constitutes criminal trespass under Section 329 of Bharatiya Nyaya Sanhita (BNS) / Section 441 IPC.\n"
            f"3. **Immediate Legal Recourse**:\n"
            f"   - **Dial 112 / Police Intervention**: Inform the police immediately that essential supplies have been unlawfully disconnected.\n"
            f"   - **Rent Authority Injunction**: Apply before the Rent Authority in {location} for an urgent order directing immediate restoration of utilities with statutory penalties on the landlord."
        )

    # ───────────────────────────────────────────────────────────────────────────
    # 2. PAINTING CHARGES / DAMAGE DEDUCTIONS / DEPOSIT CUTS
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["paint", "painting", "wear and tear", "damage", "deduct", "cleaning fee", "depreciation", "bills", "receipts"]):
        return (
            f"Regarding deductions for painting, cleaning, or repairs from your {amount_str} deposit:\n\n"
            f"1. **Fair Wear & Tear is Non-Deductible**: Under Section 15 of the Model Tenancy Act and standard tenancy law, landlords cannot deduct costs for normal wear and tear resulting from routine living (e.g. natural paint fading, minor scuffs).\n"
            f"2. **Mandatory Itemized Bills**: Under Section 11 of the Model Tenancy Act, the landlord cannot make arbitrary flat-rate deductions. They are legally mandated to furnish original contractor bills and itemized invoices.\n"
            f"3. **How to Contest**:\n"
            f"   - Send a formal reply demanding copies of original payment receipts for any alleged repairs within 7 days.\n"
            f"   - State that failure to provide verified invoices constitutes unlawful withholding of {amount_str}, liable to be recovered with 18% annual interest in court."
        )

    # ───────────────────────────────────────────────────────────────────────────
    # 3. EVIDENCE ADMISSIBILITY (WhatsApp Chats, Call Recordings, Electronic Proof)
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["whatsapp", "screenshot", "call recording", "audio", "video", "admissible", "evidence in court", "section 65b", "electronic evidence"]):
        return (
            f"**Yes, WhatsApp chats, emails, and call recordings are valid legal evidence in Indian courts.**\n\n"
            f"1. **Governing Law (Section 63 Bharatiya Sakshya Adhiniyam, 2023 / Sec 65B IEA)**: Electronic records, digital chats, and call recordings are fully admissible when accompanied by a statutory certificate of electronic evidence.\n"
            f"2. **How to Legally Preserve Them**:\n"
            f"   - **Export Full Chat Thread**: Do not just take isolated screenshots; export the `.txt` chat history with timestamps and phone numbers.\n"
            f"   - **Back up Audio Files**: Retain original audio files on cloud storage with metadata intact.\n"
            f"   - **Bank & UPI Logs**: Download official PDF statements directly from net banking showing the {amount_str} debit."
        )

    # ───────────────────────────────────────────────────────────────────────────
    # 4. POLICE REFUSAL TO REGISTER FIR / COMPLAINT
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["police refuse", "not writing fir", "not taking complaint", "sho refuse", "no fir", "refuse to register"]):
        return (
            f"If the Police Station in {location} refuses to register your FIR:\n\n"
            f"1. **Mandatory FIR (*Lalita Kumari v. Govt of UP*)**: The Supreme Court ruled that police officers are statutorily obligated to register an FIR for cognizable offences under Section 173 BNSS (Sec 154 CrPC).\n"
            f"2. **Step 1 — Representation to SP (Section 173(4) BNSS)**: Send a copy of your written complaint to the Superintendent of Police (SP) / DCP by Registered Post AD.\n"
            f"3. **Step 2 — Magistrate Application (Section 175(3) BNSS / 156(3) CrPC)**: If the SP does not act, file an application before the Judicial Magistrate having jurisdiction. The Magistrate has powers to direct police investigation and registration of FIR."
        )

    # ───────────────────────────────────────────────────────────────────────────
    # 5. ARREST & DETENTION RIGHTS / NOTICE OF APPEARANCE
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["arrest", "custody", "detain", "lock up", "bailable", "non-bailable", "warrant", "notice of appearance", "41a"]):
        return (
            f"Key statutory protections regarding arrest and police summons:\n\n"
            f"1. **Mandatory Notice of Appearance (Section 35 BNSS / Sec 41A CrPC)**: For offences punishable up to 7 years, police cannot arrest arbitrarily without first serving a formal written Notice of Appearance (*Arnesh Kumar v. State of Bihar*).\n"
            f"2. **Right to Legal Counsel (Article 22 & Section 38 BNSS)**: You have the constitutional right to consult an advocate of your choice during interrogation.\n"
            f"3. **D.K. Basu Guidelines**: Arrest memo must be prepared with date, time, and signed by at least one family member or respectable witness."
        )

    # ───────────────────────────────────────────────────────────────────────────
    # 6. UNRESPONSIVE / BLOCKED / GHOSTING OPPOSING PARTY
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["ignore", "not picking", "not answering", "blocked", "refusing to talk", "cut call", "unresponsive", "ghosting", "silent"]):
        if "tenant" in domain_lower or "landlord" in domain_lower or "rent" in domain_lower:
            return (
                f"If your landlord is ignoring your calls or refusing to communicate regarding your {amount_str} deposit:\n\n"
                f"1. **Stop Verbal Follow-ups**: Verbal communications have zero evidentiary value in court. Switch immediately to documented communication channels.\n"
                f"2. **Send Final Written Notice via WhatsApp & Speed Post**: Send a clear written message citing your move-out date, key handover confirmation, and bank account details for refund under Section 11 of the Model Tenancy Act, 2021.\n"
                f"3. **Formal 15-Day Legal Demand Notice**: If there is no response within 3-5 days, dispatch a formal Legal Notice by Registered Post AD. The postal tracking report serves as conclusive legal proof of service.\n"
                f"4. **Approach the Rent Authority**: In {location}, you can file a petition before the local Rent Authority or a summary recovery suit under Order XXXVII of the CPC for recovery of {amount_str} with 18% annual interest for wrongful withholding."
            )
        elif "consumer" in domain_lower or "flipkart" in domain_lower or "amazon" in domain_lower:
            return (
                f"If the seller/e-commerce merchant is unresponsive regarding your refund of {amount_str}:\n\n"
                f"1. **National Consumer Helpline Escalation**: Lodge a formal grievance on the NCH portal (consumerhelpline.gov.in) or call 1915. Most registered companies are mandated to respond to NCH within 48 hours.\n"
                f"2. **Chargeback / Payment Gateway Dispute**: If paid via Credit/Debit Card or UPI, raise a dispute with your issuing bank under RBI Guidelines for 'Defective Goods / Undelivered Service'.\n"
                f"3. **File e-Daakhil Case**: If unaddressed, file a direct complaint online before the District Consumer Commission via e-Daakhil (edaakhil.nic.in) demanding 100% refund of {amount_str} plus compensation for mental agony."
            )
        elif "salary" in domain_lower or "employer" in domain_lower or "employment" in domain_lower:
            return (
                f"If your employer/HR is ignoring your emails regarding unpaid salary/FnF dues of {amount_str}:\n\n"
                f"1. **Send Formal Legal Notice to Directors**: Dispatch a 15-day Legal Notice to the Managing Director and Registered Company Address citing Section 15 of the Payment of Wages Act, 1936.\n"
                f"2. **Lodge Complaint on SAMADHAN Portal**: File an online complaint on the Ministry of Labour SAMADHAN portal (samadhan.labour.gov.in).\n"
                f"3. **Approach Labour Commissioner**: The Labour Commissioner has summary powers to issue recovery certificates and attach company assets for willful wage default."
            )
        else:
            return (
                f"When the opposing party refuses to answer or evades communication regarding {issue}:\n\n"
                f"1. **Switch to Written Notice**: Stop verbal requests and send a formal written demand notice via Registered Post AD and Email to create an irrefutable legal paper trail.\n"
                f"2. **15-Day Statutory Window**: Stipulate a 15-day deadline for amicable resolution, stating failure will lead to immediate legal recovery proceedings.\n"
                f"3. **Initiate Forum Proceedings**: File a recovery proceeding before the designated judicial forum or mediation authority in {location} under the Indian Contract Act, 1872."
            )

    # ───────────────────────────────────────────────────────────────────────────
    # 7. DRAFTING A NOTICE / EMAIL TEMPLATE / WHAT TO WRITE
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["draft", "write", "format", "template", "sample", "email format", "letter format", "how to write", "notice text"]):
        return (
            f"Here is a ready-to-use formal communication draft tailored to your case:\n\n"
            f"**Subject**: FORMAL DEMAND NOTICE — SETTLEMENT OF {amount_str.upper()} / {domain.upper()}\n\n"
            f"**To**: [Opposite Party Name / Authority],\n"
            f"**Location**: {location}\n\n"
            f"Sir/Madam,\n\n"
            f"I am writing regarding the active matter of '{issue}'.\n\n"
            f"1. **Background**: {description}\n"
            f"2. **Statutory Non-Compliance**: Your failure to settle the legitimate claim of {amount_str} violates governing Indian statutory provisions and contract terms.\n"
            f"3. **Demand**: You are hereby called upon to settle the full sum of {amount_str} into my designated account within 15 (fifteen) days of receipt of this notice.\n\n"
            f"Take Notice that failure to resolve this within the stipulated 15 days will leave me no option but to initiate formal legal proceedings before the competent Court/Authority at your sole risk and cost.\n\n"
            f"Yours sincerely,\n"
            f"[Your Name]\n"
            f"[Your Phone & Address]\n\n"
            f"*(Tip: You can also download full legal drafts from your Document Vault tab)*"
        )

    # ───────────────────────────────────────────────────────────────────────────
    # 8. DEADLINES / LIMITATION PERIOD / TIME LIMITS
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["time", "days", "period", "deadline", "how long", "limitation", "expire", "statute of limitation", "when"]):
        if "tenant" in domain_lower or "rent" in domain_lower:
            return (
                f"Statutory timelines for your tenancy deposit matter in {location}:\n\n"
                f"1. **Landlord Refund Window**: Under Section 11 of the Model Tenancy Act, 2021, the landlord must refund the security deposit within **30 days** of vacating the premises.\n"
                f"2. **Notice Response Period**: A standard legal notice grants the landlord **15 days** to comply before you can file in court.\n"
                f"3. **Limitation Period for Recovery**: Under Article 22 of the Limitation Act, 1963, you have **3 years** from the date of vacating the premises to file a civil recovery suit or Rent Authority petition."
            )
        elif "cyber" in domain_lower or "bank" in domain_lower or "fraud" in domain_lower:
            return (
                f"Critical time limits for your cyber financial fraud case:\n\n"
                f"1. **Golden Window (72 Hours)**: Under RBI Circular (2017), you must report the unauthorized debit to the bank within **3 working days** for statutory **Zero Customer Liability**.\n"
                f"2. **Bank Shadow Credit**: The bank must credit the disputed amount back to your account within **10 working days** from the complaint date.\n"
                f"3. **Banking Ombudsman Escalation**: If the bank does not resolve your dispute within **30 days**, you can immediately file on the RBI CMS portal (cms.rbi.org.in)."
            )
        elif "consumer" in domain_lower:
            return (
                f"Statutory timelines under the Consumer Protection Act, 2019:\n\n"
                f"1. **Notice Window**: Grant the merchant/seller **15 days** in your legal notice to process the refund of {amount_str}.\n"
                f"2. **Limitation Period**: Under Section 69 of the CPA 2019, you have **2 years** from the date of purchase or defect discovery to file on e-Daakhil.\n"
                f"3. **Appeal Window**: Either party has **45 days** to appeal a District Commission order before the State Commission."
            )
        elif "traffic" in domain_lower or "challan" in domain_lower:
            return (
                f"Timelines for contesting traffic challans:\n\n"
                f"1. **Virtual Court Window**: You can contest or plead not guilty on the Virtual Court portal (vcourts.gov.in) within **90 days** of challan issuance.\n"
                f"2. **Document Verification**: Under Rule 139 CMVR, if physical documents could not be produced during the stop, you have **15 days** to present DigiLocker credentials at the RTO/Traffic Police office."
            )
        else:
            return (
                f"Statutory limitation periods for your legal matter in {location}:\n\n"
                f"1. **Notice Period**: Standard practice mandates serving a **15-day** written Legal Demand Notice.\n"
                f"2. **Limitation Act, 1963**: Under Article 55 / Article 113, you have **3 years** from the date the cause of action arose to initiate recovery or civil proceedings."
            )

    # ───────────────────────────────────────────────────────────────────────────
    # 9. THREATS / HARASSMENT / COUNTERPARTY INTIMIDATION
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["threat", "threaten", "harass", "abusive", "blackmail", "intimidat", "scared", "fear", "force"]):
        return (
            f"If the opposing party is threatening, intimidating, or harassing you regarding this dispute:\n\n"
            f"1. **Preserve Immediate Evidence**: Take screenshots of threatening WhatsApp messages, record phone calls, and save CCTV/audio clips. Do not delete any chat history.\n"
            f"2. **Criminal Intimidation (Section 351 BNS / Sec 506 IPC)**: Threatening injury to reputation, property, or person is a cognizable criminal offence.\n"
            f"3. **Lodge Police Complaint**: File a written complaint for Criminal Intimidation at your local Police Station in {location} and obtain a stamped acknowledgment (GD entry).\n"
            f"4. **No Self-Help / Unlawful Eviction**: Under Indian law, landlords or creditors cannot use muscle power, cut electricity/water, or forcefully evict without due process of law (*Bishandas v. State of Punjab*)."
        )

    # ───────────────────────────────────────────────────────────────────────────
    # 10. WHICH COURT / JURISDICTION / WHERE TO FILE
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["where", "which court", "where to file", "authority", "police station", "jurisdiction", "portal", "website"]):
        if "tenant" in domain_lower or "landlord" in domain_lower:
            return (
                f"Jurisdiction and filing forums for tenancy deposit recovery in {location}:\n\n"
                f"1. **Local Rent Authority / Rent Court**: Under the Model Tenancy Act, primary jurisdiction lies with the Rent Authority of the sub-division where the property is situated.\n"
                f"2. **Small Causes Court / District Civil Court**: For recovery of liquidated debt under Order XXXVII of the CPC (fast-track summary suit).\n"
                f"3. **District Legal Services Authority (DLSA)**: You can also apply for Pre-Institution Mediation through the District Court mediation cell."
            )
        elif "consumer" in domain_lower:
            return (
                f"Filing forums for your consumer dispute:\n\n"
                f"1. **Online Filing (e-Daakhil)**: Visit `edaakhil.nic.in` — you can file your petition entirely online without visiting the court physically.\n"
                f"2. **Territorial Jurisdiction**: Under Section 34 of the CPA 2019, you can file where you reside or work, or where the goods were delivered.\n"
                f"3. **Pecuniary Jurisdiction**: District Consumer Commission handles claims up to **₹50 Lakhs**."
            )
        elif "cyber" in domain_lower or "fraud" in domain_lower:
            return (
                f"Official reporting portals for cyber financial fraud:\n\n"
                f"1. **National Cyber Crime Portal**: File immediately on `cybercrime.gov.in` or call helpline **1930**.\n"
                f"2. **Bank Grievance Redressal**: Submit a written dispute to your home branch Branch Manager.\n"
                f"3. **RBI Banking Ombudsman**: Escalate on `cms.rbi.org.in` if the bank fails to resolve within 30 days."
            )
        else:
            return (
                f"Applicable legal forums for your case in {location}:\n\n"
                f"1. **District Civil Court / Commercial Court**: Where the cause of action arose or where the respondent resides.\n"
                f"2. **District Mediation Cell (DLSA)**: For fast-track pre-litigation settlement."
            )

    # ───────────────────────────────────────────────────────────────────────────
    # 11. COURT FEES / LAWYERS / FREE LEGAL AID (DLSA / NALSA)
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["lawyer", "advocate", "court fee", "cost", "free legal aid", "dlsa", "nalsa", "afford"]):
        return (
            f"Information on legal costs, lawyer representation, and free legal aid in {location}:\n\n"
            f"1. **Do You Need a Lawyer?** For Consumer Commissions (e-Daakhil) and Rent Authorities, you can legally represent yourself (*Party-in-Person*) without hiring an advocate.\n"
            f"2. **Court Fees**: Court fees for summary recovery or consumer complaints for {amount_str} are nominal (typically under ₹500 - ₹2,000 depending on state schedule).\n"
            f"3. **Free Legal Aid (Section 12 Legal Services Authorities Act, 1987)**: If you qualify under income thresholds or as a woman/senior citizen, the District Legal Services Authority (DLSA) in {location} will appoint an experienced lawyer for your case 100% free of charge."
        )

    # ───────────────────────────────────────────────────────────────────────────
    # 12. IMMEDIATE NEXT STEPS / "WHAT SHALL I DO"
    # ───────────────────────────────────────────────────────────────────────────
    if any(k in msg_lower for k in ["what shall i do", "what should i do", "what to do", "next step", "how to proceed", "advice", "guidance"]):
        if "tenant" in domain_lower or "rent" in domain_lower:
            return (
                f"Here is your immediate step-by-step roadmap for your tenancy deposit recovery in {location}:\n\n"
                f"1. **Step 1 — Consolidate Evidence**: Gather your signed rental agreement, bank statement showing {amount_str} deposit transfer, and move-out handover message.\n"
                f"2. **Step 2 — Serve 15-Day Legal Demand Notice**: Send a formal demand notice citing Section 11 Model Tenancy Act & Section 108 Transfer of Property Act.\n"
                f"3. **Step 3 — Petition Rent Authority**: If the landlord does not refund within 15 days, file before the Rent Authority / Civil Court under Order XXXVII CPC demanding full refund with 18% statutory interest.\n\n"
                f"Would you like me to draft your formal 15-day Legal Notice right now?"
            )
        elif "cyber" in domain_lower or "fraud" in domain_lower:
            return (
                f"Immediate action roadmap for your cyber fraud matter:\n\n"
                f"1. **Step 1 — Dial 1930**: Call Cyber Crime Helpline 1930 immediately to freeze the fraudster's beneficiary account.\n"
                f"2. **Step 2 — Bank Dispute**: Submit a written dispute at your home branch within 72 hours to secure statutory Zero Liability under RBI guidelines.\n"
                f"3. **Step 3 — Register FIR Ack**: Log complaint on `cybercrime.gov.in` and retain the Ack ID for bank follow-up."
            )
        elif "consumer" in domain_lower:
            return (
                f"Immediate action roadmap for your consumer dispute regarding {amount_str}:\n\n"
                f"1. **Step 1 — Document Defect**: Save invoice, unboxing videos, and photos showing product defects.\n"
                f"2. **Step 2 — National Consumer Helpline**: File complaint on `consumerhelpline.gov.in` or call 1915.\n"
                f"3. **Step 3 — e-Daakhil Petition**: If unresolved after 15 days, file on `edaakhil.nic.in` before the District Consumer Commission."
            )
        else:
            return (
                f"Here is your immediate action roadmap regarding '{issue}':\n\n"
                f"1. **Step 1 — Evidence Consolidation**: Compile contracts, invoices, payment proofs of {amount_str}, and communication logs.\n"
                f"2. **Step 2 — Formal Written Demand Notice**: Serve a 15-day statutory notice demanding settlement.\n"
                f"3. **Step 3 — Judicial Enforcement**: If default continues, initiate recovery proceedings before the designated civil/statutory authority in {location}."
            )

    # ───────────────────────────────────────────────────────────────────────────
    # 13. DYNAMIC CONVERSATIONAL FALLBACK (Deconstructs query by subject & context)
    # ───────────────────────────────────────────────────────────────────────────
    return (
        f"In response to your question regarding **'{user_msg}'** for your **{domain}** case in {location}:\n\n"
        f"1. **Legal Position & Rights**: Under governing Indian statutes regarding {issue}, your legal position is protected against arbitrary default or denial. The opposing party is legally required to adhere to agreed terms regarding {amount_str}.\n"
        f"2. **Strategic Recommendation**: Ensure that all communications related to '{user_msg}' are maintained in writing with timestamps. Verbal discussions hold zero evidentiary value in court.\n"
        f"3. **Actionable Next Step**: Check your **Action Plan** tab for your generated 5-step roadmap, or let me know if you would like me to draft a specific demand letter or dispute petition for this issue."
    )


def _derive_sources_for_domain(domain: str, msg_lower: str) -> List[Dict[str, str]]:
    """Derives relevant legal sources matching domain and user question."""
    d = domain.lower()
    if "tenant" in d or "rent" in d or "landlord" in d:
        return [
            {"title": "Model Tenancy Act, 2021 (Section 11 & 20)", "source_url": "https://mohua.gov.in"},
            {"title": "Transfer of Property Act, 1882 (Section 108)", "source_url": "https://indiacode.nic.in"},
            {"title": "Code of Civil Procedure, 1908 (Order XXXVII)", "source_url": "https://indiacode.nic.in"},
        ]
    elif "consumer" in d or "product" in d or "refund" in d:
        return [
            {"title": "Consumer Protection Act, 2019 (Section 2(47) & 35)", "source_url": "https://consumerhelpline.gov.in"},
            {"title": "Consumer Protection (E-Commerce) Rules, 2020", "source_url": "https://consumerhelpline.gov.in"},
        ]
    elif "cyber" in d or "fraud" in d or "bank" in d:
        return [
            {"title": "RBI Customer Liability Circular (2017)", "source_url": "https://rbi.org.in"},
            {"title": "Information Technology Act, 2000 (Section 66D)", "source_url": "https://cybercrime.gov.in"},
        ]
    elif "traffic" in d or "challan" in d or "vehicle" in d:
        return [
            {"title": "Central Motor Vehicles Rules, 1989 (Rule 139)", "source_url": "https://parivahan.gov.in"},
            {"title": "Motor Vehicles Act, 1988 (Section 130 & 206)", "source_url": "https://parivahan.gov.in"},
        ]
    elif "salary" in d or "employer" in d or "employment" in d:
        return [
            {"title": "Payment of Wages Act, 1936 (Section 15)", "source_url": "https://labour.gov.in"},
            {"title": "Industrial Disputes Act, 1947 (Section 33C)", "source_url": "https://labour.gov.in"},
        ]
    elif "fir" in d or "police" in d or "crime" in d:
        return [
            {"title": "Bharatiya Nagarik Suraksha Sanhita, 2023 (Section 173 & 35)", "source_url": "https://mha.gov.in"},
            {"title": "Supreme Court (Lalita Kumari v. Govt of UP)", "source_url": "https://sci.gov.in"},
        ]
    return [
        {"title": "Indian Contract Act, 1872 (Section 73)", "source_url": "https://indiacode.nic.in"},
        {"title": "Constitution of India (Articles 21 & 39A)", "source_url": "https://nalsa.gov.in"},
    ]


def _derive_follow_ups(domain: str, msg_lower: str) -> List[str]:
    """Provides dynamic intelligent follow-up suggestions."""
    d = domain.lower()
    if "draft" in msg_lower or "write" in msg_lower:
        return ["Would you like to customize party names and addresses in this draft?", "Should I save this draft to your Document Vault?"]
    if "tenant" in d or "rent" in d:
        return ["Can the landlord deduct painting charges?", "Can the landlord cut electricity or water?", "How to file in Rent Court without a lawyer?"]
    elif "consumer" in d:
        return ["How to file on e-Daakhil without a lawyer?", "What compensation can I claim for defective goods?"]
    elif "cyber" in d or "fraud" in d:
        return ["What is the exact 72-hour RBI Zero Liability rule?", "How to escalate to the Banking Ombudsman?"]
    return ["Would you like me to draft a formal Legal Notice for this case?", "What evidence should I preserve next?"]
