"""
Gamification tizimi — XP, Level, Streak, Nishonlar, Leaderboard.
Bolalarni o'rganishga rag'batlantirish.
"""

import logging
from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.user import User, UserGameProfile

logger = logging.getLogger(__name__)

# === DARAJALAR ===
LEVELS = [
    {"level": 1, "name": "Boshlang'ich", "xp_required": 0, "emoji": "🌱"},
    {"level": 2, "name": "Harakat qiluvchi", "xp_required": 100, "emoji": "⭐"},
    {"level": 3, "name": "Bilimdon", "xp_required": 300, "emoji": "📚"},
    {"level": 4, "name": "Ustoz yo'lida", "xp_required": 600, "emoji": "🎯"},
    {"level": 5, "name": "Akademik", "xp_required": 1000, "emoji": "🏅"},
    {"level": 6, "name": "Professor", "xp_required": 2000, "emoji": "🎓"},
    {"level": 7, "name": "Olim", "xp_required": 5000, "emoji": "🧪"},
]

# === NISHONLAR ===
BADGES = {
    "birinchi_qadam": {"name": "Birinchi qadam", "emoji": "⭐", "description": "1-chi vazifani tekshirish"},
    "hafta_yulduzi": {"name": "Hafta yulduzi", "emoji": "🌟", "description": "7 kunlik streak"},
    "xatosiz_kun": {"name": "Xatosiz kun", "emoji": "💎", "description": "1 kunda barcha masalalar to'g'ri"},
    "matematik": {"name": "Matematik", "emoji": "🧮", "description": "50 ta math masala to'g'ri"},
    "sorovchi": {"name": "So'rovchi", "emoji": "🤔", "description": "AI dan 10 marta so'rash"},
    "oy_chempioni": {"name": "Oy chempioni", "emoji": "🏆", "description": "30 kunlik streak"},
    "sinf_yulduzi": {"name": "Sinf yulduzi", "emoji": "👑", "description": "Sinfda 1-o'rin"},
    "yuz_ball": {"name": "Yuz ball", "emoji": "💯", "description": "10 marta 100% ball olish"},
}

# === XP QIYMATLARI ===
XP_SUBMISSION = 10
XP_ON_TIME = 5
XP_ALL_CORRECT = 15
XP_CHAT = 5
XP_WEEKLY_STREAK = 50


class GamificationService:
    """Gamification logikasi — XP, level, streak, badges."""

    async def process_submission(
        self,
        session: AsyncSession,
        user: User,
        score_percentage: float,
        correct_count: int,
        total_problems: int
    ) -> Dict:
        """
        Submission dan keyin gamification yangilash.
        Returns: {"xp_earned": int, "new_level": bool, "new_badges": list, "streak": int}
        """
        profile = await self._get_or_create_profile(session, user)
        result = {
            "xp_earned": 0,
            "new_level": False,
            "old_level": profile.level,
            "new_badges": [],
            "streak": profile.streak_days,
        }

        # XP hisoblash
        xp = XP_SUBMISSION  # Har bir tekshiruv uchun
        if score_percentage == 100:
            xp += XP_ALL_CORRECT

        result["xp_earned"] = xp
        profile.xp += xp
        profile.total_submissions += 1
        profile.total_correct += correct_count

        # Level tekshirish
        new_level = self._calculate_level(profile.xp)
        if new_level > profile.level:
            profile.level = new_level
            result["new_level"] = True

        # Streak yangilash
        streak_result = self._update_streak(profile)
        result["streak"] = profile.streak_days
        if streak_result.get("weekly_bonus"):
            profile.xp += XP_WEEKLY_STREAK
            result["xp_earned"] += XP_WEEKLY_STREAK

        # Nishonlar tekshirish
        new_badges = self._check_badges(profile, score_percentage, total_problems)
        if new_badges:
            current_badges = profile.badges or []
            for badge_id in new_badges:
                if badge_id not in current_badges:
                    current_badges.append(badge_id)
                    result["new_badges"].append(BADGES[badge_id])
            profile.badges = current_badges

        await session.flush()
        return result

    async def process_chat(self, session: AsyncSession, user: User) -> int:
        """AI suhbat uchun XP berish. Returns: earned XP."""
        profile = await self._get_or_create_profile(session, user)
        profile.xp += XP_CHAT
        new_level = self._calculate_level(profile.xp)
        if new_level > profile.level:
            profile.level = new_level
        await session.flush()
        return XP_CHAT

    async def get_leaderboard(
        self,
        session: AsyncSession,
        classroom_id: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict]:
        """Sinf yoki umumiy leaderboard."""
        query = (
            select(User, UserGameProfile)
            .join(UserGameProfile, User.id == UserGameProfile.user_id)
            .where(User.role == "student")
            .order_by(desc(UserGameProfile.xp))
            .limit(limit)
        )

        result = await session.execute(query)
        rows = result.all()

        leaderboard = []
        for i, (user, profile) in enumerate(rows, 1):
            medal = {1: "🥇", 2: "🥈", 3: "🥉"}.get(i, f"{i}.")
            level_info = self._get_level_info(profile.level)
            leaderboard.append({
                "rank": i,
                "medal": medal,
                "name": user.full_name,
                "xp": profile.xp,
                "level": profile.level,
                "level_name": level_info["name"],
                "level_emoji": level_info["emoji"],
                "streak": profile.streak_days,
            })
        return leaderboard

    async def get_profile_stats(self, session: AsyncSession, user: User) -> Dict:
        """O'quvchining gamification profili."""
        profile = await self._get_or_create_profile(session, user)
        level_info = self._get_level_info(profile.level)
        next_level = self._get_level_info(profile.level + 1) if profile.level < 7 else None

        return {
            "xp": profile.xp,
            "level": profile.level,
            "level_name": level_info["name"],
            "level_emoji": level_info["emoji"],
            "xp_to_next": next_level["xp_required"] - profile.xp if next_level else 0,
            "next_level_name": next_level["name"] if next_level else "MAX",
            "streak_days": profile.streak_days,
            "badges": [
                {**BADGES[b], "id": b}
                for b in (profile.badges or [])
                if b in BADGES
            ],
            "total_correct": profile.total_correct,
            "total_submissions": profile.total_submissions,
        }

    # === PRIVATE METHODS ===

    async def _get_or_create_profile(self, session: AsyncSession, user: User) -> UserGameProfile:
        """Profil olish yoki yaratish."""
        result = await session.execute(
            select(UserGameProfile).where(UserGameProfile.user_id == user.id)
        )
        profile = result.scalar_one_or_none()

        if not profile:
            profile = UserGameProfile(user_id=user.id)
            session.add(profile)
            await session.flush()

        return profile

    def _calculate_level(self, xp: int) -> int:
        """XP ga qarab darajani hisoblash."""
        level = 1
        for lvl in LEVELS:
            if xp >= lvl["xp_required"]:
                level = lvl["level"]
        return level

    def _get_level_info(self, level: int) -> Dict:
        """Daraja ma'lumotlarini olish."""
        for lvl in LEVELS:
            if lvl["level"] == level:
                return lvl
        return LEVELS[0]

    def _update_streak(self, profile: UserGameProfile) -> Dict:
        """Streak yangilash."""
        today = date.today()
        result = {"weekly_bonus": False}

        if profile.streak_last_date is None:
            # Birinchi marta
            profile.streak_days = 1
            profile.streak_last_date = today
            return result

        days_diff = (today - profile.streak_last_date).days

        if days_diff == 0:
            # Bugun allaqachon tekshirilgan
            return result
        elif days_diff == 1:
            # Ketma-ket kun
            profile.streak_days += 1
            profile.streak_last_date = today
        elif days_diff == 2 and today.weekday() == 0:
            # Yakshanba o'tkazib yuborilgan (dam olish kuni)
            profile.streak_days += 1
            profile.streak_last_date = today
        else:
            # Streak buzildi
            if not profile.streak_shield_used:
                # Streak himoya ishlatish
                profile.streak_shield_used = True
                profile.streak_days += 1
                profile.streak_last_date = today
            else:
                profile.streak_days = 1
                profile.streak_last_date = today

        # Haftalik bonus
        if profile.streak_days > 0 and profile.streak_days % 7 == 0:
            result["weekly_bonus"] = True

        return result

    def _check_badges(
        self,
        profile: UserGameProfile,
        score_percentage: float,
        total_problems: int
    ) -> List[str]:
        """Yangi nishonlarni tekshirish."""
        new_badges = []
        current = profile.badges or []

        # Birinchi qadam
        if profile.total_submissions == 1 and "birinchi_qadam" not in current:
            new_badges.append("birinchi_qadam")

        # Hafta yulduzi
        if profile.streak_days >= 7 and "hafta_yulduzi" not in current:
            new_badges.append("hafta_yulduzi")

        # Oy chempioni
        if profile.streak_days >= 30 and "oy_chempioni" not in current:
            new_badges.append("oy_chempioni")

        # Xatosiz kun
        if score_percentage == 100 and total_problems >= 3 and "xatosiz_kun" not in current:
            new_badges.append("xatosiz_kun")

        # Matematik
        if profile.total_correct >= 50 and "matematik" not in current:
            new_badges.append("matematik")

        return new_badges


# Singleton instance
gamification_service = GamificationService()
