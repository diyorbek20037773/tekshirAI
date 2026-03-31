"""
ASOSIY HANDLER — o'quvchi rasm yuborganida ishlaydi.
Pipeline: Rasm -> Preprocessing -> Gemini -> Natija -> Gamification -> Notification
"""

import time
import logging
from datetime import date
from sqlalchemy import select

from telegram import Update
from telegram.ext import ContextTypes

from backend.database import async_session
from backend.models.user import User
from backend.models.submission import Submission
from backend.services.gemini_service import GeminiService
from backend.services.image_processor import ImageProcessor
from backend.services.gamification import gamification_service
from backend.services.notification import notification_service
from backend.bot.messages import (
    SUBMIT_PROCESSING,
    SUBMIT_OCR_FAIL,
    SUBMIT_DAILY_LIMIT,
    XP_EARNED_MESSAGE,
    LEVEL_UP_MESSAGE,
    NEW_BADGE_MESSAGE,
    STREAK_MESSAGE,
    ERROR_NOT_REGISTERED,
    ERROR_IMAGE_TOO_LARGE,
)
from backend.bot.keyboards import explain_keyboard
from backend.config import settings

logger = logging.getLogger(__name__)

gemini = GeminiService()
image_processor = ImageProcessor()


async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """O'quvchi rasm yuborganida — butun pipeline ishlaydi."""

    user_tg_id = update.effective_user.id

    # 1. Foydalanuvchini tekshirish
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == user_tg_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            await update.message.reply_text(ERROR_NOT_REGISTERED)
            return

        # Kunlik limitni reset qilish (yangi kun)
        if user.daily_reset_date != date.today():
            user.daily_submissions_count = 0
            user.daily_reset_date = date.today()
            await session.commit()

        # 2. Kunlik limit tekshirish
        daily_limit = settings.PREMIUM_DAILY_LIMIT if user.is_premium else settings.FREE_DAILY_LIMIT
        if user.daily_submissions_count >= daily_limit:
            await update.message.reply_text(
                SUBMIT_DAILY_LIMIT.format(limit=daily_limit),
                parse_mode="Markdown"
            )
            return

    # 3. "Tekshirilmoqda..." xabari
    processing_msg = await update.message.reply_text(SUBMIT_PROCESSING)
    start_time = time.time()

    try:
        # 4. Rasmni yuklab olish
        photo = update.message.photo[-1]  # eng katta razmer

        if photo.file_size and photo.file_size > settings.MAX_IMAGE_SIZE_MB * 1024 * 1024:
            await processing_msg.edit_text(ERROR_IMAGE_TOO_LARGE)
            return

        file = await context.bot.get_file(photo.file_id)
        image_bytes = await file.download_as_bytearray()

        # 5. Image Preprocessing
        try:
            processed_image = image_processor.process(bytes(image_bytes))
            mime_type = "image/png"
        except Exception:
            processed_image = bytes(image_bytes)
            mime_type = "image/jpeg"
            logger.warning("Preprocessing xato, original rasm ishlatilmoqda")

        # 6. GEMINI — OCR + Tekshiruv + Tushuntirish (BITTA CHAQIRUV)
        async with async_session() as session:
            result = await session.execute(
                select(User).where(User.telegram_id == user_tg_id)
            )
            user = result.scalar_one_or_none()

            ai_result = await gemini.check_homework(
                image_bytes=processed_image,
                subject=user.subject or "matematika",
                grade=user.grade or 7,
                topic="",
                mime_type=mime_type
            )

            # 7. OCR xatosi tekshirish
            if ai_result.get("ocr_error"):
                await processing_msg.edit_text(SUBMIT_OCR_FAIL, parse_mode="Markdown")
                return

            if ai_result.get("error"):
                await processing_msg.edit_text(
                    f"❌ {ai_result.get('error_message', 'Xatolik yuz berdi')}"
                )
                return

            # 8. DB ga saqlash
            processing_time = int((time.time() - start_time) * 1000)
            score_pct = ai_result.get("score_percentage", 0)
            total_problems = ai_result.get("total_problems", 0)
            correct_count = ai_result.get("correct_count", 0)
            incorrect_count = ai_result.get("incorrect_count", 0)

            submission = Submission(
                student_id=user.id,
                image_url=photo.file_id,
                ocr_raw_text=ai_result.get("ocr_text", ""),
                subject=user.subject or "matematika",
                grade=user.grade,
                ai_result=ai_result,
                score=score_pct,
                total_problems=total_problems,
                correct_count=correct_count,
                incorrect_count=incorrect_count,
                status="completed",
                processing_duration_ms=processing_time,
            )
            session.add(submission)
            user.daily_submissions_count += 1
            await session.flush()

            submission_id = str(submission.id)

            # 9. Gamification yangilash
            game_result = await gamification_service.process_submission(
                session=session,
                user=user,
                score_percentage=score_pct,
                correct_count=correct_count,
                total_problems=total_problems,
            )
            await session.commit()

        # 10. Natijani foydalanuvchiga yuborish
        result_text = _format_result(ai_result, processing_time)

        # Gamification xabari
        game_text = _format_gamification(game_result)
        result_text += game_text

        keyboard = explain_keyboard(ai_result, submission_id)

        await processing_msg.edit_text(
            result_text,
            parse_mode="Markdown",
            reply_markup=keyboard,
        )

        # 11. Ota-onaga notification
        if user.parent_id:
            async with async_session() as session:
                await notification_service.notify_parent(
                    session=session,
                    parent_id=str(user.parent_id),
                    child_name=user.full_name,
                    ai_result=ai_result,
                    subject=user.subject or "matematika",
                )

        logger.info(
            f"Tekshiruv yakunlandi: {processing_time}ms, "
            f"ball: {score_pct}%, masalalar: {total_problems}"
        )

    except Exception as e:
        logger.error(f"Pipeline xatosi: {str(e)}", exc_info=True)
        await processing_msg.edit_text(
            "❌ Xatolik yuz berdi. Iltimos qayta urinib ko'ring.\n\n"
            "Agar muammo davom etsa, /help buyrug'ini yuboring."
        )


def _format_result(ai_result: dict, processing_ms: int) -> str:
    """AI natijasini chiroyli Telegram xabar formatiga o'girish."""
    total = ai_result.get("total_problems", 0)
    correct = ai_result.get("correct_count", 0)
    incorrect = ai_result.get("incorrect_count", 0)
    score = ai_result.get("score_percentage", 0)

    # Emoji tanlash
    if score >= 90:
        emoji = "🏆"
        status = "Ajoyib!"
    elif score >= 70:
        emoji = "👍"
        status = "Yaxshi!"
    elif score >= 50:
        emoji = "💪"
        status = "O'rtacha, mashq qiling"
    else:
        emoji = "📚"
        status = "Ko'proq mashq kerak"

    text = f"""{emoji} *Natija: {status}*

✅ To'g'ri: {correct}/{total}
❌ Xato: {incorrect}/{total}
📊 Ball: {score}%
⏱ Vaqt: {processing_ms / 1000:.1f} sek

"""

    # Har bir masala
    for p in ai_result.get("problems", []):
        if p.get("is_correct"):
            text += f"✅ *{p['number']}-masala:* To'g'ri!\n"
        else:
            text += f"❌ *{p['number']}-masala:* Xato\n"
            if p.get("error_explanation"):
                text += f"   💡 _{p['error_explanation']}_\n"
            if p.get("correct_answer"):
                text += f"   ✏️ To'g'ri javob: `{p['correct_answer']}`\n"
        text += "\n"

    rec = ai_result.get("recommendation", "")
    if rec:
        text += f"📌 *Tavsiya:* {rec}\n\n"

    text += "💡 _Tushunmagan masala bormi? Quyidagi tugmani bosing_"

    return text


def _format_gamification(game_result: dict) -> str:
    """Gamification natijasini formatlash."""
    text = XP_EARNED_MESSAGE.format(
        xp=game_result["xp_earned"],
        level_up="",
        new_badges="",
        streak_info="",
    )

    # Level up
    level_up = ""
    if game_result.get("new_level"):
        from backend.services.gamification import LEVELS
        level_info = next(
            (l for l in LEVELS if l["level"] == game_result.get("old_level", 0) + 1),
            LEVELS[0]
        )
        level_up = LEVEL_UP_MESSAGE.format(
            level_emoji=level_info["emoji"],
            level_name=level_info["name"],
        )

    # Yangi nishonlar
    badges_text = ""
    for badge in game_result.get("new_badges", []):
        badges_text += NEW_BADGE_MESSAGE.format(
            emoji=badge["emoji"],
            name=badge["name"],
        )

    # Streak
    streak_info = STREAK_MESSAGE.format(streak=game_result["streak"])

    text = XP_EARNED_MESSAGE.format(
        xp=game_result["xp_earned"],
        level_up=level_up,
        new_badges=badges_text,
        streak_info=streak_info,
    )

    return text
