"""/start buyrug'i — telefon raqam so'rash + Mini App tugmasi."""

import os
import logging

from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup,
    WebAppInfo, KeyboardButton, ReplyKeyboardMarkup, ReplyKeyboardRemove,
)
from telegram.ext import ContextTypes

from backend.config import settings
from backend.database import async_session
from backend.models.user import User
from sqlalchemy import select, update

logger = logging.getLogger(__name__)


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Foydalanuvchi /start bosganda — telefon raqam so'rash."""
    user = update.effective_user
    name = user.first_name or "do'stim"

    text = (
        f"Salom, {name}! 👋\n\n"
        f"🎓 *TekshirAI* — sun'iy intellekt asosida uyga vazifalarni tekshiruvchi\n\n"
        f"📱 Davom etish uchun telefon raqamingizni yuboring.\n"
        f"Shaxsiy ma'lumotlaringiz himoyalangan va faqat tizim ichida ishlatiladi."
    )

    keyboard = ReplyKeyboardMarkup(
        [[KeyboardButton("📱 Telefon raqamni yuborish", request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )

    await update.message.reply_text(
        text,
        parse_mode="Markdown",
        reply_markup=keyboard,
    )


async def handle_contact(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Foydalanuvchi telefon raqam yuborganda — raqamni saqlash va Mini App tugmasini ko'rsatish."""
    contact = update.message.contact
    if not contact:
        return

    user = update.effective_user
    phone = contact.phone_number
    telegram_id = user.id

    # Telefon raqamni bazaga saqlash (agar user mavjud bo'lsa)
    try:
        async with async_session() as session:
            result = await session.execute(
                select(User).where(User.telegram_id == telegram_id)
            )
            users = result.scalars().all()
            for u in users:
                u.phone_number = phone
            await session.commit()
            if users:
                logger.info(f"Telefon raqam saqlandi: {telegram_id} -> {phone}")
    except Exception as e:
        logger.error(f"Telefon raqam saqlashda xato: {e}")

    # Telefon raqamni context da saqlash (keyingi register uchun)
    context.user_data["phone_number"] = phone

    webapp_url = os.getenv("WEBAPP_URL", "https://web-production-f1b9.up.railway.app")

    text = (
        f"✅ Rahmat! Telefon raqamingiz qabul qilindi.\n\n"
        f"📸 Daftaringizni suratga oling\n"
        f"🤖 AI har bir masalani tekshiradi\n"
        f"📝 Xatolarni o'zbek tilida tushuntiradi\n"
        f"🎮 XP, darajalar, nishonlar bilan o'rganish qiziqarli!\n\n"
        f"⬇️ Boshlash uchun ilovani oching:"
    )

    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton(
            text="📱 Ilovani ochish",
            web_app=WebAppInfo(url=webapp_url)
        )],
    ])

    await update.message.reply_text(
        text,
        parse_mode="Markdown",
        reply_markup=ReplyKeyboardRemove(),
    )

    await update.message.reply_text(
        "⬇️ Ilovani ochish uchun quyidagi tugmani bosing:",
        reply_markup=keyboard,
    )
