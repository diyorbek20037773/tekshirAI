"""
Gemini API kalitlarni boshqarish — random tanlash + smart cooldown.
- Random kalit tanlash (bitta kalit bloklab qolmaydi)
- Rate limit (429) — kalitga 60s cooldown
- Invalid (400 API_KEY_INVALID) — kalit umuman ishlatilmaydi
- Daily limit — kalit ertaga qayta ishlatiladi
"""

import logging
import random
import time
from datetime import date
from typing import List, Dict

from backend.config import settings

logger = logging.getLogger(__name__)


class KeyManager:
    """Gemini API kalitlarni boshqarish."""

    RATE_LIMIT_COOLDOWN = 70  # 429 keyin necha sekund kutish (Gemini 60s tavsiya qiladi)

    def __init__(self):
        self.keys: List[str] = settings.gemini_keys
        if not self.keys:
            raise ValueError("GEMINI_API_KEYS .env da topilmadi!")

        self.current_key: str = self.keys[0]  # Hozirgi tanlangan kalit
        self.daily_limit: int = 250  # Har bir kalit uchun kunlik limit

        # Har bir kalit uchun statistika
        self._usage: Dict[str, Dict] = {}
        for key in self.keys:
            self._usage[key] = {
                "count": 0,
                "date": date.today(),
                "exhausted": False,        # Kunlik limit tugagan
                "rate_limited_until": 0,   # Rate limit tugaydigan vaqt (timestamp)
                "invalid": False,          # API kalit noto'g'ri (umuman ishlatmaslik)
            }

    def _is_available(self, key: str) -> bool:
        """Kalit hozir ishlatilishi mumkinmi?"""
        u = self._usage[key]
        if u["invalid"]:
            return False
        if u["exhausted"]:
            return False
        if u["rate_limited_until"] > time.time():
            return False
        return True

    def get_current_key(self) -> str:
        """Tasodifiy ishlatilishi mumkin bo'lgan kalitni qaytarish."""
        self._reset_if_new_day()

        available = [k for k in self.keys if self._is_available(k)]

        if not available:
            # Hech qaysi kalit ishlamayapti — eng erta cooldown tugaydigan kalit
            now = time.time()
            valid_keys = [k for k in self.keys if not self._usage[k]["invalid"] and not self._usage[k]["exhausted"]]
            if valid_keys:
                # Cooldown da bo'lganlardan eng yaqin tugaydiganini tanlash
                soonest = min(valid_keys, key=lambda k: self._usage[k]["rate_limited_until"])
                wait = max(0, self._usage[soonest]["rate_limited_until"] - now)
                logger.warning(f"Barcha kalitlar band! Eng yaqini ...{soonest[-6:]} ({wait:.0f}s kuting)")
                self.current_key = soonest
                return soonest
            # Umuman ishlamaydi — birinchi kalitni qaytarish (xato beradi)
            logger.error("Barcha API kalitlar invalid yoki exhausted!")
            self.current_key = self.keys[0]
            return self.keys[0]

        # Random tanlash — bitta kalitga zo'r berib bloklanib qolmaslik
        chosen = random.choice(available)
        self.current_key = chosen
        return chosen

    def mark_rate_limited(self, key: str = None):
        """Kalit 429 oldi — cooldown ga qo'yish."""
        k = key or self.current_key
        if k not in self._usage:
            return
        self._usage[k]["rate_limited_until"] = time.time() + self.RATE_LIMIT_COOLDOWN
        logger.warning(f"Kalit ...{k[-6:]} rate limited, {self.RATE_LIMIT_COOLDOWN}s cooldown")

    def mark_invalid(self, key: str = None):
        """Kalit umuman ishlamayapti (400 API_KEY_INVALID) — qora ro'yxatga qo'shish."""
        k = key or self.current_key
        if k not in self._usage:
            return
        self._usage[k]["invalid"] = True
        logger.error(f"Kalit ...{k[-6:]} INVALID — endi ishlatilmaydi")

    def get_cooldown_wait(self) -> float:
        """Eng yaqin kalit qachon ozod bo'ladi (sekund). 0 — hozir mavjud."""
        self._reset_if_new_day()
        now = time.time()
        if any(self._is_available(k) for k in self.keys):
            return 0
        valid_keys = [k for k in self.keys if not self._usage[k]["invalid"] and not self._usage[k]["exhausted"]]
        if not valid_keys:
            return -1  # umuman kalit yo'q
        soonest = min(self._usage[k]["rate_limited_until"] for k in valid_keys)
        return max(0, soonest - now)

    def rotate_key(self):
        """Eski API ga moslik — hozirgi kalitni cooldownga qo'yib, yangi tanlash."""
        self.mark_rate_limited(self.current_key)
        return self.get_current_key()

    def record_usage(self):
        """Muvaffaqiyatli so'rovni qayd qilish."""
        key = self.current_key
        self._usage[key]["count"] += 1

        if self._usage[key]["count"] >= self.daily_limit:
            self._usage[key]["exhausted"] = True
            logger.warning(f"Kalit ...{key[-6:]} kunlik limitga yetdi ({self.daily_limit})")

    def get_stats(self) -> dict:
        """API kalitlar statistikasi."""
        self._reset_if_new_day()
        now = time.time()
        stats = {
            "total_keys": len(self.keys),
            "daily_limit_per_key": self.daily_limit,
            "total_daily_capacity": self.daily_limit * len(self.keys),
            "keys": [],
        }
        total_used = 0
        for i, key in enumerate(self.keys):
            usage = self._usage[key]
            total_used += usage["count"]
            cooldown_remaining = max(0, usage["rate_limited_until"] - now)
            stats["keys"].append({
                "index": i,
                "key_suffix": f"...{key[-6:]}",
                "used_today": usage["count"],
                "exhausted": usage["exhausted"],
                "invalid": usage["invalid"],
                "cooldown_seconds": int(cooldown_remaining),
                "available": self._is_available(key),
                "is_current": key == self.current_key,
            })
        stats["total_used_today"] = total_used
        stats["available_keys"] = sum(1 for k in self.keys if self._is_available(k))
        return stats

    def _reset_if_new_day(self):
        """Yangi kun boshlansa hisoblagichlarni nolga tushirish (invalid kalitlar saqlanadi)."""
        today = date.today()
        for key in self.keys:
            if self._usage[key]["date"] != today:
                was_invalid = self._usage[key]["invalid"]
                self._usage[key] = {
                    "count": 0,
                    "date": today,
                    "exhausted": False,
                    "rate_limited_until": 0,
                    "invalid": was_invalid,  # Invalid kalit invalid qoladi
                }
