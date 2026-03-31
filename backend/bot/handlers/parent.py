"""Ota-ona handlerlari — farzandni bog'lash, hisobot."""

import logging
from telegram import Update
from telegram.ext import ContextTypes
from sqlalchemy import select, and_

from backend.database import async_session
from backend.models.user import User

logger = logging.getLogger(__name__)


async def connect_child(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """
    /connect buyrug'i — farzandni bog'lash.
    Foydalanish: /connect <farzand_telegram_id>
    """
    user_tg_id = update.effective_user.id

    # Ota-onani tekshirish
    async with async_session() as session:
        result = await session.execute(
            select(User).where(User.telegram_id == user_tg_id)
        )
        parent = result.scalar_one_or_none()

        if not parent or parent.role != "parent":
            await update.message.reply_text(
                "Bu buyruq faqat ota-onalar uchun. Avval ota-ona sifatida ro'yxatdan o'ting."
            )
            return

        # Farzand ID ni olish
        args = context.args
        if not args:
            await update.message.reply_text(
                "Foydalanish: /connect <farzandingizning Telegram ID raqami>\n\n"
                "Farzandingizdan Telegram ID ni so'rang (bot ga /myid yuboring)."
            )
            return

        try:
            child_tg_id = int(args[0])
        except ValueError:
            await update.message.reply_text("Noto'g'ri ID raqam. Faqat raqam kiriting.")
            return

        # Farzandni topish
        child_result = await session.execute(
            select(User).where(
                and_(User.telegram_id == child_tg_id, User.role == "student")
            )
        )
        child = child_result.scalar_one_or_none()

        if not child:
            await update.message.reply_text(
                "Bu ID bilan o'quvchi topilmadi. "
                "Farzandingiz avval botda ro'yxatdan o'tishi kerak."
            )
            return

        # Bog'lash
        child.parent_id = parent.id
        await session.commit()

        await update.message.reply_text(
            f"✅ {child.full_name} farzandingiz sifatida bog'landi!\n\n"
            f"Endi har tekshiruvdan keyin natijalarni avtomatik olasiz."
        )


async def myid_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """/myid buyrug'i — foydalanuvchi Telegram ID sini ko'rsatish."""
    await update.message.reply_text(
        f"Sizning Telegram ID: `{update.effective_user.id}`\n\n"
        f"Bu raqamni ota-onangizga yuboring.",
        parse_mode="Markdown",
    )
