"""Barcha bot xabarlari o'zbek tilida (lotin alifbosi)."""

WELCOME_MESSAGE = """🎓 *TekshirAI* ga xush kelibsiz!

Men sizning shaxsiy AI repetitoringizman.
Uyga vazifangizni suratga olib yuboring — men tekshirib, xatolarni tushuntirib beraman.

📸 *Qanday ishlaydi:*
1. Daftaringizni suratga oling
2. Menga yuboring
3. 5-7 soniyada natija oling!

🆓 *Bepul:* Kuniga 3 ta tekshiruv
💎 *Premium:* Cheksiz tekshiruv — 15,000 so'm/oy

Boshlash uchun ro'yxatdan o'ting 👇"""

REGISTRATION_ROLE = "Kim sifatida ro'yxatdan o'tmoqchisiz?"
REGISTRATION_NAME = "Ismingizni kiriting:"
REGISTRATION_GRADE = "Nechanchi sinfda o'qiysiz?"
REGISTRATION_SUBJECT = "Qaysi fanni tekshirmoqchisiz?"

REGISTRATION_SUCCESS = """✅ Ro'yxatdan o'tdingiz!

👤 Ism: {name}
📚 Sinf: {grade}-sinf
📐 Fan: {subject}

Endi daftar suratini yuboring! 📸"""

REGISTRATION_TEACHER_SUCCESS = """✅ O'qituvchi sifatida ro'yxatdan o'tdingiz!

👤 Ism: {name}
📐 Fan: {subject}

Dashboard: /dashboard
Sinf yaratish: /newclass"""

REGISTRATION_PARENT_SUCCESS = """✅ Ota-ona sifatida ro'yxatdan o'tdingiz!

👤 Ism: {name}

Farzandingiz botdan foydalanganda natijalarni avtomatik olasiz.
Farzandni bog'lash: /connect"""

SUBMIT_PROCESSING = "⏳ Tekshirilmoqda... Bir oz kuting (5-7 soniya)"

SUBMIT_OCR_FAIL = """❌ Rasmdagi yozuvni o'qiy olmadim.

Iltimos:
📸 Yaxshi yorug'likda suratga oling
📐 Daftarni tekis qo'ying
🔍 Yozuv aniq ko'rinsin
📏 Faqat yechilgan qismni suratga oling

Qayta yuboring 👇"""

SUBMIT_DAILY_LIMIT = """⚠️ Bugungi bepul limitingiz tugadi ({limit} ta).

💎 *Premium obuna bilan cheksiz tekshiring:*
💰 Oyiga atigi 15,000 so'm
✅ Cheksiz tekshiruv
✅ To'liq AI suhbat
✅ Barcha fanlar
✅ Batafsil tushuntirish + hayotiy misollar

/premium — Obuna bo'lish"""

STATS_MESSAGE = """📊 *Sizning statistikangiz:*

📚 Jami tekshirilgan: {total} ta vazifa
✅ O'rtacha ball: {avg_score}%

💪 Kuchli tomoningiz: {strong_topics}
⚠️ Mashq qilish kerak: {weak_topics}

📅 Bugungi tekshiruvlar: {today_count}/{daily_limit}"""

GAMIFICATION_STATS = """🎮 *Gamification:*

{level_emoji} Daraja: {level_name} (Level {level})
⭐ XP: {xp}
🔥 Streak: {streak} kun
🏅 Nishonlar: {badges_count} ta

{badges_list}"""

XP_EARNED_MESSAGE = """
⭐ +{xp} XP oldiniz!{level_up}{new_badges}{streak_info}"""

LEVEL_UP_MESSAGE = "\n🆙 Tabriklaymiz! Yangi daraja: {level_emoji} *{level_name}*!"

NEW_BADGE_MESSAGE = "\n🏅 Yangi nishon: {emoji} *{name}*!"

STREAK_MESSAGE = "\n🔥 Streak: {streak} kun"

CHAT_START = """💬 *{problem_number}-masala haqida suhbat*

Savolingizni yozing — men tushuntirib beraman.
Masalan:
• "Nega bunday?"
• "Boshqa usulda ko'rsat"
• "Shunga o'xshash masala ber"
• "Hayotiy misol ber"

Tugash uchun: /tushundim"""

CHAT_LIMIT_REACHED = """⚠️ Suhbat limiti tugadi ({limit} xabar).

💎 Premium obuna bilan ko'proq suhbatlashing!
/premium — Obuna bo'lish"""

CHAT_RESOLVED = """✅ Ajoyib! Tushunganingiz uchun tabriklaymiz! 🎉

Davom eting — keyingi vazifani yuboring! 📸"""

PARENT_DAILY_REPORT = """📊 *{child_name}ning bugungi natijasi:*

📚 Fan: {subject}
✅ To'g'ri: {correct}/{total}
📊 Ball: {score}%

{status_emoji} {status_message}

💡 *Tavsiya:* {recommendation}"""

CAREER_PREDICTION_MESSAGE = """🧭 *Kasb yo'nalishi tahlili:*

{career_list}

📋 *Xulosa:* {summary}
💡 *Tavsiya:* {improvement}
✨ {motivation}

_Bu AI tavsiyasi — yakuniy baho emas._"""

CAREER_NOT_READY_MESSAGE = """🧭 Kasb yo'nalishini aniqlash uchun ko'proq tekshiruvlar kerak.

📊 Hozircha: {current} ta tekshiruv
📌 Kerak: kamida 5 ta tekshiruv, 2 ta fandan

Ko'proq vazifalar yuboring! 📸"""

ERROR_NOT_IMAGE = "📸 Iltimos, rasm yuboring. Boshqa turdagi fayllarni qabul qilmayman."
ERROR_IMAGE_TOO_LARGE = "📸 Rasm juda katta (max 10MB). Kichikroq rasm yuboring."
ERROR_GENERAL = "❌ Xatolik yuz berdi. Iltimos qayta urinib ko'ring."
ERROR_NOT_REGISTERED = "❌ Avval ro'yxatdan o'ting: /start"
