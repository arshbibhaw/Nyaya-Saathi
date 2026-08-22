"""Evidence model — uploaded files and extracted text."""

from sqlalchemy import Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.db import Base


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.case_id"), nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=True)  # pdf, image, etc.
    extracted_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
