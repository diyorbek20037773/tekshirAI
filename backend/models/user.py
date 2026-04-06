"""User modeli — o'quvchi, o'qituvchi, ota-ona"""

import uuid
from datetime import datetime, date
from sqlalchemy import String, BigInteger, Integer, Boolean, DateTime, Date, ForeignKey, CheckConstraint, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from backend.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    telegram_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    username: Mapped[str | None] = mapped_column(String(100))
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)  # student, teacher, parent, director, admin
    gender: Mapped[str | None] = mapped_column(String(10))  # male, female
    grade: Mapped[int | None] = mapped_column(Integer)  # 1-11 sinf
    class_letter: Mapped[str | None] = mapped_column(String(5))  # A, B, C, D, F
    subject: Mapped[str | None] = mapped_column(String(100))  # o'qituvchi fani
    viloyat: Mapped[str | None] = mapped_column(String(100))  # Surxondaryo viloyati
    tuman: Mapped[str | None] = mapped_column(String(100))  # Termiz Tumani
    maktab: Mapped[str | None] = mapped_column(String(200))  # 1-sonli umumta'lim maktabi

    # Premium
    is_premium: Mapped[bool] = mapped_column(Boolean, default=False)
    premium_expires_at: Mapped[datetime | None] = mapped_column(DateTime)

    # Kunlik limit
    daily_submissions_count: Mapped[int] = mapped_column(Integer, default=0)
    daily_reset_date: Mapped[date] = mapped_column(Date, default=date.today)

    # Tasdiqlash (direktor uchun admin tasdiqlaydi)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=True)

    # Ota-ona bog'lanishi
    parent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    pending_parent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))

    # Vaqt
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    submissions = relationship("Submission", back_populates="student", lazy="selectin")
    game_profile = relationship("UserGameProfile", back_populates="user", uselist=False, lazy="selectin")

    __table_args__ = (
        CheckConstraint("role IN ('student', 'teacher', 'parent', 'director', 'admin')", name="check_user_role"),
        CheckConstraint("grade IS NULL OR (grade >= 1 AND grade <= 11)", name="check_grade_range"),
    )


class UserGameProfile(Base):
    """Gamification profil — XP, level, streak, nishonlar"""
    __tablename__ = "user_game_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), unique=True)

    # XP va daraja
    xp: Mapped[int] = mapped_column(Integer, default=0)
    level: Mapped[int] = mapped_column(Integer, default=1)

    # Streak
    streak_days: Mapped[int] = mapped_column(Integer, default=0)
    streak_last_date: Mapped[date | None] = mapped_column(Date)
    streak_shield_used: Mapped[bool] = mapped_column(Boolean, default=False)  # oylik himoya

    # Nishonlar va yutuqlar (JSON array)
    badges: Mapped[list | None] = mapped_column(JSON, default=list)  # ["birinchi_qadam", "hafta_yulduzi", ...]
    total_correct: Mapped[int] = mapped_column(Integer, default=0)
    total_submissions: Mapped[int] = mapped_column(Integer, default=0)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationship
    user = relationship("User", back_populates="game_profile")
