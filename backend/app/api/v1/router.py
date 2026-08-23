"""
Aggregate all v1 sub-routers into a single router mounted at /api/v1.
"""

from fastapi import APIRouter

from app.api.v1 import auth, users, cases, evidence, plans, documents, questions, escalation, dashboard

router = APIRouter(prefix="/api/v1")

router.include_router(auth.router)
router.include_router(users.router)
router.include_router(cases.router)
router.include_router(evidence.router)
router.include_router(plans.router)
router.include_router(documents.router)
router.include_router(questions.router)
router.include_router(escalation.router)
router.include_router(dashboard.router)
