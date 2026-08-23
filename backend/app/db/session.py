"""
SQLAlchemy engine, session factory, and declarative Base.
Resilient with automatic SQLite fallback when remote PostgreSQL is unreachable.
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

logger = logging.getLogger("nyaya_saathi.db")

db_url = settings.DATABASE_URL
engine = None

if db_url and "postgresql" in db_url:
    try:
        test_engine = create_engine(
            db_url,
            echo=settings.DEBUG,
            pool_pre_ping=True,
            connect_args={"connect_timeout": 3}
        )
        with test_engine.connect() as conn:
            pass
        engine = test_engine
    except Exception as e:
        logger.warning("Remote PostgreSQL connection failed (%s). Falling back to local SQLite.", e)
        engine = None

if engine is None:
    sqlite_url = "sqlite:///./nyayasaathi.db"
    engine = create_engine(
        sqlite_url,
        echo=settings.DEBUG,
        connect_args={"check_same_thread": False},
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""
    pass
