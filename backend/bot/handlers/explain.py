"""O'quvchi 'Tushuntir' tugmasini bosganda — batafsil tushuntirish."""

import logging
from telegram import Update, CallbackQuery
from telegram.ext import ContextTypes
from sqlalchemy import select

from backend.database import async_session
from backend.models.submission import Submission
from backend.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)

gemini = GeminiService()


async def handle_explain_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Inline tugma bosilganda — masalani batafsil tushuntirish."""
    query: CallbackQuery = update.callback_query
    await query.answer()

    # callback_data: "explain_{submission_id}_{problem_number}"
    parts = query.data.split("_")
    if len(parts) != 3:
        return

    submission_id = parts[1]
    problem_number = int(parts[2])

    await query.edit_message_text(
        query.message.text + "\n\n⏳ _Tushuntirish tayyorlanmoqda..._",
        parse_mode="Markdown"
    )

    # Submission dan masala ma'lumotlarini olish
    async with async_session() as session:
        result = await session.execute(
            select(Submission).where(Submission.id == submission_id)
        )
        submission = result.scalar_one_or_none()

        if not submission or not submission.ai_result:
            await query.edit_message_text("❌ Ma'lumot topilmadi")
            return

        # Kerakli masalani topish
        problem_data = None
        for p in submission.ai_result.get("problems", []):
            if p.get("number") == problem_number:
                problem_data = p
                break

        if not problem_data:
            await query.edit_message_text("❌ Masala topilmadi")
            return

    # Gemini dan batafsil tushuntirish olish
    explanation = await gemini.explain_further(
        problem_data=problem_data,
        student_question=""
    )

    # Original xabar + tushuntirish
    original_text = query.message.text
    if "⏳ _Tushuntirish tayyorlanmoqda..._" in original_text:
        original_text = original_text.replace("⏳ _Tushuntirish tayyorlanmoqda..._", "")

    text = original_text + f"\n\n📖 *{problem_number}-masala tushuntirishi:*\n\n{explanation}"

    # Xabar uzunligini tekshirish (Telegram limiti 4096)
    if len(text) > 4000:
        text = text[:3950] + "\n\n_(davomi qisqartirildi)_"

    try:
        await query.edit_message_text(text, parse_mode="Markdown")
    except Exception:
        # Markdown xatosi bo'lsa, oddiy matn
        await query.edit_message_text(text)
