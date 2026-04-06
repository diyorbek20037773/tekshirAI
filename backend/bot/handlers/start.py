"""/start buyrug'i — yangi user: rozilik + telefon raqam, mavjud user: to'g'ridan-to'g'ri mini app."""

import os
import logging

from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup,
    WebAppInfo, KeyboardButton, ReplyKeyboardMarkup, ReplyKeyboardRemove,
)
from telegram.ext import ContextTypes

from backend.database import async_session
from backend.models.user import User
from sqlalchemy import select

logger = logging.getLogger(__name__)


def _webapp_url():
    return os.getenv("WEBAPP_URL", "https://web-production-f1b9.up.railway.app")


def _mini_app_keyboard():
    return InlineKeyboardMarkup([
        [InlineKeyboardButton(
            text="🚀 Ilovani ochish",
            web_app=WebAppInfo(url=_webapp_url())
        )],
    ])


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Foydalanuvchi /start bosganda."""
    user = update.effective_user
    name = user.first_name or "do'stim"
    telegram_id = user.id

    # DB da foydalanuvchi bormi tekshirish
    try:
        async with async_session() as session:
            result = await session.execute(
                select(User).where(User.telegram_id == telegram_id).limit(1)
            )
            existing_user = result.scalars().first()
    except Exception as e:
        logger.error(f"DB tekshirishda xato: {e}")
        existing_user = None

    if existing_user:
        # MAVJUD user — to'g'ridan-to'g'ri mini app
        await update.message.reply_text(
            f"👋 Salom, *{name}*! Xush kelibsiz!\n\n"
            f"👇 Ilovani ochish uchun tugmani bosing:",
            parse_mode="Markdown",
            reply_markup=_mini_app_keyboard(),
        )
    else:
        # YANGI user — rozilik so'rash
        text = (
            f"Salom, {name}! 👋\n\n"
            f"🎓 *TekshirAI* — sun'iy intellekt asosida uyga vazifalarni tekshiruvchi\n\n"
            f"📸 Daftaringizni suratga oling\n"
            f"🤖 AI har bir masalani tekshiradi\n"
            f"📝 Xatolarni o'zbek tilida tushuntiradi\n\n"
            f"Davom etish uchun shaxsiy ma'lumotlaringizdan foydalanishga "
            f"rozilik bildiring.\n\n"
            f"_Ma'lumotlaringiz himoyalangan va faqat tizim ichida ishlatiladi._"
        )
        keyboard = InlineKeyboardMarkup([
            [InlineKeyboardButton("✅ Roziman", callback_data="consent_agree")],
        ])
        await update.message.reply_text(
            text,
            parse_mode="Markdown",
            reply_markup=keyboard,
        )


async def handle_consent(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Foydalanuvchi 'Roziman' bosganda — telefon raqam so'rash."""
    query = update.callback_query
    await query.answer()

    text = "📱 Telefon raqamingizni yuboring:"

    keyboard = ReplyKeyboardMarkup(
        [[KeyboardButton("📱 Telefon raqamni yuborish", request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True,
    )

    await query.message.reply_text(
        text,
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
    except Exception as e:
        logger.error(f"Telefon raqam saqlashda xato: {e}")

    # Telefon raqamni context da saqlash (keyingi register uchun)
    context.user_data["phone_number"] = phone

    name = user.first_name or "do'stim"

    await update.message.reply_text(
        "✅ Telefon raqamingiz qabul qilindi!",
        reply_markup=ReplyKeyboardRemove(),
    )

    await update.message.reply_text(
        f"🎓 *{name}, TekshirAI ga xush kelibsiz!*\n\n"
        f"📸 Daftaringizni suratga oling\n"
        f"🤖 AI har bir masalani tekshiradi\n"
        f"📝 Xatolarni o'zbek tilida tushuntiradi\n"
        f"🎮 XP, darajalar va nishonlar yig'ing!\n\n"
        f"👇 Boshlash uchun tugmani bosing:",
        parse_mode="Markdown",
        reply_markup=_mini_app_keyboard(),
    )
