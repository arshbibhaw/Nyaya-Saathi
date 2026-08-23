"""
Re-export all ORM models so that ``import app.models`` registers them
with the Base metadata (needed by init_db and Alembic).
"""

from app.models.user import User  # noqa: F401
from app.models.case import Case  # noqa: F401
from app.models.case_question import CaseQuestion  # noqa: F401
from app.models.evidence import Evidence  # noqa: F401
from app.models.action_plan import ActionPlan  # noqa: F401
from app.models.document import Document  # noqa: F401
from app.models.legal_source import LegalSource  # noqa: F401
from app.models.escalation import Escalation  # noqa: F401
from app.models.evidence_checklist import EvidenceChecklist  # noqa: F401

