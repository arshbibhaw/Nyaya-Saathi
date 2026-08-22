"""
Issue classifier stub.

Determines the legal domain and specific issue from a natural-language
description.  The AI teammate should replace the stub logic with an
actual LLM call using the classifier prompt from templates.py.
"""

# Keyword → domain mapping for the stub classifier.  This is a quick
# heuristic so the rest of the pipeline works end-to-end during early
# development.  Replace with a proper LLM classifier.
_DOMAIN_KEYWORDS: dict[str, tuple[str, str]] = {
    "fraud": ("Cyber / Financial Fraud", "Online Financial Fraud"),
    "scam": ("Cyber / Financial Fraud", "Online Scam"),
    "salary": ("Employment Law", "Unpaid Wages"),
    "wage": ("Employment Law", "Unpaid Wages"),
    "employer": ("Employment Law", "Employment Dispute"),
    "landlord": ("Rental / Property", "Tenant Dispute"),
    "rent": ("Rental / Property", "Rental Dispute"),
    "tenant": ("Rental / Property", "Tenant Rights"),
    "consumer": ("Consumer Protection", "Consumer Complaint"),
    "refund": ("Consumer Protection", "Refund Dispute"),
    "product": ("Consumer Protection", "Defective Product"),
    "bank": ("Banking / Financial", "Banking Grievance"),
    "loan": ("Banking / Financial", "Loan Dispute"),
    "contract": ("Contract Law", "Contract Dispute"),
}


def classify_issue(text: str) -> dict:
    """
    Classify a user's natural-language problem into a legal domain.

    Parameters
    ----------
    text : str
        The user's description of their legal problem.

    Returns
    -------
    dict
        ``{"domain": str, "issue": str}``

    .. note::
        **STUB** — returns a keyword-matched classification.  Replace with
        an LLM call to ``app.ai.prompts.templates.CLASSIFIER_PROMPT``.
    """
    lower = text.lower()
    for keyword, (domain, issue) in _DOMAIN_KEYWORDS.items():
        if keyword in lower:
            return {"domain": domain, "issue": issue}

    return {"domain": "General Legal", "issue": "General Enquiry"}
