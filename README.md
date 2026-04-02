# TekshirAI — AI asosida uy vazifalarni tekshirish tizimi

<p align="center">
  <strong>O'zbekiston maktab o'quvchilari (1-11 sinf) uchun sun'iy intellekt yordamida uy vazifalarni avtomatik tekshirish platformasi</strong>
</p>

---

## Mundarija

- [Loyiha haqida](#loyiha-haqida)
- [Qanday ishlaydi?](#qanday-ishlaydi)
- [Texnologiyalar](#texnologiyalar)
- [Arxitektura](#arxitektura)
- [Loyiha strukturasi](#loyiha-strukturasi)
- [O'rnatish va ishga tushirish](#ornatish-va-ishga-tushirish)
- [Environment o'zgaruvchilari](#environment-ozgaruvchilari)
- [API Endpointlar](#api-endpointlar)
- [Telegram Bot](#telegram-bot)
- [Frontend Dashboard](#frontend-dashboard)
- [Admin Panel](#admin-panel)
- [Gamifikatsiya tizimi](#gamifikatsiya-tizimi)
- [Deploy (Railway)](#deploy-railway)
- [Biznes model](#biznes-model)

---

## Loyiha haqida

**TekshirAI** — bu Google Gemini AI texnologiyasiga asoslangan, o'quvchilarning qo'lyozma daftarlarini suratga olib, har bir masalani alohida tekshirib, batafsil izoh beradigan tizim. Barcha javoblar o'zbek tilida beriladi.

**Asosiy muammolar yechimi:**
- O'qituvchilar har kuni 100+ daftarni tekshirishga ulgurmaydi
- Ota-onalar bolalarining o'qish holatini kuzata olmaydi
- O'quvchilar xatolarini tushunib olishga yordam kerak

**Platforma 3 ta foydalanuvchi rolini qo'llab-quvvatlaydi:**

| Rol | Interfeys | Imkoniyatlar |
|-----|-----------|-------------|
| **O'quvchi** | Telegram bot + Web dashboard | Vazifa yuborish, AI bilan suhbat, o'z statistikasini ko'rish |
| **O'qituvchi** | Web dashboard | Sinf boshqaruvi, o'quvchilar tahlili, risk darajalari |
| **Ota-ona** | Web dashboard | Bolaning natijalarini kuzatish, AI tavsiyalari |

---

## Qanday ishlaydi?

```
┌─────────────────────────────────────────────────────────────┐
│  1. O'quvchi daftarini suratga oladi                        │
│  2. Telegram botga yuboradi                                 │
│  3. OpenCV rasm sifatini yaxshilaydi (deskew, denoise)      │
│  4. Google Gemini AI rasmni o'qiydi (OCR)                   │
│  5. Har bir masalani alohida tekshiradi                     │
│  6. Natijani o'zbek tilida qaytaradi (5-7 soniya)           │
│  7. O'quvchi tushunmagan masala haqida AI bilan suhbatlashadi│
│  8. XP, badge va streak gamifikatsiya tizimi ishlaydi       │
│  9. O'qituvchi/ota-ona dashboardda natijalarni ko'radi      │
└─────────────────────────────────────────────────────────────┘
```

### Batafsil oqim diagrammasi

```
O'quvchi (Telegram)          Backend (FastAPI)              Gemini AI
       │                           │                           │
       │── Rasm yuboradi ─────────>│                           │
       │                           │── OpenCV preprocessing ──>│
       │                           │── Rasm + system prompt ──>│
       │                           │                           │── OCR + Tekshirish
       │                           │<── JSON natija ───────────│
       │                           │── DB ga saqlash           │
       │                           │── Gamifikatsiya hisoblash │
       │<── Natija + tugmalar ─────│                           │
       │                           │                           │
       │── "Tushuntir" tugmasi ───>│                           │
       │                           │── Chat context ──────────>│
       │                           │<── Izoh + tavsiyalar ─────│
       │<── AI izohi ─────────────│                           │
```

---

## Texnologiyalar

### Backend

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| Python | 3.11+ | Asosiy til |
| FastAPI | 0.109.0 | Web API framework |
| Uvicorn | 0.27.0 | ASGI server |
| PostgreSQL | 16 | Ma'lumotlar bazasi |
| SQLAlchemy | 2.0.25 | ORM (async) |
| asyncpg | 0.29.0 | PostgreSQL async driver |
| python-telegram-bot | 20.7 | Telegram bot framework |
| google-generativeai | 0.8.0 | Gemini API client |
| OpenCV | 4.9.0 | Rasm qayta ishlash |
| Pillow | 10.2.0 | Rasm formatlash |
| python-jose | 3.3.0 | JWT autentifikatsiya |
| passlib | 1.7.4 | Bcrypt hashing |
| Alembic | 1.13.1 | DB migratsiyalar |
| Pydantic | 2.5.3 | Ma'lumot validatsiyasi |

### Frontend

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| React | 18 | UI framework |
| React Router | v6 | Sahifalar navigatsiyasi |
| Vite | 5.0.12 | Build tool |
| TailwindCSS | 3.4.1 | CSS framework |
| Recharts | 2.12.0 | Grafiklar va diagrammalar |
| Axios | 1.6.7 | HTTP client |
| Lucide React | 0.312.0 | Ikonkalar |

### Admin Panel

| Texnologiya | Versiya | Maqsad |
|-------------|---------|--------|
| React | 19 | UI framework |
| TypeScript | 5.8 | Tipizatsiya |
| React Router | v7 | Navigatsiya |
| Vite | 8.0.0 | Build tool |
| TailwindCSS | 4.2.2 | CSS framework |
| Leaflet | 1.9.4 | Xarita (maktablar joylashuvi) |
| Recharts | 3.8.0 | Statistika grafiklari |

### Infratuzilma

| Texnologiya | Maqsad |
|-------------|--------|
| Docker + Docker Compose | Lokal development |
| Railway | Production deploy |
| Nixpacks | Build system |
| Git | Versiya boshqaruvi |

---

## Arxitektura

```
┌──────────────────────────────────────────────────────────────────┐
│                        TekshirAI Platform                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐        │
│  │  Telegram    │  │  Frontend   │  │   Admin Panel    │        │
│  │  Bot         │  │  (React 18) │  │   (React 19+TS)  │        │
│  │  (O'quvchi)  │  │  (O'qituvchi│  │   (Administrator)│        │
│  │             │  │   Ota-ona)  │  │                  │        │
│  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘        │
│         │                │                   │                   │
│         └────────────────┼───────────────────┘                   │
│                          │                                       │
│                  ┌───────▼────────┐                              │
│                  │   FastAPI      │                              │
│                  │   Backend      │                              │
│                  │   (REST API)   │                              │
│                  └───┬───────┬────┘                              │
│                      │       │                                   │
│              ┌───────▼──┐ ┌──▼──────────┐                       │
│              │PostgreSQL│ │ Google      │                       │
│              │   16     │ │ Gemini AI   │                       │
│              └──────────┘ └─────────────┘                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## Loyiha strukturasi

```
termizmilliyhackathon/
│
├── backend/                          # Python FastAPI backend
│   ├── main.py                       # FastAPI ilovasi, CORS, static mount
│   ├── config.py                     # Pydantic Settings (env o'qish)
│   ├── database.py                   # Async SQLAlchemy engine + session
│   │
│   ├── models/                       # SQLAlchemy ORM modellari
│   │   ├── user.py                   # User (student/teacher/parent)
│   │   ├── game_profile.py           # UserGameProfile (XP, level, badges)
│   │   ├── submission.py             # Submission (vazifa natijalari)
│   │   ├── conversation.py           # Conversation (AI chat tarixi)
│   │   └── classroom.py              # Classroom + ClassroomStudent
│   │
│   ├── schemas/                      # Pydantic request/response sxemalar
│   │
│   ├── api/                          # REST API endpointlar
│   │   ├── auth.py                   # /api/auth/* — JWT login/register
│   │   ├── check.py                  # /api/check/* — Vazifa tekshirish
│   │   ├── chat.py                   # /api/chat/* — AI suhbat
│   │   ├── users.py                  # /api/users/* — Foydalanuvchi boshqaruvi
│   │   ├── submissions.py            # /api/submissions/* — Yuborishlar tarixi
│   │   ├── dashboard.py              # /api/dashboard/* — Statistika
│   │   ├── analysis.py               # /api/analysis/* — Risk tahlili
│   │   └── classrooms.py             # /api/classrooms/* — Sinf boshqaruvi
│   │
│   ├── services/                     # Biznes logika
│   │   ├── gemini_service.py         # Gemini AI integratsiya (OCR + check + chat)
│   │   ├── key_manager.py            # API kalit rotatsiyasi (round-robin)
│   │   ├── image_processor.py        # OpenCV rasm preprocessing
│   │   ├── gamification.py           # XP, level, streak, badge hisoblash
│   │   ├── analytics.py              # Dashboard statistika
│   │   └── notification.py           # Ota-onaga Telegram xabar yuborish
│   │
│   └── bot/                          # Telegram bot
│       ├── bot.py                    # Bot Application yaratish
│       ├── keyboards.py              # Inline/Reply klaviaturalar
│       ├── messages.py               # O'zbek tilidagi xabarlar
│       └── handlers/                 # Bot buyruqlari
│           ├── start.py              # /start — Ro'yxatdan o'tish menyu
│           ├── register.py           # Foydalanuvchi ro'yxatdan o'tishi
│           ├── submit.py             # Rasm qabul qilish va tekshirish
│           ├── explain.py            # Masala tushuntirish
│           ├── chat.py               # AI bilan suhbat
│           ├── stats.py              # /stats — Statistika ko'rsatish
│           └── parent.py             # /connect, /myid — Ota-ona bog'lash
│
├── frontend/                         # React web dashboard
│   ├── src/
│   │   ├── pages/                    # Sahifalar
│   │   │   ├── RoleSelectPage.jsx    # Rol tanlash
│   │   │   ├── LoginPage.jsx         # Kirish
│   │   │   ├── student/              # O'quvchi sahifalari
│   │   │   ├── teacher/              # O'qituvchi sahifalari
│   │   │   └── parent/               # Ota-ona sahifalari
│   │   ├── components/               # Qayta ishlatiladigan komponentlar
│   │   ├── api/                      # API client funksiyalari
│   │   └── data/                     # Statik ma'lumotlar
│   ├── package.json
│   └── vite.config.js
│
├── admin_panel/                      # Admin panel (TypeScript)
│   ├── src/
│   │   ├── pages/                    # Sahifalar
│   │   │   ├── XaritaPage.tsx        # Maktablar xaritasi (Leaflet)
│   │   │   ├── ReytingPage.tsx       # Reyting/liderboard
│   │   │   ├── MavzularPage.tsx      # Mavzular tahlili
│   │   │   ├── MuammolarPage.tsx     # Muammolar kuzatuvi
│   │   │   └── ProfilPage.tsx        # Profil sahifasi
│   │   ├── components/               # Komponentlar
│   │   │   ├── layout/               # Layout (Sidebar, TopBar)
│   │   │   ├── shared/               # Umumiy (KPIBar)
│   │   │   └── map/                  # Xarita komponentlari
│   │   ├── api/                      # API client
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── utils/                    # Yordamchi funksiyalar
│   │   └── types/                    # TypeScript tiplar
│   ├── package.json
│   └── tsconfig.json
│
├── alembic/                          # DB migratsiyalar
├── scripts/                          # Yordamchi skriptlar
│   ├── init_db.py                    # DB jadvallarni yaratish
│   ├── seed_data.py                  # Test ma'lumotlar qo'shish
│   └── test_pipeline.py             # Pipeline testlash
│
├── .env.example                      # Environment namunasi
├── docker-compose.yml                # Docker Compose (lokal dev)
├── railway.toml                      # Railway deploy konfiguratsiyasi
├── Procfile                          # Railway process fayli
├── requirements.txt                  # Python kutubxonalar
├── runtime.txt                       # Python versiya
└── build.sh                          # Railway build skripti
```

---

## O'rnatish va ishga tushirish

### Talablar

- Python 3.11+
- Node.js 18+
- PostgreSQL 16 (yoki Docker)
- Telegram Bot Token ([BotFather](https://t.me/BotFather) orqali)
- Gemini API kalitlari ([Google AI Studio](https://aistudio.google.com/apikey) dan)

### 1-usul: Docker bilan (tavsiya etiladi)

```bash
# Reponi klonlash
git clone https://github.com/your-username/tekshirai.git
cd tekshirai

# Environment sozlash
cp .env.example .env
# .env faylni to'ldiring (pastda batafsil)

# Docker bilan ishga tushirish
docker-compose up -d

# DB jadvallarni yaratish
docker-compose exec backend python scripts/init_db.py

# Test ma'lumotlar (ixtiyoriy)
docker-compose exec backend python scripts/seed_data.py
```

Servislar:
- Backend API: http://localhost:8000
- Frontend: http://localhost:5173
- PostgreSQL: localhost:5432

### 2-usul: Qo'lda o'rnatish

```bash
# 1. Virtual environment
python -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate         # Windows

# 2. Python kutubxonalarni o'rnatish
pip install -r requirements.txt

# 3. Environment sozlash
cp .env.example .env
# .env faylni to'ldiring

# 4. PostgreSQL bazani yaratish
# Docker bilan:
docker-compose up -d db
# Yoki qo'lda PostgreSQL o'rnating va bazani yarating

# 5. DB jadvallarni yaratish
python scripts/init_db.py

# 6. Backend ishga tushirish
uvicorn backend.main:app --reload --port 8000

# 7. Frontend (yangi terminal)
cd frontend
npm install
npm run dev

# 8. Admin panel (yangi terminal)
cd admin_panel
npm install
npm run dev
```

---

## Environment o'zgaruvchilari

`.env.example` faylidan `.env` yarating va quyidagilarni to'ldiring:

```env
# === Ma'lumotlar bazasi ===
DATABASE_URL=postgresql+asyncpg://tekshirai:password@localhost:5432/tekshirai
DATABASE_URL_SYNC=postgresql://tekshirai:password@localhost:5432/tekshirai

# === Telegram Bot ===
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz

# === Gemini API kalitlari ===
# Har bir Gmail akkountdan 1 ta kalit olish mumkin (250 so'rov/kun bepul)
# Ko'p kalit = ko'p bepul so'rov
GEMINI_API_KEYS=AIzaSy_key1,AIzaSy_key2,AIzaSy_key3
GEMINI_MODEL=gemini-2.5-flash

# === Ilova sozlamalari ===
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
SECRET_KEY=your-secret-key-for-jwt-change-this
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# === Limitlar ===
FREE_DAILY_LIMIT=3         # Bepul: kuniga 3 ta tekshirish
PREMIUM_DAILY_LIMIT=999    # Premium: cheksiz
MAX_IMAGE_SIZE_MB=10       # Maksimal rasm hajmi
FREE_CHAT_LIMIT=3          # Bepul: 3 ta chat xabar
PREMIUM_CHAT_LIMIT=10      # Premium: 10 ta chat xabar
```

### Gemini API kalitlarni olish

1. https://aistudio.google.com/apikey sahifasiga o'ting
2. Google akkount bilan kiring
3. **"Create API Key"** tugmasini bosing
4. Kalitni `.env` fayliga qo'shing
5. Ko'proq kalit uchun — boshqa Gmail akkountdan takrorlang

> **Muhim:** Har bir Gmail akkount kuniga 250 ta bepul so'rov beradi. 4 ta kalit = 1000 so'rov/kun.

---

## API Endpointlar

Base URL: `http://localhost:8000/api`

### Autentifikatsiya

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/auth/register` | O'qituvchi ro'yxatdan o'tishi |
| POST | `/api/auth/login` | Tizimga kirish (JWT token) |

### Vazifa tekshirish

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/check/homework` | Rasm yuborish va AI tekshirish |

**Request (multipart/form-data):**
```
image: File          # Daftar rasmi
subject: string      # Fan nomi (matematika, fizika, ...)
grade: integer       # Sinf (1-11)
telegram_id: string  # Foydalanuvchi Telegram ID
```

**Response:**
```json
{
  "submission_id": 123,
  "score": 8,
  "total_problems": 10,
  "correct_count": 8,
  "incorrect_count": 2,
  "problems": [
    {
      "number": 1,
      "status": "correct",
      "student_answer": "x = 5",
      "correct_answer": "x = 5",
      "explanation": "To'g'ri yechilgan!"
    }
  ]
}
```

### AI Chat

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/chat/message` | AI bilan suhbatlashish |

### Foydalanuvchilar

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/users/register` | Yangi foydalanuvchi (Telegram orqali) |
| GET | `/api/users/{telegram_id}` | Profil ma'lumotlari |
| PUT | `/api/users/{telegram_id}` | Profilni yangilash |
| DELETE | `/api/users/{telegram_id}` | Foydalanuvchini o'chirish |
| GET | `/api/users/{telegram_id}/stats` | Statistika |
| GET | `/api/users/leaderboard` | Reyting jadvali |
| POST | `/api/users/link-parent` | Ota-onani bog'lash so'rovi |
| POST | `/api/users/confirm-parent` | Bog'lashni tasdiqlash |

### Yuborishlar tarixi

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/submissions/{id}` | Bitta yuborish tafsiloti |
| GET | `/api/submissions/student/{telegram_id}` | O'quvchining barcha yuborishlari |

### Dashboard (O'qituvchi)

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/dashboard/overview` | Umumiy statistika |
| GET | `/api/dashboard/recent` | So'nggi yuborishlar |
| GET | `/api/dashboard/topic-errors` | Mavzular bo'yicha xatolar |

### Tahlil

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/analysis/student/{telegram_id}` | O'quvchi risk tahlili (yashil/sariq/qizil) |

### Sinflar

| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/classrooms/` | Yangi sinf yaratish |
| GET | `/api/classrooms/` | O'qituvchining sinflari |
| POST | `/api/classrooms/join` | Sinfga qo'shilish (invite_code) |
| GET | `/api/classrooms/{id}/students` | Sinf o'quvchilari |

---

## Telegram Bot

### Bot buyruqlari

| Buyruq | Tavsif |
|--------|--------|
| `/start` | Botni boshlash, ro'yxatdan o'tish |
| `/stats` | O'z statistikangizni ko'rish (XP, level, streak) |
| `/connect` | Ota-ona: bolani bog'lash |
| `/myid` | O'z Telegram ID ni ko'rish |

### Ro'yxatdan o'tish jarayoni

```
/start → Rol tanlash (O'quvchi/O'qituvchi/Ota-ona)
  ├── O'quvchi → Sinf tanlash (1-11) → Jins tanlash → Tayyor!
  ├── O'qituvchi → Fan tanlash → Tayyor!
  └── Ota-ona → Bola username → Tasdiqlash → Tayyor!
```

### Vazifa tekshirish jarayoni (O'quvchi)

1. Daftar rasmini botga yuboring
2. Fan va sinf tanlang
3. AI 5-7 soniyada natijani qaytaradi
4. Har bir masala uchun **"Tushuntir"** tugmasini bosing
5. AI bilan suhbatlashing — savollar bering

### Ota-ona bolani bog'lash

```
Ota-ona: /connect → Bolaning username ni yozadi
Bola: Telegram orqali tasdiqlash xabari keladi → /accept yoki /deny
Ota-ona: Dashboard orqali bolaning barcha natijalarini ko'radi
```

---

## Frontend Dashboard

Frontend — o'qituvchi, ota-ona va o'quvchi uchun role-based web dashboard.

### Sahifalar

**O'quvchi:**
- `/student/setup` — Dastlabki sozlash
- `/student` — Bosh sahifa (statistika, so'nggi natijalar)
- `/student/profile` — Profil (XP, badge, streak)

**O'qituvchi:**
- `/teacher/setup` — Dastlabki sozlash
- `/teacher` — Dashboard (umumiy statistika, grafiklar)
- `/teacher/profile` — Profil
- `/teacher/class/:id` — Sinf tafsilotlari
- `/teacher/student/:id` — O'quvchi tahlili (risk darajasi bilan)

**Ota-ona:**
- `/parent/setup` — Dastlabki sozlash
- `/parent` — Dashboard (bolaning natijalari, AI tavsiyalar)
- `/parent/profile` — Profil

### Real-time yangilanish
Dashboard har 10 soniyada yangi ma'lumotlarni tekshiradi (polling).

---

## Admin Panel

Admin panel — TypeScript + React 19 da yozilgan, administrator uchun kengaytirilgan boshqaruv paneli.

### Sahifalar

| Sahifa | Tavsif |
|--------|--------|
| **Xarita** | Leaflet xaritada maktablar joylashuvi |
| **Reyting** | O'quvchilar va maktablar reytingi |
| **Mavzular** | Fanlar bo'yicha mavzular tahlili |
| **Muammolar** | Tizim muammolari va kuzatuv |
| **Profil** | Administrator profili |

---

## Gamifikatsiya tizimi

O'quvchilarni rag'batlantirish uchun o'yin elementlari tizimi.

### Darajalar (7 ta)

| Daraja | Nomi | Kerakli XP | Emoji |
|--------|------|-----------|-------|
| 1 | Boshlang'ich | 0 | Niholcha |
| 2 | Harakat qiluvchi | 100 | Yulduz |
| 3 | Bilimdon | 300 | Kitoblar |
| 4 | Ustoz yo'lida | 600 | Nishon |
| 5 | Akademik | 1000 | Medal |
| 6 | Professor | 2000 | Diplom |
| 7 | Olim | 5000 | Laboratoriya |

### XP tizimi

| Harakat | XP |
|---------|-----|
| Vazifa yuborish | +10 |
| 100% to'g'ri javob | +15 (bonus) |
| O'z vaqtida topshirish | +5 |
| Haftalik streak | +50 |

### Badge'lar (8 ta)

| Badge | Sharti |
|-------|--------|
| Birinchi qadam | Birinchi vazifa yuborish |
| Hafta yulduzi | 7 kun ketma-ket yuborish |
| Xatosiz kun | 1 kunda barcha javoblar to'g'ri |
| Matematik | 50 ta matematika masala yechish |
| Savol beruvchi | 10 ta AI suhbat boshlash |
| Oy chempioni | Oylik eng ko'p XP |
| Sinf yulduzi | Sinfda birinchi o'rin |
| Mukammal ball | 100% natija olish |

### Streak tizimi

- Har kuni vazifa yuborsangiz streak davom etadi
- Oyiga 1 marta "himoya qalqoni" — 1 kun o'tkazib yuborsangiz streak saqlanadi
- Streak uzilsa — noldan boshlanadi

---

## Deploy (Railway)

### Railway ga deploy qilish

1. [Railway](https://railway.app) ga GitHub bilan kiring
2. **"New Project" → "Deploy from GitHub Repo"** tanlang
3. Repositoriyani ulang
4. **PostgreSQL** servisini qo'shing
5. Environment o'zgaruvchilarni sozlang:

```
DATABASE_URL=<Railway PostgreSQL URL>
TELEGRAM_BOT_TOKEN=<bot token>
GEMINI_API_KEYS=<kalitlar>
GEMINI_MODEL=gemini-2.5-flash
APP_ENV=production
SECRET_KEY=<kuchli parol>
```

6. Railway avtomatik build va deploy qiladi

### Deploy konfiguratsiyasi

**railway.toml:**
```toml
[build]
builder = "nixpacks"

[build.nixpacks]
aptPkgs = ["nodejs", "npm"]
buildCmd = "pip install -r requirements.txt && cd frontend && npm install && npm run build && cd .."

[deploy]
startCommand = "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"
```

**Procfile:**
```
web: uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
```

> Frontend production build `frontend/dist/` papkaga chiqadi va FastAPI orqali statik fayllar sifatida xizmat ko'rsatiladi.

---

## Biznes model

| Reja | Narx | Imkoniyatlar |
|------|------|-------------|
| **Bepul** | $0 | Kuniga 3 ta tekshirish, 3 ta AI chat |
| **Premium** | $15/oy | Cheksiz tekshirish, 10 ta AI chat |

### API kalit rotatsiyasi

Gemini API bepul rejasida har bir kalit kuniga 250 so'rov beradi. Tizim bir nechta kalitni round-robin usulida aylantirib ishlatadi:

```
4 ta kalit = 1000 so'rov/kun (bepul!)
10 ta kalit = 2500 so'rov/kun (bepul!)
```

Kalit limiti tugaganda avtomatik keyingi kalitga o'tadi.

---

## Skriptlar

```bash
# DB jadvallarni yaratish
python scripts/init_db.py

# Test ma'lumotlar bilan to'ldirish
python scripts/seed_data.py

# Vazifa tekshirish pipeline ni testlash
python scripts/test_pipeline.py
```

---

## Ishlab chiqish

### Lokal development

```bash
# Barcha servislarni Docker bilan
docker-compose up

# Yoki alohida-alohida:
# Terminal 1: DB
docker-compose up -d db

# Terminal 2: Backend (hot reload)
uvicorn backend.main:app --reload --port 8000

# Terminal 3: Frontend (hot reload)
cd frontend && npm run dev

# Terminal 4: Admin panel (hot reload)
cd admin_panel && npm run dev
```

### DB migratsiyalar

```bash
# Yangi migratsiya yaratish
alembic revision --autogenerate -m "tavsif"

# Migratsiyani qo'llash
alembic upgrade head

# Migratsiyani orqaga qaytarish
alembic downgrade -1
```

---

## Litsenziya

MIT

---

<p align="center">
  <strong>TekshirAI</strong> — O'zbekiston ta'lim tizimini AI bilan yaxshilash yo'lida<br>
  Termiz Milliy Hackathon 2025
</p>
