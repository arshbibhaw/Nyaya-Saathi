"""Document model — generated legal documents."""

from sqlalchemy import Column, ForeignKey, Integer, String, Text, DateTime
from sqlalchemy.sql import func

from app.db import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(String, ForeignKey("cases.case_id"), nullable=False)
    doc_type = Column(String, nullable=False)  # complaint, notice, etc.
    content = Column(Text, nullable=True)
    file_path = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
