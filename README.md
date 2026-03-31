# TekshirAI

O'zbekiston maktab o'quvchilari uchun AI asosida uyga vazifalarni avtomatik tekshirish tizimi.

## Qanday ishlaydi?

1. O'quvchi daftarini suratga oladi
2. Telegram botga yuboradi
3. Google Gemini AI rasmni o'qiydi, har bir masalani tekshiradi
4. Natijani o'zbek tilida qaytaradi (5-7 soniyada)
5. O'quvchi tushunmagan masala haqida AI bilan suhbatlashadi

## Texnologiyalar

- **Backend:** Python 3.11+ / FastAPI
- **Database:** PostgreSQL + SQLAlchemy (async)
- **Bot:** python-telegram-bot v20+
- **AI:** Google Gemini API (gemini-2.5-flash) — bepul
- **Image Processing:** OpenCV + Pillow
- **Frontend:** React 18 + TailwindCSS + Vite
- **Auth:** JWT

## O'rnatish

```bash
# 1. Virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 2. Dependencies
pip install -r requirements.txt

# 3. Environment
cp .env.example .env
# .env faylni to'ldiring (GEMINI_API_KEYS, TELEGRAM_BOT_TOKEN)

# 4. Database
docker-compose up -d db
python scripts/init_db.py

# 5. Backend
uvicorn backend.main:app --reload --port 8000

# 6. Bot (alohida terminal)
python -m backend.bot.bot

# 7. Frontend (alohida terminal)
cd frontend && npm install && npm run dev
```

## Gemini API kalitlarni olish

1. https://aistudio.google.com/apikey ga boring
2. Gmail bilan kiring
3. "Create API Key" bosing
4. .env fayliga qo'shing

Ko'p kalit = ko'p bepul so'rov (har bir Gmail: 250/kun)

## Loyiha strukturasi

```
backend/
  main.py          — FastAPI app
  config.py        — Sozlamalar
  database.py      — DB ulanish
  models/          — SQLAlchemy modellar
  schemas/         — Pydantic sxemalar
  api/             — REST API endpointlar
  services/        — Biznes logika (Gemini, OpenCV, gamification)
  bot/             — Telegram bot
    handlers/      — Bot buyruqlari
frontend/          — React dashboard
scripts/           — Yordamchi skriptlar
tests/             — Testlar
```
