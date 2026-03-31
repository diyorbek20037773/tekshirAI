"""Conversation modeli — o'quvchi va AI o'rtasidagi suhbat"""

import uuid
from datetime import datetime
from sqlalchemy import Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from backend.database import Base


class Conversation(Base):
    """AI suhbat sessiyasi — submission dagi masala haqida dialog"""
    __tablename__ = "conversations"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("submissions.id"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    problem_number: Mapped[int] = mapped_column(Integer, nullable=False)

    # Xabarlar tarixi: [{"role": "student", "text": "..."}, {"role": "ai", "text": "..."}]
    messages: Mapped[list] = mapped_column(JSON, default=list)
    message_count: Mapped[int] = mapped_column(Integer, default=0)
    resolved: Mapped[bool] = mapped_column(Boolean, default=False)  # o'quvchi "tushundim" desa

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    submission = relationship("Submission", back_populates="conversations")
    student = relationship("User", lazy="selectin")
