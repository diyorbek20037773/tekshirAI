"""FastAPI app — TekshirAI backend + frontend serve + Telegram bot."""

import logging
import asyncio
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.config import settings
from backend.api.router import api_router

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

# Frontend va Admin build papkalari
FRONTEND_DIR = Path(__file__).parent.parent / "frontend" / "dist"
ADMIN_DIR = Path(__file__).parent.parent / "admin_panel" / "dist"

# Bot instance (global)
bot_app = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: bot ishga tushirish. Shutdown: bot to'xtatish."""
    global bot_app

    logger.info("TekshirAI backend ishga tushmoqda...")
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info(f"Frontend dir: {FRONTEND_DIR} (exists: {FRONTEND_DIR.exists()})")
    logger.info(f"Admin dir: {ADMIN_DIR} (exists: {ADMIN_DIR.exists()})")

    # DB URL masklangan log (debug uchun)
    db_url = settings.DATABASE_URL
    if "@" in db_url:
        masked = db_url.split("@")[0][:30] + "...@" + db_url.split("@")[1]
    else:
        masked = db_url[:40] + "..."
    logger.info(f"DATABASE_URL: {masked}")

    # DB jadvallarni yaratish / yangilash (retry bilan)
    for attempt in range(3):
        try:
            from sqlalchemy import text
            from backend.database import engine, Base
            import backend.models.user
            import backend.models.submission
            import backend.models.classroom
            import backend.models.conversation
            import backend.models.rating
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
                # Yangi ustunlar qo'shish (create_all mavjud jadvalga ustun qo'shmaydi)
                migrations = [
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_parent_id UUID REFERENCES users(id)",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS gender VARCHAR(10)",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS viloyat VARCHAR(100)",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS tuman VARCHAR(100)",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS maktab VARCHAR(200)",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT true",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS class_letter VARCHAR(5)",
                    "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20)",
                    # Bitta telegram_id dan bir nechta rol (ota-ona + farzand)
                    "DROP INDEX IF EXISTS ix_users_telegram_id",
                    "CREATE INDEX IF NOT EXISTS ix_users_telegram_id ON users (telegram_id)",
                    # Yangi rollar: director, admin
                    "ALTER TABLE users DROP CONSTRAINT IF EXISTS check_user_role",
                    "ALTER TABLE users ADD CONSTRAINT check_user_role CHECK (role IN ('student', 'teacher', 'parent', 'director', 'admin'))",
                ]
                for sql in migrations:
                    try:
                        await conn.execute(text(sql))
                    except Exception:
                        pass
            logger.info("DB jadvallar tekshirildi / yaratildi")
            break
        except Exception as e:
            logger.error(f"DB yaratishda xato (urinish {attempt + 1}/3): {e}")
            if attempt < 2:
                await asyncio.sleep(2)

    # Telegram bot ishga tushirish
    if settings.TELEGRAM_BOT_TOKEN:
        try:
            from backend.bot.bot import create_bot
            bot_app = create_bot()
            await bot_app.initialize()
            await bot_app.start()
            await bot_app.updater.start_polling(drop_pending_updates=True)
            logger.info("Telegram bot ishga tushdi (polling mode)")
        except Exception as e:
            logger.error(f"Bot ishga tushirishda xato: {e}")
    else:
        logger.warning("TELEGRAM_BOT_TOKEN yo'q, bot ishga tushmaydi")

    yield

    # Bot to'xtatish
    if bot_app:
        try:
            await bot_app.updater.stop()
            await bot_app.stop()
            await bot_app.shutdown()
            logger.info("Telegram bot to'xtatildi")
        except Exception as e:
            logger.error(f"Bot to'xtatishda xato: {e}")

    logger.info("TekshirAI backend to'xtatilmoqda...")


app = FastAPI(
    title="TekshirAI API",
    description="O'zbekiston maktab o'quvchilari uchun AI asosida uyga vazifalarni tekshirish",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routerlar
app.include_router(api_router)


@app.get("/api/health")
async def health():
    return {"status": "ok", "bot_running": bot_app is not None}


# Admin panel static fayllar
if ADMIN_DIR.exists() and (ADMIN_DIR / "assets").exists():
    app.mount("/admin/assets", StaticFiles(directory=ADMIN_DIR / "assets"), name="admin-assets")

# Frontend static fayllar (agar build qilingan bo'lsa)
if FRONTEND_DIR.exists() and (FRONTEND_DIR / "assets").exists():
    app.mount("/assets", StaticFiles(directory=FRONTEND_DIR / "assets"), name="assets")

    @app.get("/admin/{full_path:path}")
    async def serve_admin(request: Request, full_path: str = ""):
        """Admin panel SPA serve"""
        if not ADMIN_DIR.exists():
            return {"detail": "Admin panel build qilinmagan"}
        file_path = ADMIN_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(ADMIN_DIR / "index.html")

    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        if full_path.startswith("api/"):
            return {"detail": "Not found"}

        file_path = FRONTEND_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)

        return FileResponse(FRONTEND_DIR / "index.html")
else:
    @app.get("/")
    async def root():
        return {
            "name": "TekshirAI API",
            "version": "1.0.0",
            "status": "running",
            "message": "Frontend hali build qilinmagan. /api/health — API ishlayapti.",
        }
