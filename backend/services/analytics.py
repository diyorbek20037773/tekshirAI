"""Statistika va analitika servisi."""

import logging
from typing import Dict, List, Optional
from datetime import date, datetime, timedelta
from sqlalchemy import select, func, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.user import User
from backend.models.submission import Submission
from backend.models.classroom import Classroom, ClassroomStudent

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Dashboard va statistika uchun analitika."""

    async def get_dashboard_overview(self, session: AsyncSession, teacher_id: str) -> Dict:
        """O'qituvchi dashboard uchun umumiy statistika."""
        today = date.today()

        # O'qituvchining sinflari
        classrooms_result = await session.execute(
            select(Classroom).where(Classroom.teacher_id == teacher_id)
        )
        classrooms = classrooms_result.scalars().all()
        classroom_ids = [c.id for c in classrooms]

        if not classroom_ids:
            return {
                "total_students": 0,
                "total_classrooms": 0,
                "today_submissions": 0,
                "avg_score": 0,
                "recent_submissions": [],
            }

        # Jami o'quvchilar soni
        students_count = await session.execute(
            select(func.count()).select_from(ClassroomStudent)
            .where(ClassroomStudent.classroom_id.in_(classroom_ids))
        )
        total_students = students_count.scalar() or 0

        # Bugungi tekshiruvlar
        today_subs = await session.execute(
            select(func.count()).select_from(Submission)
            .where(
                and_(
                    Submission.classroom_id.in_(classroom_ids),
                    func.date(Submission.created_at) == today,
                    Submission.status == "completed"
                )
            )
        )
        today_submissions = today_subs.scalar() or 0

        # O'rtacha ball
        avg_result = await session.execute(
            select(func.avg(Submission.score)).where(
                and_(
                    Submission.classroom_id.in_(classroom_ids),
                    Submission.status == "completed"
                )
            )
        )
        avg_score = round(avg_result.scalar() or 0, 1)

        return {
            "total_students": total_students,
            "total_classrooms": len(classrooms),
            "today_submissions": today_submissions,
            "avg_score": avg_score,
        }

    async def get_recent_submissions(
        self,
        session: AsyncSession,
        teacher_id: str,
        limit: int = 20
    ) -> List[Dict]:
        """Oxirgi submissionlar."""
        classrooms_result = await session.execute(
            select(Classroom.id).where(Classroom.teacher_id == teacher_id)
        )
        classroom_ids = [row[0] for row in classrooms_result.all()]

        if not classroom_ids:
            return []

        result = await session.execute(
            select(Submission, User)
            .join(User, Submission.student_id == User.id)
            .where(
                and_(
                    Submission.classroom_id.in_(classroom_ids),
                    Submission.status == "completed"
                )
            )
            .order_by(desc(Submission.created_at))
            .limit(limit)
        )
        rows = result.all()

        return [
            {
                "id": str(sub.id),
                "student_name": user.full_name,
                "subject": sub.subject,
                "score": sub.score,
                "total_problems": sub.total_problems,
                "correct_count": sub.correct_count,
                "created_at": sub.created_at.isoformat(),
            }
            for sub, user in rows
        ]

    async def get_student_stats(self, session: AsyncSession, student_id: str) -> Dict:
        """O'quvchining shaxsiy statistikasi."""
        # Jami submissionlar
        total_result = await session.execute(
            select(func.count()).select_from(Submission)
            .where(
                and_(
                    Submission.student_id == student_id,
                    Submission.status == "completed"
                )
            )
        )
        total = total_result.scalar() or 0

        # O'rtacha ball
        avg_result = await session.execute(
            select(func.avg(Submission.score))
            .where(
                and_(
                    Submission.student_id == student_id,
                    Submission.status == "completed"
                )
            )
        )
        avg_score = round(avg_result.scalar() or 0, 1)

        # Zaif mavzular (oxirgi 10 ta submissiondan)
        recent = await session.execute(
            select(Submission.ai_result)
            .where(
                and_(
                    Submission.student_id == student_id,
                    Submission.status == "completed"
                )
            )
            .order_by(desc(Submission.created_at))
            .limit(10)
        )
        weak_topics = set()
        strong_topics = set()
        for (ai_result,) in recent.all():
            if ai_result:
                for topic in ai_result.get("weak_topics", []):
                    weak_topics.add(topic)

        return {
            "total_submissions": total,
            "avg_score": avg_score,
            "weak_topics": list(weak_topics)[:5],
            "strong_topics": list(strong_topics)[:5],
        }

    async def get_topic_errors(self, session: AsyncSession, teacher_id: str) -> List[Dict]:
        """Mavzu bo'yicha xatolar statistikasi (chart uchun)."""
        classrooms_result = await session.execute(
            select(Classroom.id).where(Classroom.teacher_id == teacher_id)
        )
        classroom_ids = [row[0] for row in classrooms_result.all()]

        if not classroom_ids:
            return []

        result = await session.execute(
            select(Submission.ai_result)
            .where(
                and_(
                    Submission.classroom_id.in_(classroom_ids),
                    Submission.status == "completed"
                )
            )
            .order_by(desc(Submission.created_at))
            .limit(100)
        )

        topic_errors = {}
        for (ai_result,) in result.all():
            if ai_result:
                for topic in ai_result.get("weak_topics", []):
                    topic_errors[topic] = topic_errors.get(topic, 0) + 1

        return [
            {"topic": topic, "count": count}
            for topic, count in sorted(topic_errors.items(), key=lambda x: -x[1])[:10]
        ]


    async def get_global_recent(self, session: AsyncSession, limit: int = 20) -> List[Dict]:
        """Barcha o'quvchilarning oxirgi tekshiruvlari (classroom filtersiz)."""
        result = await session.execute(
            select(Submission, User)
            .join(User, Submission.student_id == User.id)
            .where(Submission.status == "completed")
            .order_by(desc(Submission.created_at))
            .limit(limit)
        )
        rows = result.all()
        return [
            {
                "id": str(sub.id),
                "student_name": user.full_name,
                "student_gender": user.gender,
                "subject": sub.subject,
                "score": sub.score,
                "total_problems": sub.total_problems,
                "correct_count": sub.correct_count,
                "created_at": sub.created_at.isoformat(),
            }
            for sub, user in rows
        ]

    async def get_global_topic_errors(self, session: AsyncSession) -> List[Dict]:
        """Barcha mavzu xatolari (classroom filtersiz)."""
        result = await session.execute(
            select(Submission.ai_result)
            .where(Submission.status == "completed")
            .order_by(desc(Submission.created_at))
            .limit(100)
        )
        topic_errors = {}
        for (ai_result,) in result.all():
            if ai_result:
                for topic in ai_result.get("weak_topics", []):
                    topic_errors[topic] = topic_errors.get(topic, 0) + 1
        return [
            {"topic": topic, "count": count}
            for topic, count in sorted(topic_errors.items(), key=lambda x: -x[1])[:10]
        ]

    async def get_global_stats(self, session: AsyncSession) -> Dict:
        """Umumiy statistika."""
        today = date.today()

        total_students = await session.execute(
            select(func.count()).select_from(User).where(User.role == "student")
        )
        today_subs = await session.execute(
            select(func.count()).select_from(Submission).where(
                and_(func.date(Submission.created_at) == today, Submission.status == "completed")
            )
        )
        avg_result = await session.execute(
            select(func.avg(Submission.score)).where(Submission.status == "completed")
        )
        return {
            "total_students": total_students.scalar() or 0,
            "today_submissions": today_subs.scalar() or 0,
            "avg_score": round(avg_result.scalar() or 0, 1),
        }


analytics_service = AnalyticsService()
