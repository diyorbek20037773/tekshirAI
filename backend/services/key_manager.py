"""
Gemini API kalitlarni boshqarish — round-robin rotation.
Har bir Gmail akkaunt: 250 so'rov/kun (bepul).
5 ta kalit = 1,250 so'rov/kun.
"""

import logging
from datetime import datetime, date
from typing import List, Dict

from backend.config import settings

logger = logging.getLogger(__name__)


class KeyManager:
    """Gemini API kalitlarni rotate qilish."""

    def __init__(self):
        self.keys: List[str] = settings.gemini_keys
        if not self.keys:
            raise ValueError("GEMINI_API_KEYS .env da topilmadi!")

        self.current_index: int = 0
        self.daily_limit: int = 250  # Har bir kalit uchun kunlik limit

        # Har bir kalit uchun statistika
        self._usage: Dict[str, Dict] = {}
        for key in self.keys:
            self._usage[key] = {
                "count": 0,
                "date": date.today(),
                "exhausted": False,
            }

    def get_current_key(self) -> str:
        """Hozirgi faol kalitni qaytarish."""
        self._reset_if_new_day()

        # Tugagan kalitlarni o'tkazib yuborish
        attempts = 0
        while attempts < len(self.keys):
            key = self.keys[self.current_index]
            if not self._usage[key]["exhausted"]:
                return key
            self.current_index = (self.current_index + 1) % len(self.keys)
            attempts += 1

        # Barcha kalitlar tugagan — birinchisini qaytarish (xato beradi)
        logger.error("Barcha API kalitlar tugagan!")
        return self.keys[0]

    def rotate_key(self):
        """Keyingi kalitga o'tish (429 xatolikda chaqiriladi)."""
        old_key = self.keys[self.current_index]
        self._usage[old_key]["exhausted"] = True
        self.current_index = (self.current_index + 1) % len(self.keys)
        new_key = self.keys[self.current_index]
        logger.info(
            f"Kalit almashtirildi: ...{old_key[-6:]} -> ...{new_key[-6:]}"
        )

    def record_usage(self):
        """Muvaffaqiyatli so'rovni qayd qilish."""
        key = self.keys[self.current_index]
        self._usage[key]["count"] += 1

        if self._usage[key]["count"] >= self.daily_limit:
            self._usage[key]["exhausted"] = True
            logger.warning(f"Kalit ...{key[-6:]} kunlik limitga yetdi ({self.daily_limit})")

    def get_stats(self) -> dict:
        """API kalitlar statistikasi."""
        self._reset_if_new_day()
        stats = {
            "total_keys": len(self.keys),
            "current_index": self.current_index,
            "daily_limit_per_key": self.daily_limit,
            "total_daily_capacity": self.daily_limit * len(self.keys),
            "keys": [],
        }
        total_used = 0
        for i, key in enumerate(self.keys):
            usage = self._usage[key]
            total_used += usage["count"]
            stats["keys"].append({
                "index": i,
                "key_suffix": f"...{key[-6:]}",
                "used_today": usage["count"],
                "exhausted": usage["exhausted"],
                "is_current": i == self.current_index,
            })
        stats["total_used_today"] = total_used
        return stats

    def _reset_if_new_day(self):
        """Yangi kun boshlansa hisoblagichlarni nolga tushirish."""
        today = date.today()
        for key in self.keys:
            if self._usage[key]["date"] != today:
                self._usage[key] = {
                    "count": 0,
                    "date": today,
                    "exhausted": False,
                }
