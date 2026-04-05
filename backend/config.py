"""TekshirAI konfiguratsiya — .env dan o'qiydi"""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    # Database — Railway DATABASE_URL ni asyncpg formatga o'girish
    DATABASE_URL: str = "postgresql+asyncpg://tekshirai:password@localhost:5432/tekshirai"
    DATABASE_URL_SYNC: str = "postgresql://tekshirai:password@localhost:5432/tekshirai"

    def model_post_init(self, __context):
        # Railway postgresql:// beradi, asyncpg uchun postgresql+asyncpg:// kerak
        if self.DATABASE_URL.startswith("postgresql://"):
            object.__setattr__(self, 'DATABASE_URL_SYNC', self.DATABASE_URL)
            object.__setattr__(self, 'DATABASE_URL', self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1))

    # Telegram Bot
    TELEGRAM_BOT_TOKEN: str = ""

    # Gemini API
    GEMINI_API_KEYS: str = ""  # vergul bilan ajratilgan: key1,key2,key3
    GEMINI_MODEL: str = "gemini-2.5-flash"

    # App
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    SECRET_KEY: str = "change-this-secret-key"
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # Admin
    ADMIN_TELEGRAM_IDS: str = ""

    # Limits
    FREE_DAILY_LIMIT: int = 3
    PREMIUM_DAILY_LIMIT: int = 999
    MAX_IMAGE_SIZE_MB: int = 10
    FREE_CHAT_LIMIT: int = 3
    PREMIUM_CHAT_LIMIT: int = 10

    @property
    def gemini_keys(self) -> List[str]:
        """Gemini API kalitlar ro'yxati"""
        return [k.strip() for k in self.GEMINI_API_KEYS.split(",") if k.strip()]

    @property
    def admin_telegram_ids(self) -> List[int]:
        """Admin Telegram ID lar ro'yxati"""
        return [int(x.strip()) for x in self.ADMIN_TELEGRAM_IDS.split(",") if x.strip()]

    @property
    def cors_origins(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
