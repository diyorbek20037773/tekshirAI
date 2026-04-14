"""Submission modeli — uyga vazifa tekshiruvi"""

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Float, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from backend.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    classroom_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("classrooms.id"))
    assignment_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("assignments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    # Rasm
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    ocr_raw_text: Mapped[str | None] = mapped_column(Text)

    # Fan va sinf
    subject: Mapped[str] = mapped_column(String(100), default="matematika")
    grade: Mapped[int | None] = mapped_column(Integer)
    topic: Mapped[str | None] = mapped_column(String(200))

    # AI natijasi
    ai_result: Mapped[dict | None] = mapped_column(JSON)  # Gemini dan kelgan to'liq JSON
    score: Mapped[float | None] = mapped_column(Float)
    total_problems: Mapped[int | None] = mapped_column(Integer)
    correct_count: Mapped[int | None] = mapped_column(Integer)
    incorrect_count: Mapped[int | None] = mapped_column(Integer)

    # Holat
    status: Mapped[str] = mapped_column(String(20), default="pending")  # pending, completed, error
    error_message: Mapped[str | None] = mapped_column(Text)
    processing_duration_ms: Mapped[int | None] = mapped_column(Integer)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    student = relationship("User", back_populates="submissions")
    conversations = relationship("Conversation", back_populates="submission", lazy="selectin")
    assignment = relationship("Assignment", back_populates="submissions", lazy="selectin")
