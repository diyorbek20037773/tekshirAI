"""Telegram bot — Application yaratish va handlerlarni register qilish."""

import logging
from telegram.request import HTTPXRequest
from telegram.ext import (
    Application,
    CommandHandler,
    MessageHandler,
    CallbackQueryHandler,
    filters,
)

from backend.config import settings
from backend.bot.handlers.start import start_command, handle_contact, handle_consent
from backend.bot.handlers.register import get_registration_handler
from backend.bot.handlers.submit import handle_photo
from backend.bot.handlers.explain import handle_explain_callback
from backend.bot.handlers.chat import (
    handle_chat_start,
    handle_chat_problem_selected,
    handle_chat_message,
    handle_chat_quick_button,
    handle_chat_resolved,
)
from backend.bot.handlers.stats import stats_command
from backend.bot.handlers.parent import connect_child, myid_command
from backend.services.notification import notification_service

logger = logging.getLogger(__name__)


def create_bot() -> Application:
    """Bot application yaratish va barcha handlerlarni qo'shish."""
    # Tarmoq timeout'larini oshirish — Railway ↔ Telegram aloqasi turg'un emas
    request = HTTPXRequest(
        connection_pool_size=8,
        read_timeout=60,
        write_timeout=60,
        connect_timeout=30,
        pool_timeout=10,
    )
    app = (
        Application.builder()
        .token(settings.TELEGRAM_BOT_TOKEN)
        .request(request)
        .get_updates_request(request)
        .build()
    )

    # Notification service ga bot ni set qilish
    notification_service.set_bot(app.bot)

    # === Command handlers ===
    app.add_handler(CommandHandler("start", start_command))
    app.add_handler(CommandHandler("stats", stats_command))
    app.add_handler(CommandHandler("connect", connect_child))
    app.add_handler(CommandHandler("myid", myid_command))

    # === Registration (ConversationHandler) ===
    app.add_handler(get_registration_handler())

    # === Contact handler (telefon raqam) ===
    app.add_handler(MessageHandler(filters.CONTACT, handle_contact))

    # === Photo handler (asosiy — rasm tekshirish) ===
    app.add_handler(MessageHandler(filters.PHOTO, handle_photo))

    # === Callback Query handlers ===
    # Rozilik (consent)
    app.add_handler(CallbackQueryHandler(handle_consent, pattern=r"^consent_agree$"))

    # Tushuntirish
    app.add_handler(CallbackQueryHandler(handle_explain_callback, pattern=r"^explain_"))

    # AI suhbat
    app.add_handler(CallbackQueryHandler(handle_chat_start, pattern=r"^chat_start_"))
    app.add_handler(CallbackQueryHandler(handle_chat_problem_selected, pattern=r"^chat_problem_"))
    app.add_handler(CallbackQueryHandler(handle_chat_quick_button, pattern=r"^chat_quick_"))
    app.add_handler(CallbackQueryHandler(handle_chat_resolved, pattern=r"^chat_resolved$"))

    # === Matnli xabar handler (suhbat uchun) ===
    # Bu handler eng oxirida — suhbat faol bo'lsa, xabarni oladi
    app.add_handler(MessageHandler(
        filters.TEXT & ~filters.COMMAND,
        _handle_text_message,
    ))

    # Global error handler — tarmoq xatolari botni o'chirib qo'ymasin
    app.add_error_handler(_global_error_handler)

    logger.info("Bot handlerlar ro'yxatdan o'tdi")
    return app


async def _global_error_handler(update, context):
    """Bot xatolarini logga yozish — crash bo'lmasin."""
    err = context.error
    err_str = str(err)
    # Tarmoq timeout'lari — kutilgan, ovoz ko'tarmasin
    if "TimedOut" in err_str or "timeout" in err_str.lower() or "ReadTimeout" in err_str:
        logger.warning(f"Telegram tarmoq timeout (qayta urinilyapti): {err_str[:100]}")
        return
    # Conflict — boshqa bot instance ishlayapti
    if "Conflict" in err_str:
        logger.warning(f"Bot conflict (boshqa instance?): {err_str[:100]}")
        return
    logger.error(f"Bot xatosi: {err}", exc_info=err)


async def _handle_text_message(update, context):
    """Matnli xabar — agar suhbat faol bo'lsa, chat handlerga yo'naltirish."""
    # Agar faol suhbat bo'lsa
    if context.user_data.get("active_conversation_id"):
        handled = await handle_chat_message(update, context)
        if handled:
            return

    # Bosh menyu tugmalari
    text = update.message.text
    if "Vazifa yuborish" in text:
        await update.message.reply_text("📸 Daftaringizni suratga olib yuboring!")
    elif "Statistika" in text:
        await stats_command(update, context)
    elif "Yutuqlarim" in text:
        await stats_command(update, context)
    elif "Yordam" in text:
        await update.message.reply_text(
            "📚 *TekshirAI yordam:*\n\n"
            "📸 Daftar suratini yuboring — tekshirib beraman\n"
            "/stats — Statistikangiz\n"
            "/myid — Telegram ID\n"
            "/connect — Farzandni bog'lash (ota-onalar uchun)\n"
            "/start — Qayta boshlash\n\n"
            "Savol bo'lsa: @tekshirai\\_support",
            parse_mode="Markdown",
        )


if __name__ == "__main__":
    logging.basicConfig(
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        level=logging.INFO,
    )
    logger.info("TekshirAI bot ishga tushmoqda...")
    bot_app = create_bot()
    bot_app.run_polling(drop_pending_updates=True)
