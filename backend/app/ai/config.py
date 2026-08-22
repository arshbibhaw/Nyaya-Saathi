"""
Nyaya Saathi — AI Configuration
================================
Centralised configuration for all AI/ML components.
All models, thresholds, timeouts, and official links are defined here.
"""

from typing import Dict, List
import os


# ---------------------------------------------------------------------------
# LLM Models
# ---------------------------------------------------------------------------

PRIMARY_LLM_MODEL: str = os.getenv("PRIMARY_LLM_MODEL", "gpt-4o")
FALLBACK_LLM_MODEL: str = os.getenv("FALLBACK_LLM_MODEL", "gpt-4o-mini")
LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "openai")  # openai | google | anthropic

# Embedding
EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
EMBEDDING_DIMENSION: int = int(os.getenv("EMBEDDING_DIMENSION", "1536"))
EMBEDDING_BATCH_SIZE: int = int(os.getenv("EMBEDDING_BATCH_SIZE", "64"))

# Reranker
RERANKER_MODEL: str = os.getenv("RERANKER_MODEL", "BAAI/bge-reranker-base")
RERANKER_ENABLED: bool = os.getenv("RERANKER_ENABLED", "true").lower() == "true"


# ---------------------------------------------------------------------------
# Retrieval
# ---------------------------------------------------------------------------

RETRIEVAL_TOP_K_SEMANTIC: int = 20
RETRIEVAL_TOP_K_KEYWORD: int = 20
RETRIEVAL_TOP_K_MERGED: int = 15
RERANK_TOP_K: int = 5
SIMILARITY_THRESHOLD: float = 0.3
RRF_K: int = 60  # Reciprocal Rank Fusion constant


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------

MAX_CONTEXT_TOKENS: int = 8000
MAX_OUTPUT_TOKENS: int = 2000
TEMPERATURE: float = 0.1          # Low temperature for legal content
TOP_P: float = 0.95


# ---------------------------------------------------------------------------
# Safety & Limits
# ---------------------------------------------------------------------------

MAX_FOLLOW_UP_QUESTIONS: int = 6
ABSTENTION_THRESHOLD: float = 0.3  # Below this retrieval score → abstain
COST_ALERT_DAILY_USD: float = float(os.getenv("COST_ALERT_DAILY_USD", "10.0"))

# Classification
CLASSIFICATION_CONFIDENCE_THRESHOLD: float = 0.6  # Below → "unknown"
CLASSIFICATION_MULTI_LABEL_THRESHOLD: float = 0.4  # Above → secondary category

# Evidence
MIN_OCR_TEXT_LENGTH: int = 100     # Below → fall back to OCR from PDF text
OCR_QUALITY_GARBAGE_RATIO: float = 0.5  # Above → "poor" OCR quality

# Chunks
MIN_CHUNK_CHARS: int = 50
MAX_CHUNK_TOKENS: int = 2000
TARGET_CHUNK_TOKENS: int = 800
CHUNK_OVERLAP_TOKENS: int = 200


# ---------------------------------------------------------------------------
# Timeouts (seconds)
# ---------------------------------------------------------------------------

LLM_TIMEOUT_SECONDS: int = 30
RETRIEVAL_TIMEOUT_SECONDS: int = 10
OCR_TIMEOUT_SECONDS: int = 60
EMBEDDING_TIMEOUT_SECONDS: int = 30
RERANK_TIMEOUT_SECONDS: int = 10


# ---------------------------------------------------------------------------
# Retry Configuration
# ---------------------------------------------------------------------------

LLM_MAX_RETRIES: int = 3
LLM_RETRY_BACKOFF_BASE: float = 1.0   # seconds; exponential: base * 2^attempt
EMBEDDING_MAX_RETRIES: int = 3


# ---------------------------------------------------------------------------
# Supported File Types (for evidence upload)
# ---------------------------------------------------------------------------

SUPPORTED_EVIDENCE_MIMES: List[str] = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/jpg",
    "text/plain",
]

SUPPORTED_EVIDENCE_EXTENSIONS: List[str] = [
    ".pdf", ".png", ".jpg", ".jpeg", ".txt",
]

MAX_EVIDENCE_FILE_SIZE_MB: int = 20


# ---------------------------------------------------------------------------
# Official Links Allowlist
# ---------------------------------------------------------------------------
# The LLM must NEVER invent URLs. All official links come from this allowlist.

OFFICIAL_LINKS: Dict[str, Dict[str, str]] = {
    "cybercrime_portal": {
        "name": "National Cyber Crime Reporting Portal",
        "url": "https://cybercrime.gov.in",
        "description": "Official portal for reporting cybercrime in India",
    },
    "cybercrime_helpline": {
        "name": "National Cyber Crime Helpline",
        "contact": "1930",
        "type": "phone",
        "description": "24x7 helpline for reporting cyber financial fraud",
    },
    "india_code": {
        "name": "India Code",
        "url": "https://www.indiacode.nic.in",
        "description": "Official repository of Indian legislation",
    },
    "ecourts": {
        "name": "eCourts Services",
        "url": "https://ecourts.gov.in",
        "description": "Citizen-facing court/case services",
    },
    "nalsa": {
        "name": "National Legal Services Authority",
        "url": "https://nalsa.gov.in",
        "description": "Legal aid and legal services information",
    },
    "consumer_helpline": {
        "name": "National Consumer Helpline",
        "contact": "1800-11-4000",
        "url": "https://consumerhelpline.gov.in",
        "type": "phone",
        "description": "Toll-free consumer grievance helpline",
    },
    "ncdrc": {
        "name": "National Consumer Disputes Redressal Commission",
        "url": "https://ncdrc.nic.in",
        "description": "Consumer complaint filing and tracking",
    },
    "epfo": {
        "name": "Employees' Provident Fund Organisation",
        "url": "https://www.epfindia.gov.in",
        "description": "PF-related grievance portal",
    },
    "rbi_ombudsman": {
        "name": "RBI Integrated Ombudsman",
        "url": "https://cms.rbi.org.in",
        "description": "Banking complaint redressal",
    },
    "police_emergency": {
        "name": "Police Emergency",
        "contact": "112",
        "type": "phone",
        "description": "Emergency police assistance",
    },
    "women_helpline": {
        "name": "Women Helpline",
        "contact": "181",
        "type": "phone",
        "description": "Women in distress helpline",
    },
}


# ---------------------------------------------------------------------------
# Prompt Versions
# ---------------------------------------------------------------------------
# Every prompt template is versioned. The version used is logged per AI call.

PROMPT_VERSIONS: Dict[str, str] = {
    "classify": "v1.0",
    "questions": "v1.0",
    "generate": "v1.0",
    "action_plan": "v1.0",
    "document": "v1.0",
    "evidence": "v1.0",
    "safety": "v1.0",
}


# ---------------------------------------------------------------------------
# Domain Slugs
# ---------------------------------------------------------------------------

LEGAL_DOMAINS: List[str] = [
    "cyber_fraud",
    "consumer",
    "rental",
    "employment",
    "banking",
    "contract",
    "legal_aid",
]


# ---------------------------------------------------------------------------
# Database / pgvector
# ---------------------------------------------------------------------------

PGVECTOR_INDEX_TYPE: str = "hnsw"      # hnsw or ivfflat
PGVECTOR_HNSW_M: int = 16
PGVECTOR_HNSW_EF_CONSTRUCTION: int = 64
PGVECTOR_DISTANCE_METRIC: str = "cosine"  # cosine | l2 | inner_product


# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

AI_LOG_LEVEL: str = os.getenv("AI_LOG_LEVEL", "INFO")
LOG_PII: bool = False  # NEVER set to True in production
