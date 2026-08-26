"""
Application configuration loaded from environment variables.
"""

import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Central configuration for the Nyaya Saathi backend."""

    # --- Application ---
    APP_NAME: str = "Nyaya Saathi API"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # --- Database ---
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./nyayasaathi.db")

    # --- Security ---
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 60 * 24  # 24 hours

    # --- AI / LLM (unified key) ---
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("LLM_API_KEY", "")  # alias for embedder compat
    GEMINI_API_KEY: str = ""
    LLM_MODEL: str = os.getenv("LLM_MODEL", "gpt-4o")
    EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    EMBEDDING_DIMENSIONS: int = 1536

    # --- File Uploads ---
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "data/uploads")
    MAX_UPLOAD_SIZE_MB: int = 10

    # --- CORS ---
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000,http://127.0.0.1:8000")

    # --- OCR ---
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "tesseract")

    # --- OCR ---
    TESSERACT_CMD: str = os.getenv("TESSERACT_CMD", "tesseract")

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

def get_settings() -> Settings:
    return settings
