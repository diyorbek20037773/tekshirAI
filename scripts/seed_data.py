"""Seed data skripti — sintetik data olib tashlandi.

Bu skript endi ishlatilmaydi. Barcha ma'lumotlar real foydalanuvchilar
tomonidan Telegram mini app orqali kiritiladi.
"""

import asyncio


async def seed():
    print("Sintetik data olib tashlandi.")
    print("Barcha ma'lumotlar real foydalanuvchilar tomonidan kiritiladi.")


if __name__ == "__main__":
    asyncio.run(seed())
