"""/stats buyrug'i — shaxsiy statistika + gamification + kasb yo'nalishi."""

import logging
from collections import defaultdict
from telegram import Update
from telegram.ext import ContextTypes
from sqlalchemy import select, and_, desc

from backend.database import async_session
from backend.models.user import User
from backend.models.submission import Submission
from backend.services.analytics import analytics_service
from backend.services.gamification import gamification_service
from backend.services.gemini_service import GeminiService
from backend.bot.messages import STATS_MESSAGE, GAMIFICATION_STATS, CAREER_PREDICTION_MESSAGE, CAREER_NOT_READY_MESSAGE
from backend.config import settings

gemini_service = GeminiService()

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

    # === KASB YO'NALISHI ===
    try:
        # Submissionlarni olish
        subs_result = await session.execute(
            select(Submission)
            .where(and_(Submission.student_id == user.id, Submission.status == "completed"))
            .order_by(desc(Submission.created_at))
            .limit(100)
        )
        submissions = subs_result.scalars().all()

        if len(submissions) < 5:
            await update.message.reply_text(
                CAREER_NOT_READY_MESSAGE.format(current=len(submissions)),
                parse_mode="Markdown",
            )
            return

        # Fan bo'yicha o'rtacha ball
        subject_scores = defaultdict(list)
        all_weak, all_strong = [], []
        for sub in submissions:
            subj = sub.subject or "matematika"
            if sub.score is not None:
                subject_scores[subj].append(sub.score)
            ai = sub.ai_result
            if ai:
                all_weak.extend(ai.get("weak_topics", []))
                for p in ai.get("problems", []):
                    if p.get("score", 0) >= 1:
                        all_strong.append(p.get("problem_text", "")[:50])

        subjects_avg = {s: round(sum(sc) / len(sc), 1) for s, sc in subject_scores.items()}

        if len(subjects_avg) < 2:
            await update.message.reply_text(
                CAREER_NOT_READY_MESSAGE.format(current=len(submissions)),
                parse_mode="Markdown",
            )
            return

        weak_counts = defaultdict(int)
        for t in all_weak:
            weak_counts[t] += 1
        top_weak = [t for t, _ in sorted(weak_counts.items(), key=lambda x: -x[1])[:5]]

        strong_counts = defaultdict(int)
        for t in all_strong:
            strong_counts[t] += 1
        top_strong = [t for t, _ in sorted(strong_counts.items(), key=lambda x: -x[1])[:5]]

        prediction = await gemini_service.predict_career({
            "grade": user.grade or 7,
            "total_submissions": len(submissions),
            "subjects": subjects_avg,
            "weak_topics": top_weak,
            "strong_topics": top_strong,
        })

        if prediction.get("error") or not prediction.get("career_directions"):
            return

        # Formatlab chiqarish
        career_list = ""
        for c in prediction["career_directions"][:3]:
            career_list += f"{c.get('career_emoji', '📌')} *{c['career_name']}* — {c['match_score']}%\n"
            career_list += f"   _{c.get('reason', '')}_\n\n"

        career_text = CAREER_PREDICTION_MESSAGE.format(
            career_list=career_list.strip(),
            summary=prediction.get("overall_summary", ""),
            improvement=prediction.get("improvement_plan", ""),
            motivation=prediction.get("motivation", ""),
        )
        await update.message.reply_text(career_text, parse_mode="Markdown")

    except Exception as e:
        logger.error(f"Career prediction in stats error: {e}")
