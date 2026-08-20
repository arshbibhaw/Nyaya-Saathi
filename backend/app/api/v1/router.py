"""
Aggregated API v1 router.

Import and include all domain-specific routers here.
"""

from fastapi import APIRouter

from app.api.v1 import cases, chat, documents, evidence, auth

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(cases.router, prefix="/cases", tags=["Cases"])
# We will fix the other routers' prefixes to match frontend (under cases/{caseId}) in a bit.
api_router.include_router(chat.router, prefix="/cases/{case_id}/chat", tags=["Chat"])
api_router.include_router(evidence.router, prefix="/cases/{case_id}/evidence", tags=["Evidence"])
api_router.include_router(documents.router, prefix="/cases/{case_id}", tags=["Documents/Plan"])
