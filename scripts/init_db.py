"""Database jadvallarni yaratish skripti"""

import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database import engine, Base
from backend.models import User, UserGameProfile, Submission, Classroom, ClassroomStudent, Conversation


async def init_db():
    """Barcha jadvallarni yaratish + yangi ustunlar qo'shish"""
    async with engine.begin() as conn:
        print("Jadvallar yaratilmoqda...")
        await conn.run_sync(Base.metadata.create_all)
        print("Tayyor! Barcha jadvallar yaratildi:")
        for table_name in Base.metadata.tables:
            print(f"  - {table_name}")

        # Yangi ustunlar qo'shish (mavjud jadvalga)
        print("\nYangi ustunlar tekshirilmoqda...")
        migrations = [
            "ALTER TABLE users ADD COLUMN IF NOT EXISTS pending_parent_id UUID REFERENCES users(id)",
        ]
        for sql in migrations:
            try:
                await conn.execute(__import__('sqlalchemy').text(sql))
                print(f"  OK: {sql[:60]}...")
            except Exception as e:
                print(f"  SKIP: {e}")

        print("Migration tayyor!")


if __name__ == "__main__":
    asyncio.run(init_db())
