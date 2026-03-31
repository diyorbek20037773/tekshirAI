"""Ota-onaga Telegram orqali xabar yuborish."""

import logging
from typing import Dict, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.user import User

logger = logging.getLogger(__name__)


class NotificationService:
    """Ota-onaga farzand natijalarini yuborish."""

    def __init__(self, bot=None):
        self.bot = bot  # telegram bot instance (keyinroq set qilinadi)

    def set_bot(self, bot):
        """Bot instance ni o'rnatish (app ishga tushganda)."""
        self.bot = bot

    async def notify_parent(
        self,
        session: AsyncSession,
        parent_id: str,
        child_name: str,
        ai_result: Dict,
        subject: str
    ):
        """Ota-onaga farzand natijasini yuborish."""
        if not self.bot:
            logger.warning("Bot instance yo'q, notification yuborilmadi")
            return

        # Ota-onaning telegram_id sini olish
        result = await session.execute(
            select(User).where(User.id == parent_id)
        )
        parent = result.scalar_one_or_none()
        if not parent:
            return

        total = ai_result.get("total_problems", 0)
        correct = ai_result.get("correct_count", 0)
        score = ai_result.get("score_percentage", 0)

        # Holat emoji va xabari
        if score >= 90:
            status_emoji = "🏆"
            status_message = "Ajoyib natija! Farzandingiz yaxshi tayyorlanmoqda."
        elif score >= 70:
            status_emoji = "👍"
            status_message = "Yaxshi natija. Bir oz mashq qilish kerak."
        elif score >= 50:
            status_emoji = "💪"
            status_message = "O'rtacha natija. Ko'proq mashq tavsiya etiladi."
        else:
            status_emoji = "📚"
            status_message = "Natija past. Farzandingizga yordam bering."

        recommendation = ai_result.get("recommendation", "Mashq qilishni davom eting")

        text = f"""📊 *{child_name}ning natijasi:*

📚 Fan: {subject}
✅ To'g'ri: {correct}/{total}
📊 Ball: {score}%

{status_emoji} {status_message}

💡 *Tavsiya:* {recommendation}"""

        try:
            await self.bot.send_message(
                chat_id=parent.telegram_id,
                text=text,
                parse_mode="Markdown"
            )
            logger.info(f"Ota-onaga xabar yuborildi: {parent.telegram_id}")
        except Exception as e:
            logger.error(f"Ota-onaga xabar yuborishda xato: {e}")


notification_service = NotificationService()
