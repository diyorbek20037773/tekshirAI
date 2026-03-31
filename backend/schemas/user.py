"""User uchun Pydantic sxemalar"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
import uuid


class UserCreate(BaseModel):
    telegram_id: int
    username: Optional[str] = None
    full_name: str
    role: str  # student, teacher, parent
    grade: Optional[int] = None
    subject: Optional[str] = None


class UserResponse(BaseModel):
    id: uuid.UUID
    telegram_id: int
    username: Optional[str]
    full_name: str
    role: str
    grade: Optional[int]
    subject: Optional[str]
    is_premium: bool
    daily_submissions_count: int
    created_at: datetime

    class Config:
        from_attributes = True


class GameProfileResponse(BaseModel):
    xp: int
    level: int
    streak_days: int
    streak_last_date: Optional[date]
    badges: Optional[list] = []
    total_correct: int
    total_submissions: int

    class Config:
        from_attributes = True


class UserWithGameResponse(UserResponse):
    game_profile: Optional[GameProfileResponse] = None
