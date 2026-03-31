"""Submission uchun Pydantic sxemalar"""

from pydantic import BaseModel
from typing import Optional, Any
from datetime import datetime
import uuid


class SubmissionResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    subject: str
    grade: Optional[int]
    topic: Optional[str]
    ai_result: Optional[Any]
    score: Optional[float]
    total_problems: Optional[int]
    correct_count: Optional[int]
    incorrect_count: Optional[int]
    status: str
    processing_duration_ms: Optional[int]
    created_at: datetime

    class Config:
        from_attributes = True


class SubmissionListResponse(BaseModel):
    id: uuid.UUID
    student_id: uuid.UUID
    subject: str
    score: Optional[float]
    total_problems: Optional[int]
    correct_count: Optional[int]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
