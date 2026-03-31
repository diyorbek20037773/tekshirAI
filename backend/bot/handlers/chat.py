"""
AI SUHBAT handler — o'quvchi masala haqida AI bilan dialog yuritadi.
O'quvchi tushunguncha davom etadi.
"""

import logging
from telegram import Update, CallbackQuery
from telegram.ext import ContextTypes
from sqlalchemy import select, and_

from backend.database import async_session
from backend.models.user import User
from backend.models.submission import Submission
from backend.models.conversation import Conversation
from backend.services.gemini_service import GeminiService
from backend.services.gamification import gamification_service
from backend.bot.messages import CHAT_START, CHAT_LIMIT_REACHED, CHAT_RESOLVED
from backend.bot.keyboards import chat_problem_keyboard, chat_options_keyboard
from backend.config import settings

logger = logging.getLogger(__name__)

gemini = GeminiService()


async def handle_chat_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """'AI bilan suhbatlashish' tugmasi bosilganda — masala tanlash."""
    query: CallbackQuery = update.callback_query
    await query.answer()

    # callback_data: "chat_start_{submission_id}"
    parts = query.data.split("_")
    submission_id = parts[2]

    async with async_session() as session:
        result = await session.execute(
            select(Submission).where(Submission.id == submission_id)
        )
        submission = result.scalar_one_or_none()
        if not submission or not submission.ai_result:
            await query.edit_message_text("❌ Ma'lumot topilmadi")
            return

    keyboard = chat_problem_keyboard(submission.ai_result, submission_id)
    await query.message.reply_text(
        "Qaysi masala haqida suhbatlashmoqchisiz?",
        reply_markup=keyboard,
    )


async def handle_chat_problem_selected(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Suhbat uchun masala tanlanganda."""
    query: CallbackQuery = update.callback_query
    await query.answer()

    # callback_data: "chat_problem_{submission_id}_{problem_number}"
    parts = query.data.split("_")
    submission_id = parts[2]
    problem_number = int(parts[3])

    # Suhbat sessiyasini yaratish
    user_tg_id = update.effective_user.id

    async with async_session() as session:
        user_result = await session.execute(
            select(User).where(User.telegram_id == user_tg_id)
        )
        user = user_result.scalar_one_or_none()
        if not user:
            return

        # Yangi conversation yaratish
        conversation = Conversation(
            submission_id=submission_id,
            student_id=user.id,
            problem_number=problem_number,
            messages=[],
        )
        session.add(conversation)
        await session.commit()

        # Context ga saqlash
        context.user_data["active_conversation_id"] = str(conversation.id)
        context.user_data["active_submission_id"] = submission_id
        context.user_data["active_problem_number"] = problem_number

    await query.edit_message_text(
        CHAT_START.format(problem_number=problem_number),
        parse_mode="Markdown",
        reply_markup=chat_options_keyboard(),
    )


async def handle_chat_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """O'quvchi suhbatda xabar yuborganida."""
    conversation_id = context.user_data.get("active_conversation_id")
    if not conversation_id:
        return False  # Bu handler uchun emas

    message = update.message.text
    if not message:
        return False

    # /tushundim buyrug'i
    if message.strip().lower() in ["/tushundim", "tushundim"]:
        return await _resolve_conversation(update, context)

    user_tg_id = update.effective_user.id

    async with async_session() as session:
        # User olish
        user_result = await session.execute(
            select(User).where(User.telegram_id == user_tg_id)
        )
        user = user_result.scalar_one_or_none()
        if not user:
            return True

        # Conversation olish
        conv_result = await session.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        conversation = conv_result.scalar_one_or_none()
        if not conversation:
            context.user_data.pop("active_conversation_id", None)
            return True

        # Limit tekshirish
        chat_limit = settings.PREMIUM_CHAT_LIMIT if user.is_premium else settings.FREE_CHAT_LIMIT
        if conversation.message_count >= chat_limit:
            await update.message.reply_text(
                CHAT_LIMIT_REACHED.format(limit=chat_limit),
                parse_mode="Markdown",
            )
            context.user_data.pop("active_conversation_id", None)
            return True

        # Submission dan masala ma'lumotlarini olish
        sub_result = await session.execute(
            select(Submission).where(Submission.id == conversation.submission_id)
        )
        submission = sub_result.scalar_one_or_none()
        if not submission:
            return True

        problem_data = None
        for p in submission.ai_result.get("problems", []):
            if p.get("number") == conversation.problem_number:
                problem_data = p
                break

        if not problem_data:
            await update.message.reply_text("❌ Masala ma'lumotlari topilmadi")
            return True

        # Gemini ga yuborish
        processing_msg = await update.message.reply_text("⏳ Javob tayyorlanmoqda...")

        ai_response = await gemini.chat_about_problem(
            problem_data=problem_data,
            conversation_history=conversation.messages or [],
            student_message=message,
            grade=user.grade or 7,
            subject=user.subject or "matematika",
        )

        # Suhbatni yangilash
        messages = conversation.messages or []
        messages.append({"role": "student", "text": message})
        messages.append({"role": "ai", "text": ai_response})
        conversation.messages = messages
        conversation.message_count += 1

        # XP berish
        await gamification_service.process_chat(session, user)

        await session.commit()

        # Javobni yuborish
        if len(ai_response) > 4000:
            ai_response = ai_response[:3950] + "\n\n_(davomi qisqartirildi)_"

        try:
            await processing_msg.edit_text(
                ai_response,
                parse_mode="Markdown",
                reply_markup=chat_options_keyboard(),
            )
        except Exception:
            await processing_msg.edit_text(
                ai_response,
                reply_markup=chat_options_keyboard(),
            )

    return True


async def handle_chat_quick_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Tezkor tugmalar: Nega?, Boshqa usul, O'xshash masala, Hayotiy misol."""
    query: CallbackQuery = update.callback_query
    await query.answer()

    quick_messages = {
        "chat_quick_nega": "Nega bunday bo'ladi? Batafsil tushuntir.",
        "chat_quick_boshqa": "Boshqa usulda yechib ko'rsat.",
        "chat_quick_oxshash": "Shunga o'xshash yangi masala ber.",
        "chat_quick_hayotiy": "Hayotiy misol bilan tushuntir.",
    }

    message = quick_messages.get(query.data)
    if not message:
        return

    conversation_id = context.user_data.get("active_conversation_id")
    if not conversation_id:
        await query.edit_message_text("Suhbat sessiyasi topilmadi. Qayta boshlang.")
        return

    user_tg_id = update.effective_user.id

    async with async_session() as session:
        user_result = await session.execute(
            select(User).where(User.telegram_id == user_tg_id)
        )
        user = user_result.scalar_one_or_none()

        conv_result = await session.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        conversation = conv_result.scalar_one_or_none()

        if not user or not conversation:
            return

        # Limit tekshirish
        chat_limit = settings.PREMIUM_CHAT_LIMIT if user.is_premium else settings.FREE_CHAT_LIMIT
        if conversation.message_count >= chat_limit:
            await query.edit_message_text(
                CHAT_LIMIT_REACHED.format(limit=chat_limit),
                parse_mode="Markdown",
            )
            context.user_data.pop("active_conversation_id", None)
            return

        # Masala ma'lumotlari
        sub_result = await session.execute(
            select(Submission).where(Submission.id == conversation.submission_id)
        )
        submission = sub_result.scalar_one_or_none()
        problem_data = None
        if submission:
            for p in submission.ai_result.get("problems", []):
                if p.get("number") == conversation.problem_number:
                    problem_data = p
                    break

        if not problem_data:
            return

        await query.edit_message_text("⏳ Javob tayyorlanmoqda...")

        ai_response = await gemini.chat_about_problem(
            problem_data=problem_data,
            conversation_history=conversation.messages or [],
            student_message=message,
            grade=user.grade or 7,
            subject=user.subject or "matematika",
        )

        # Suhbatni yangilash
        messages = conversation.messages or []
        messages.append({"role": "student", "text": message})
        messages.append({"role": "ai", "text": ai_response})
        conversation.messages = messages
        conversation.message_count += 1

        await gamification_service.process_chat(session, user)
        await session.commit()

    if len(ai_response) > 4000:
        ai_response = ai_response[:3950] + "\n\n_(davomi qisqartirildi)_"

    try:
        await query.edit_message_text(
            ai_response,
            parse_mode="Markdown",
            reply_markup=chat_options_keyboard(),
        )
    except Exception:
        await query.edit_message_text(
            ai_response,
            reply_markup=chat_options_keyboard(),
        )


async def handle_chat_resolved(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """O'quvchi 'Tushundim!' tugmasini bosganda."""
    query: CallbackQuery = update.callback_query
    await query.answer()

    return await _resolve_conversation_from_callback(query, context)


async def _resolve_conversation(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Suhbatni yakunlash."""
    conversation_id = context.user_data.pop("active_conversation_id", None)
    if conversation_id:
        async with async_session() as session:
            conv_result = await session.execute(
                select(Conversation).where(Conversation.id == conversation_id)
            )
            conversation = conv_result.scalar_one_or_none()
            if conversation:
                conversation.resolved = True
                await session.commit()

    await update.message.reply_text(CHAT_RESOLVED, parse_mode="Markdown")
    return True


async def _resolve_conversation_from_callback(query: CallbackQuery, context: ContextTypes.DEFAULT_TYPE):
    """Suhbatni callback orqali yakunlash."""
    conversation_id = context.user_data.pop("active_conversation_id", None)
    if conversation_id:
        async with async_session() as session:
            conv_result = await session.execute(
                select(Conversation).where(Conversation.id == conversation_id)
            )
            conversation = conv_result.scalar_one_or_none()
            if conversation:
                conversation.resolved = True
                await session.commit()

    await query.edit_message_text(CHAT_RESOLVED, parse_mode="Markdown")
