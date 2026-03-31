"""Ro'yxatdan o'tish — ConversationHandler: ROL -> ISM -> SINF -> FAN."""

import logging
from datetime import date
from telegram import Update
from telegram.ext import (
    ContextTypes,
    ConversationHandler,
    CommandHandler,
    MessageHandler,
    filters,
)

from backend.database import async_session
from backend.models.user import User, UserGameProfile
from backend.bot.messages import (
    REGISTRATION_NAME,
    REGISTRATION_GRADE,
    REGISTRATION_SUBJECT,
    REGISTRATION_SUCCESS,
    REGISTRATION_TEACHER_SUCCESS,
    REGISTRATION_PARENT_SUCCESS,
)
from backend.bot.keyboards import (
    role_keyboard,
    grade_keyboard,
    subject_keyboard,
    main_menu_keyboard,
)

logger = logging.getLogger(__name__)

# Conversation states
ROLE, NAME, GRADE, SUBJECT = range(4)


async def role_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Rol tanlanganda."""
    text = update.message.text

    if "O'quvchi" in text:
        context.user_data["role"] = "student"
    elif "O'qituvchi" in text:
        context.user_data["role"] = "teacher"
    elif "Ota-ona" in text:
        context.user_data["role"] = "parent"
    else:
        await update.message.reply_text(
            "Iltimos, quyidagi tugmalardan birini tanlang:",
            reply_markup=role_keyboard(),
        )
        return ROLE

    await update.message.reply_text(REGISTRATION_NAME)
    return NAME


async def name_entered(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Ism kiritilganda."""
    name = update.message.text.strip()
    if len(name) < 2 or len(name) > 100:
        await update.message.reply_text("Iltimos, to'g'ri ism kiriting (2-100 belgi):")
        return NAME

    context.user_data["name"] = name
    role = context.user_data["role"]

    if role == "student":
        await update.message.reply_text(
            REGISTRATION_GRADE,
            reply_markup=grade_keyboard(),
        )
        return GRADE
    elif role == "teacher":
        await update.message.reply_text(
            REGISTRATION_SUBJECT,
            reply_markup=subject_keyboard(),
        )
        return SUBJECT
    else:
        # Ota-ona — to'g'ridan-to'g'ri saqlash
        return await _save_user(update, context)


async def grade_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Sinf tanlanganda."""
    text = update.message.text.strip()
    try:
        grade = int(text)
        if not 1 <= grade <= 11:
            raise ValueError
    except ValueError:
        await update.message.reply_text(
            "Iltimos, 1 dan 11 gacha sinf raqamini tanlang:",
            reply_markup=grade_keyboard(),
        )
        return GRADE

    context.user_data["grade"] = grade
    await update.message.reply_text(
        REGISTRATION_SUBJECT,
        reply_markup=subject_keyboard(),
    )
    return SUBJECT


async def subject_chosen(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Fan tanlanganda — ro'yxatdan o'tishni yakunlash."""
    text = update.message.text.strip()

    # Emoji ni olib tashlash
    subject_map = {
        "Matematika": "Matematika",
        "Fizika": "Fizika",
        "Kimyo": "Kimyo",
        "Biologiya": "Biologiya",
        "Informatika": "Informatika",
    }

    subject = None
    for key, value in subject_map.items():
        if key in text:
            subject = value
            break

    if not subject:
        subject = text  # Boshqa fan kiritilgan bo'lsa

    context.user_data["subject"] = subject
    return await _save_user(update, context)


async def _save_user(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Foydalanuvchini bazaga saqlash."""
    data = context.user_data
    tg_user = update.effective_user

    async with async_session() as session:
        user = User(
            telegram_id=tg_user.id,
            username=tg_user.username,
            full_name=data["name"],
            role=data["role"],
            grade=data.get("grade"),
            subject=data.get("subject"),
            daily_reset_date=date.today(),
        )
        session.add(user)
        await session.flush()

        # Gamification profil yaratish (o'quvchilar uchun)
        if data["role"] == "student":
            game_profile = UserGameProfile(user_id=user.id)
            session.add(game_profile)

        await session.commit()

    # Xabar yuborish
    role = data["role"]
    if role == "student":
        msg = REGISTRATION_SUCCESS.format(
            name=data["name"],
            grade=data.get("grade", "?"),
            subject=data.get("subject", "Matematika"),
        )
    elif role == "teacher":
        msg = REGISTRATION_TEACHER_SUCCESS.format(
            name=data["name"],
            subject=data.get("subject", "?"),
        )
    else:
        msg = REGISTRATION_PARENT_SUCCESS.format(name=data["name"])

    await update.message.reply_text(
        msg,
        parse_mode="Markdown",
        reply_markup=main_menu_keyboard(),
    )

    context.user_data.clear()
    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Ro'yxatdan o'tishni bekor qilish."""
    await update.message.reply_text("Bekor qilindi. Qayta boshlash: /start")
    context.user_data.clear()
    return ConversationHandler.END


def get_registration_handler() -> ConversationHandler:
    """Registration ConversationHandler yaratish."""
    return ConversationHandler(
        entry_points=[
            MessageHandler(
                filters.Regex(r"(O'quvchi|O'qituvchi|Ota-ona)"),
                role_chosen,
            ),
        ],
        states={
            ROLE: [
                MessageHandler(
                    filters.Regex(r"(O'quvchi|O'qituvchi|Ota-ona)"),
                    role_chosen,
                ),
            ],
            NAME: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, name_entered),
            ],
            GRADE: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, grade_chosen),
            ],
            SUBJECT: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, subject_chosen),
            ],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
    )
