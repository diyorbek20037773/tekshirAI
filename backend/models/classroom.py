"""Classroom modeli — sinflar va sinf o'quvchilari"""

import uuid
import string
import random
from datetime import datetime
from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from backend.database import Base


def generate_invite_code(length: int = 8) -> str:
    """Tasodifiy taklif kodi yaratish"""
    chars = string.ascii_uppercase + string.digits
    return "".join(random.choices(chars, k=length))


class Classroom(Base):
    __tablename__ = "classrooms"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    teacher_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(50), nullable=False)  # "5-A sinf"
    subject: Mapped[str] = mapped_column(String(100), nullable=False)  # "Matematika"
    invite_code: Mapped[str] = mapped_column(String(10), unique=True, default=generate_invite_code)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    teacher = relationship("User", lazy="selectin")
    students = relationship("ClassroomStudent", back_populates="classroom", lazy="selectin")


class ClassroomStudent(Base):
    __tablename__ = "classroom_students"

    classroom_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("classrooms.id", ondelete="CASCADE"), primary_key=True
    )
    student_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    classroom = relationship("Classroom", back_populates="students")
    student = relationship("User", lazy="selectin")
