"""/start buyrug'i — xush kelibsiz xabari + Mini App tugmasi."""

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ContextTypes

from backend.config import settings


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Foydalanuvchi /start bosganda — ilova haqida va Mini App tugmasi."""
    user = update.effective_user
    name = user.first_name or "do'stim"

    # Railway URL (environment variable dan yoki default)
    import os
    webapp_url = os.getenv("WEBAPP_URL", "https://milliyaitermizhackathon-production.up.railway.app")

    text = (
        f"Salom, {name}! 👋\n\n"
        f"🎓 *TekshirAI* — sun'iy intellekt asosida uyga vazifalarni tekshiruvchi\n\n"
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
        reply_markup=keyboard,
    )
