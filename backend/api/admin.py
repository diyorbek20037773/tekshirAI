"""Admin API — real foydalanuvchilar statistikasi + rating. Faqat 3 ta admin."""

from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select, func, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config import settings
from backend.database import get_db
from backend.models.user import User
from backend.models.submission import Submission
from backend.models.rating import Rating


class RatingCreate(BaseModel):
    telegram_id: int = 0
    stars: int
    comment: str = ""

router = APIRouter(prefix="/api/admin", tags=["admin"])


def verify_admin(telegram_id: int):
    """Admin telegram_id ni tekshirish."""
    if telegram_id not in settings.admin_telegram_ids:
        raise HTTPException(status_code=403, detail="Admin huquqi yo'q")


@router.get("/verify")
async def verify_admin_access(telegram_id: int = Query(...)):
    """Admin ekanligini tekshirish (admin panel login uchun)."""
    if telegram_id in settings.admin_telegram_ids:
        return {"is_admin": True, "telegram_id": telegram_id}
    raise HTTPException(status_code=403, detail="Admin huquqi yo'q")


@router.get("/stats")
async def get_admin_stats(telegram_id: int = Query(...), db: AsyncSession = Depends(get_db)):
    """Real ro'yxatdan o'tish va tekshiruv statistikasi."""
    verify_admin(telegram_id)
    today = date.today()

    # Rollar bo'yicha
    students = await db.execute(select(func.count()).select_from(User).where(User.role == "student"))
    teachers = await db.execute(select(func.count()).select_from(User).where(User.role == "teacher"))
    parents = await db.execute(select(func.count()).select_from(User).where(User.role == "parent"))
    directors = await db.execute(select(func.count()).select_from(User).where(User.role == "director"))

    students_count = students.scalar() or 0
    teachers_count = teachers.scalar() or 0
    parents_count = parents.scalar() or 0
    directors_count = directors.scalar() or 0

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

    # Haftalik ro'yxatdan o'tish dinamikasi (oxirgi 7 kun)
    weekly = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        count_result = await db.execute(
            select(func.count()).select_from(User).where(func.date(User.created_at) == d)
        )
        weekly.append({"date": d.isoformat(), "count": count_result.scalar() or 0})

    # Rol bo'yicha bugungi
    today_by_role = {}
    for role_name in ["student", "teacher", "parent", "director"]:
        r = await db.execute(
            select(func.count()).select_from(User).where(
                func.date(User.created_at) == today, User.role == role_name
            )
        )
        today_by_role[role_name] = r.scalar() or 0

    return {
        "students": students_count,
        "teachers": teachers_count,
        "parents": parents_count,
        "directors": directors_count,
        "total_users": students_count + teachers_count + parents_count + directors_count,
        "today_registrations": today_users.scalar() or 0,
        "today_by_role": today_by_role,
        "total_submissions": total_subs.scalar() or 0,
        "today_submissions": today_subs.scalar() or 0,
        "by_viloyat": [{"viloyat": row[0], "count": row[1]} for row in viloyat_stats.all()],
        "weekly_registrations": weekly,
    }


@router.get("/users")
async def get_admin_users(
    telegram_id: int = Query(...),
    role: str = None,
    viloyat: str = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
):
    """Barcha foydalanuvchilar ro'yxati (filtr bilan)."""
    verify_admin(telegram_id)

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
            "telegram_id": u.telegram_id,
            "full_name": u.full_name,
            "username": u.username,
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
async def get_ratings(telegram_id: int = Query(...), db: AsyncSession = Depends(get_db)):
    """Barcha baholar va o'rtacha reyting."""
    verify_admin(telegram_id)

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


@router.get("/pending-directors")
async def get_pending_directors(telegram_id: int = Query(...), db: AsyncSession = Depends(get_db)):
    """Tasdiqlanmagan direktorlar ro'yxati."""
    verify_admin(telegram_id)

    result = await db.execute(
        select(User).where(User.role == "director", User.is_approved == False)
        .order_by(User.created_at.desc())
    )
    directors = result.scalars().all()

    return [
        {
            "id": str(d.id),
            "telegram_id": d.telegram_id,
            "full_name": d.full_name,
            "username": d.username,
            "viloyat": d.viloyat,
            "tuman": d.tuman,
            "maktab": d.maktab,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in directors
    ]


@router.post("/approve-director")
async def approve_director(
    telegram_id: int = Query(...),
    director_id: str = Query(...),
    approve: bool = Query(True),
    db: AsyncSession = Depends(get_db),
):
    """Direktorni tasdiqlash yoki rad etish."""
    verify_admin(telegram_id)

    from uuid import UUID
    result = await db.execute(select(User).where(User.id == UUID(director_id)))
    director = result.scalar_one_or_none()

    if not director:
        raise HTTPException(status_code=404, detail="Direktor topilmadi")

    if approve:
        director.is_approved = True
        await db.flush()
        return {"status": "approved", "message": f"{director.full_name} tasdiqlandi"}
    else:
        await db.delete(director)
        await db.flush()
        return {"status": "rejected", "message": f"{director.full_name} rad etildi"}


@router.get("/submissions-stats")
async def get_submissions_stats(telegram_id: int = Query(...), db: AsyncSession = Depends(get_db)):
    """Tekshiruvlar bo'yicha batafsil statistika."""
    verify_admin(telegram_id)
    today = date.today()

    # Fan bo'yicha
    by_subject = await db.execute(
        select(Submission.subject, func.count(), func.avg(Submission.score))
        .where(Submission.status == "completed")
        .group_by(Submission.subject)
    )

    # Sinf bo'yicha
    by_grade = await db.execute(
        select(Submission.grade, func.count(), func.avg(Submission.score))
        .where(Submission.status == "completed")
        .group_by(Submission.grade)
        .order_by(Submission.grade)
    )

    # Kunlik trend (oxirgi 14 kun)
    daily_subs = []
    for i in range(13, -1, -1):
        d = today - timedelta(days=i)
        count_result = await db.execute(
            select(func.count()).select_from(Submission).where(
                and_(func.date(Submission.created_at) == d, Submission.status == "completed")
            )
        )
        avg_result = await db.execute(
            select(func.avg(Submission.score)).select_from(Submission).where(
                and_(func.date(Submission.created_at) == d, Submission.status == "completed")
            )
        )
        daily_subs.append({
            "date": d.isoformat(),
            "count": count_result.scalar() or 0,
            "avg_score": round(avg_result.scalar() or 0, 1),
        })

    # Oxirgi 20 ta tekshiruv
    recent = await db.execute(
        select(Submission, User.full_name, User.username, User.grade.label("user_grade"), User.maktab)
        .join(User, Submission.student_id == User.id)
        .where(Submission.status == "completed")
        .order_by(desc(Submission.created_at))
        .limit(20)
    )

    recent_list = []
    for row in recent.all():
        sub = row[0]
        recent_list.append({
            "id": str(sub.id),
            "student_name": row[1],
            "username": row[2],
            "grade": row[3],
            "maktab": row[4],
            "subject": sub.subject,
            "score": sub.score,
            "total_problems": sub.total_problems,
            "correct_count": sub.correct_count,
            "created_at": sub.created_at.isoformat() if sub.created_at else None,
        })

    # O'rtacha ball
    overall_avg = await db.execute(
        select(func.avg(Submission.score)).where(Submission.status == "completed")
    )

    return {
        "by_subject": [
            {"subject": row[0] or "Noma'lum", "count": row[1], "avg_score": round(row[2] or 0, 1)}
            for row in by_subject.all()
        ],
        "by_grade": [
            {"grade": row[0], "count": row[1], "avg_score": round(row[2] or 0, 1)}
            for row in by_grade.all() if row[0]
        ],
        "daily_trend": daily_subs,
        "recent": recent_list,
        "overall_avg_score": round(overall_avg.scalar() or 0, 1),
    }


@router.get("/active-users")
async def get_active_users(telegram_id: int = Query(...), db: AsyncSession = Depends(get_db)):
    """Eng faol foydalanuvchilar (ko'p tekshiruv yuborganlar)."""
    verify_admin(telegram_id)

    result = await db.execute(
        select(
            User.full_name,
            User.username,
            User.role,
            User.grade,
            User.maktab,
            User.viloyat,
            func.count(Submission.id).label("sub_count"),
            func.avg(Submission.score).label("avg_score"),
        )
        .join(Submission, Submission.student_id == User.id)
        .where(Submission.status == "completed")
        .group_by(User.id, User.full_name, User.username, User.role, User.grade, User.maktab, User.viloyat)
        .order_by(desc("sub_count"))
        .limit(20)
    )

    return [
        {
            "full_name": row[0],
            "username": row[1],
            "role": row[2],
            "grade": row[3],
            "maktab": row[4],
            "viloyat": row[5],
            "submission_count": row[6],
            "avg_score": round(row[7] or 0, 1),
        }
        for row in result.all()
    ]
