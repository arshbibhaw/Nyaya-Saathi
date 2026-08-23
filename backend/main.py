"""
Nyaya Saathi — FastAPI Application Entry Point.
Dynamic AI Legal Navigator & Case Engine.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.api.v1.router import router as v1_router
from app.db.init_db import init_db

logger = logging.getLogger("nyaya_saathi")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown events."""
    # --- Startup ---
    try:
        init_db()
    except Exception as e:
        logger.warning("Database init encountered non-fatal notice: %s", e)
    yield
    # --- Shutdown ---


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-assisted legal navigation platform — Problem → Law → Evidence → Action",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# Global Exception Handler (Ensures CORS headers are ALWAYS returned)
# ---------------------------------------------------------------------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled Exception at %s: %s", request.url, exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": f"Server processing error: {str(exc)}"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
        },
    )

# ---------------------------------------------------------------------------
# Middleware (Comprehensive CORS support for local and deployed frontends)
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(v1_router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health", tags=["Health"])
def health_check():
    """Simple health probe."""
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.APP_VERSION}
