Backend (Server tomoni)
Texnologiya	Vazifasi
Python 3.12	Asosiy dasturlash tili
Django 4.2	Web framework
Django REST Framework (DRF)	REST API yaratish
Gunicorn	WSGI server (production)
aiogram 3.7+	Telegram Bot framework
aiohttp	Async HTTP so'rovlar (bot → API)
psycopg2-binary	PostgreSQL bilan ulanish
dj-database-url	Database URL parsing
django-cors-headers	CORS sozlash
whitenoise	Static fayllarni serve qilish
Pillow	Rasm bilan ishlash
python-dotenv	.env fayldan o'zgaruvchilar o'qish
Frontend (Foydalanuvchi tomoni)
Texnologiya	Vazifasi
React 19	UI framework
TypeScript	Tipli JavaScript
Vite	Build tool (tez bundler)
Tailwind CSS	Styling (UI dizayn)
Leaflet + React-Leaflet	Xarita ko'rsatish
Recharts	Grafik/diagrammalar
Lucide React	Ikonkalar
React Router DOM	Sahifalar navigatsiyasi
TMA (Telegram Mini App) uchun alohida — oddiy HTML + vanilla JavaScript ishlatilgan.

Database (Ma'lumotlar bazasi)
Muhit	Texnologiya
Development	SQLite3
Production	PostgreSQL (Railway orqali)
Deploy (Serverga joylashtirish)
Texnologiya	Vazifasi
Railway	Hosting platforma (PaaS)
Nixpacks	Avtomatik build
Procfile	web (Django) + worker (Bot) ishga tushirish
Minimal Mini App Bot uchun kerak bo'ladigan stack
Agar yangi mini app bot yasasangiz, eng zarur to'plam:


Backend:  Python + Django + DRF + aiogram
Frontend: React + TypeScript + Vite + Tailwind CSS
Database: PostgreSQL
Deploy:   Railway
Ishlash sxemasi:


Foydalanuvchi → Telegram Bot (aiogram) → Mini App (React) → API (Django DRF) → PostgreSQL