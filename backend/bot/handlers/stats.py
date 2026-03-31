"""/stats buyrug'i — shaxsiy statistika + gamification."""

import logging
from telegram import Update
from telegram.ext import ContextTypes
from sqlalchemy import select

from backend.database import async_session
from backend.models.user import User
from backend.services.analytics import analytics_service
from backend.services.gamification import gamification_service
from backend.bot.messages import STATS_MESSAGE, GAMIFICATION_STATS
from backend.config import settings

logger = logging.getLogger(__name__)


async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Foydalanuvchi /stats bosganda — statistika ko'rsatish."""
    user_tg_id = update.effective_user.id

    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == user_tg_id)
        )
        user = result.scalar_one_or_none()

        if not user:
            await update.message.reply_text("Avval ro'yxatdan o'ting: /start")
            return

        # Statistika
        student_stats = await analytics_service.get_student_stats(session, str(user.id))

        daily_limit = settings.PREMIUM_DAILY_LIMIT if user.is_premium else settings.FREE_DAILY_LIMIT
        weak = ", ".join(student_stats["weak_topics"]) if student_stats["weak_topics"] else "Hali aniqlanmadi"
        strong = ", ".join(student_stats["strong_topics"]) if student_stats["strong_topics"] else "Hali aniqlanmadi"

        stats_text = STATS_MESSAGE.format(
            total=student_stats["total_submissions"],
            avg_score=student_stats["avg_score"],
            strong_topics=strong,
            weak_topics=weak,
            today_count=user.daily_submissions_count,
            daily_limit=daily_limit,
        )

        # Gamification
        game_stats = await gamification_service.get_profile_stats(session, user)

        badges_list = ""
        for badge in game_stats["badges"]:
            badges_list += f"  {badge['emoji']} {badge['name']}\n"
        if not badges_list:
            badges_list = "  Hali nishon yo'q"

        game_text = GAMIFICATION_STATS.format(
            level_emoji=game_stats["level_emoji"],
            level_name=game_stats["level_name"],
            level=game_stats["level"],
            xp=game_stats["xp"],
            streak=game_stats["streak_days"],
            badges_count=len(game_stats["badges"]),
            badges_list=badges_list,
        )

        # XP progress
        if game_stats["xp_to_next"] > 0:
            game_text += f"\n⏭ Keyingi daraja uchun: {game_stats['xp_to_next']} XP kerak"

    full_text = stats_text + "\n\n" + game_text
    await update.message.reply_text(full_text, parse_mode="Markdown")
