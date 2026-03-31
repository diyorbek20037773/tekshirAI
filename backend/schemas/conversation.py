"""Conversation uchun Pydantic sxemalar"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class ConversationMessage(BaseModel):
    role: str  # "student" yoki "ai"
    text: str


class ConversationResponse(BaseModel):
    id: uuid.UUID
    submission_id: uuid.UUID
    problem_number: int
    messages: list[ConversationMessage]
    message_count: int
    resolved: bool
    created_at: datetime

    class Config:
        from_attributes = True
