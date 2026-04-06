"""AI Chat API — o'quvchi masala haqida AI bilan suhbatlashadi."""

import logging
from pydantic import BaseModel
from typing import List, Optional
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User
from backend.models.submission import Submission
from backend.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/chat", tags=["chat"])

gemini = GeminiService()


class ChatMessage(BaseModel):
    role: str  # "student" yoki "ai"
    text: str


class ChatRequest(BaseModel):
    telegram_id: int
    submission_id: Optional[str] = None
    problem_number: Optional[int] = None
    message: str
    history: List[ChatMessage] = []
    topic: Optional[str] = None  # Umumiy mavzu haqida savol


@router.post("/message")
async def chat_message(req: ChatRequest, db: AsyncSession = Depends(get_db)):
    """O'quvchi AI bilan suhbatlashadi — masala yoki mavzu haqida."""

    # User olish
    result = await db.execute(select(User).where(User.telegram_id == req.telegram_id).limit(1))
    user = result.scalars().first()
    grade = user.grade if user else 7
    subject = user.subject if user else "matematika"

    # Masala ma'lumotlarini olish (agar submission_id berilgan bo'lsa)
    problem_data = {}
    if req.submission_id:
        sub_result = await db.execute(
            select(Submission).where(Submission.id == req.submission_id)
        )
        submission = sub_result.scalar_one_or_none()
        if submission and submission.ai_result:
            for p in submission.ai_result.get("problems", []):
                if p.get("number") == req.problem_number:
                    problem_data = p
                    break

    # Conversation history
    history = [{"role": m.role, "text": m.text} for m in req.history]

    try:
        if problem_data:
            # Masala haqida suhbat
            reply = await gemini.chat_about_problem(
                problem_data=problem_data,
                conversation_history=history,
                student_message=req.message,
                grade=grade,
                subject=subject,
            )
        else:
            # Umumiy mavzu haqida suhbat (masalasiz)
            reply = await gemini.chat_about_topic(
                topic=req.topic or req.message,
                conversation_history=history,
                student_message=req.message,
                grade=grade,
                subject=subject,
            )

        # Tezkor tugmalar taklifi
        suggestions = _get_suggestions(req.message, problem_data)

        return {
            "reply": reply,
            "suggestions": suggestions,
        }

    except Exception as e:
        logger.error(f"Chat xatosi: {e}")
        return JSONResponse(
            status_code=500,
            content={"reply": "Javob olishda xatolik. Qayta urinib ko'ring.", "suggestions": []}
        )


def _get_suggestions(message: str, problem_data: dict) -> list:
    """Keyingi savol uchun tezkor tugmalar."""
    base = [
        "Boshqa usulda tushuntir",
        "Hayotiy misol ber",
        "Shunga o'xshash masala ber",
    ]
    if problem_data:
        base.insert(0, "Nega bunday?")
    return base[:4]
