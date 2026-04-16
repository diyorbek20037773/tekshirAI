"""Lesson modeli — interaktiv 3D darslar uchun fan, mavzu va qismlar"""

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from backend.database import Base


class LessonSubject(Base):
    __tablename__ = "lesson_subjects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name_uz: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str] = mapped_column(String(20), default="📚")
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    topics = relationship("LessonTopic", back_populates="subject", lazy="selectin", cascade="all, delete-orphan")


class LessonTopic(Base):
    __tablename__ = "lesson_topics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lesson_subjects.id", ondelete="CASCADE"), nullable=False)
    slug: Mapped[str] = mapped_column(String(80), nullable=False)
    title_uz: Mapped[str] = mapped_column(String(200), nullable=False)
    description_uz: Mapped[str] = mapped_column(Text, default="")
    icon: Mapped[str] = mapped_column(String(20), default="📦")
    model_file: Mapped[str] = mapped_column(String(200), nullable=False)  # /lesson-models/eye.glb
    initial_rotation: Mapped[str] = mapped_column(String(60), default="0,0,0")  # comma-separated x,y,z
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    subject = relationship("LessonSubject", back_populates="topics")
    parts = relationship("LessonPart", back_populates="topic", lazy="selectin", cascade="all, delete-orphan", order_by="LessonPart.mesh_index")


class LessonPart(Base):
    __tablename__ = "lesson_parts"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lesson_topics.id", ondelete="CASCADE"), nullable=False)
    mesh_index: Mapped[int] = mapped_column(Integer, nullable=False)
    label_uz: Mapped[str] = mapped_column(String(200), nullable=False)
    info_uz: Mapped[str] = mapped_column(Text, default="")
    color_hex: Mapped[str] = mapped_column(String(10), default="0x4488cc")

    topic = relationship("LessonTopic", back_populates="parts")
