"""Telegram bot tugmalari (keyboards)."""

from telegram import ReplyKeyboardMarkup, InlineKeyboardButton, InlineKeyboardMarkup


# === Reply Keyboards ===

def role_keyboard():
    """Rol tanlash."""
    return ReplyKeyboardMarkup(
        [
            ["📚 O'quvchi", "👨‍🏫 O'qituvchi"],
            ["👨‍👩‍👦 Ota-ona", "🏫 Direktor"],
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


def grade_keyboard():
    """Sinf tanlash (1-11)."""
    return ReplyKeyboardMarkup(
        [
            ["1", "2", "3", "4"],
            ["5", "6", "7", "8"],
            ["9", "10", "11"],
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


def subject_keyboard():
    """Fan tanlash."""
    return ReplyKeyboardMarkup(
        [
            ["📐 Matematika", "⚡ Fizika"],
            ["🧪 Kimyo", "🌿 Biologiya"],
            ["💻 Informatika"],
        ],
        resize_keyboard=True,
        one_time_keyboard=True,
    )


def main_menu_keyboard():
    """Bosh menyu."""
    return ReplyKeyboardMarkup(
        [
            ["📸 Vazifa yuborish"],
            ["📊 Statistika", "🎮 Yutuqlarim"],
            ["ℹ️ Yordam"],
        ],
        resize_keyboard=True,
    )


# === Inline Keyboards ===

def explain_keyboard(ai_result: dict, submission_id: str) -> InlineKeyboardMarkup | None:
    """Xato masalalar uchun 'Tushuntir' va 'Suhbat' tugmalari."""
    buttons = []
    row = []

    for p in ai_result.get("problems", []):
        if not p.get("is_correct"):
            row.append(
                InlineKeyboardButton(
                    f"📝 {p['number']}-masalani tushuntir",
                    callback_data=f"explain_{submission_id}_{p['number']}"
                )
            )
            if len(row) == 2:
                buttons.append(row)
                row = []

    if row:
        buttons.append(row)

    # Suhbat tugmasi — tushunmagan masala uchun
    if ai_result.get("incorrect_count", 0) > 0:
        buttons.append([
            InlineKeyboardButton(
                "💬 AI bilan suhbatlashish",
                callback_data=f"chat_start_{submission_id}"
            )
        ])

    if not buttons:
        return None

    return InlineKeyboardMarkup(buttons)


def chat_problem_keyboard(ai_result: dict, submission_id: str) -> InlineKeyboardMarkup:
    """Suhbat uchun masala tanlash tugmalari."""
    buttons = []
    for p in ai_result.get("problems", []):
        if not p.get("is_correct"):
            buttons.append([
                InlineKeyboardButton(
                    f"❌ {p['number']}-masala haqida suhbat",
                    callback_data=f"chat_problem_{submission_id}_{p['number']}"
                )
            ])
    return InlineKeyboardMarkup(buttons)


def chat_options_keyboard() -> InlineKeyboardMarkup:
    """Suhbat davomida tezkor tugmalar."""
    return InlineKeyboardMarkup([
        [
            InlineKeyboardButton("❓ Nega bunday?", callback_data="chat_quick_nega"),
            InlineKeyboardButton("🔄 Boshqa usul", callback_data="chat_quick_boshqa"),
        ],
        [
            InlineKeyboardButton("📝 O'xshash masala", callback_data="chat_quick_oxshash"),
            InlineKeyboardButton("🌍 Hayotiy misol", callback_data="chat_quick_hayotiy"),
        ],
        [
            InlineKeyboardButton("✅ Tushundim!", callback_data="chat_resolved"),
        ],
    ])
