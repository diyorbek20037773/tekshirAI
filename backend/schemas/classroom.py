"""Classroom uchun Pydantic sxemalar"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class ClassroomCreate(BaseModel):
    name: str
    subject: str


class ClassroomResponse(BaseModel):
    id: uuid.UUID
    teacher_id: uuid.UUID
    name: str
    subject: str
    invite_code: str
    created_at: datetime

    class Config:
        from_attributes = True


class ClassroomWithStats(ClassroomResponse):
    student_count: int = 0
    avg_score: Optional[float] = None
    today_submissions: int = 0
