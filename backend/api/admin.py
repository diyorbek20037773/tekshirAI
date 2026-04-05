"""Admin API — real foydalanuvchilar statistikasi + rating."""

from datetime import date
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User
from backend.models.submission import Submission
from backend.models.rating import Rating


class RatingCreate(BaseModel):
    telegram_id: int = 0
    stars: int
    comment: str = ""

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats")
async def get_admin_stats(db: AsyncSession = Depends(get_db)):
    """Real ro'yxatdan o'tish va tekshiruv statistikasi."""
    today = date.today()

    # Rollar bo'yicha
    students = await db.execute(select(func.count()).select_from(User).where(User.role == "student"))
    teachers = await db.execute(select(func.count()).select_from(User).where(User.role == "teacher"))
    parents = await db.execute(select(func.count()).select_from(User).where(User.role == "parent"))

    # Bugungi
    today_users = await db.execute(
        select(func.count()).select_from(User).where(func.date(User.created_at) == today)
    )

    # Tekshiruvlar
    total_subs = await db.execute(
        select(func.count()).select_from(Submission).where(Submission.status == "completed")
    )
    today_subs = await db.execute(
        select(func.count()).select_from(Submission).where(
            and_(func.date(Submission.created_at) == today, Submission.status == "completed")
        )
    )

    # Viloyat bo'yicha
    viloyat_stats = await db.execute(
        select(User.viloyat, func.count()).select_from(User)
        .where(User.viloyat.isnot(None))
        .group_by(User.viloyat)
    )

    return {
        "students": students.scalar() or 0,
        "teachers": teachers.scalar() or 0,
        "parents": parents.scalar() or 0,
        "total_users": (students.scalar() or 0) + (teachers.scalar() or 0) + (parents.scalar() or 0),
        "today_registrations": today_users.scalar() or 0,
        "total_submissions": total_subs.scalar() or 0,
        "today_submissions": today_subs.scalar() or 0,
        "by_viloyat": [{"viloyat": row[0], "count": row[1]} for row in viloyat_stats.all()],
    }


@router.get("/users")
async def get_admin_users(
    role: str = None,
    viloyat: str = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """Barcha foydalanuvchilar ro'yxati (filtr bilan)."""
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if viloyat:
        query = query.where(User.viloyat == viloyat)

    result = await db.execute(query.order_by(User.created_at.desc()).limit(limit))
    users = result.scalars().all()

    return [
        {
            "id": str(u.id),
            "full_name": u.full_name,
            "role": u.role,
            "gender": u.gender,
            "grade": u.grade,
            "subject": u.subject,
            "viloyat": u.viloyat,
            "tuman": u.tuman,
            "maktab": u.maktab,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.post("/rating")
async def create_rating(data: RatingCreate, db: AsyncSession = Depends(get_db)):
    """Mini app ga baho berish (5 yulduz + izoh)."""
    user = None
    if data.telegram_id:
        result = await db.execute(select(User).where(User.telegram_id == data.telegram_id).limit(1))
        user = result.scalars().first()

    rating = Rating(
        user_id=user.id if user else None,
        telegram_id=data.telegram_id,
        stars=max(1, min(5, data.stars)),
        comment=data.comment[:500] if data.comment else "",
    )
    db.add(rating)
    await db.flush()
    return {"status": "saved", "stars": rating.stars}


@router.get("/ratings")
async def get_ratings(db: AsyncSession = Depends(get_db)):
    """Barcha baholar va o'rtacha reyting."""
    result = await db.execute(select(Rating).order_by(desc(Rating.created_at)).limit(50))
    ratings = result.scalars().all()

    avg_result = await db.execute(select(func.avg(Rating.stars)))
    avg = round(avg_result.scalar() or 0, 1)

    total = await db.execute(select(func.count()).select_from(Rating))

    return {
        "average": avg,
        "total": total.scalar() or 0,
        "ratings": [
            {
                "stars": r.stars,
                "comment": r.comment,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in ratings
        ],
    }
