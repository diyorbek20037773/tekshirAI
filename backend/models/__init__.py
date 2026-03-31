"""Barcha modellarni import qilish"""

from backend.models.user import User, UserGameProfile
from backend.models.submission import Submission
from backend.models.classroom import Classroom, ClassroomStudent
from backend.models.conversation import Conversation

__all__ = [
    "User",
    "UserGameProfile",
    "Submission",
    "Classroom",
    "ClassroomStudent",
    "Conversation",
]
