"""Admin API — parol + maxfiy so'z bilan himoyalangan. Foydalanuvchilar, tekshiruvlar, direktorlar."""

import hashlib
import hmac
import secrets
from datetime import date, timedelta, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Header
from pydantic import BaseModel
from sqlalchemy import select, func, and_, desc, update
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from backend.config import settings
from backend.database import get_db
from backend.models.user import User
from backend.models.submission import Submission
from backend.models.rating import Rating


class RatingCreate(BaseModel):
    telegram_id: int = 0
    stars: int
    comment: str = ""


class AdminLogin(BaseModel):
    password: str
    secret: str


class UserUpdate(BaseModel):
    full_name: str | None = None
    username: str | None = None
    role: str | None = None
    gender: str | None = None
    grade: int | None = None
    class_letter: str | None = None
    subject: str | None = None
    viloyat: str | None = None
    tuman: str | None = None
    maktab: str | None = None
    phone_number: str | None = None


router = APIRouter(prefix="/api/admin", tags=["admin"])

# Tokenlar deterministik (HMAC) — restart ga chidamli
_admin_tokens: set[str] = set()


def _generate_admin_token() -> str:
    """Parol+secret asosida deterministik token yaratish (restart ga chidamli)."""
    pwd = settings.ADMIN_PASSWORD or ""
    sec = settings.ADMIN_SECRET or ""
    return hmac.new(sec.encode(), pwd.encode(), hashlib.sha256).hexdigest()


def verify_admin_token(x_admin_token: str = Header(...)):
    """Admin tokenni tekshirish (barcha endpointlar uchun)."""
    valid_token = _generate_admin_token()
    # Deterministik token YOKI in-memory token (eski sessionlar uchun)
    if x_admin_token != valid_token and x_admin_token not in _admin_tokens:
        raise HTTPException(status_code=403, detail="Admin huquqi yo'q")


@router.post("/login")
async def admin_login(data: AdminLogin):
    """Admin login — parol + maxfiy so'z bilan."""
    if not settings.ADMIN_PASSWORD or not settings.ADMIN_SECRET:
        raise HTTPException(status_code=500, detail="Admin login sozlanmagan (ADMIN_PASSWORD va ADMIN_SECRET o'rnating)")
    if data.password != settings.ADMIN_PASSWORD or data.secret != settings.ADMIN_SECRET:
        raise HTTPException(status_code=403, detail="Parol yoki maxfiy so'z noto'g'ri")
    # Deterministik token — restart bo'lganda ham ishlaydi
    token = _generate_admin_token()
    _admin_tokens.add(token)
    return {"token": token}


# ============================================================
# STATS
# ============================================================

@router.get("/stats")
async def get_admin_stats(_=Depends(verify_admin_token), db: AsyncSession = Depends(get_db)):
    """Real ro'yxatdan o'tish va tekshiruv statistikasi."""
    today = date.today()

    students = await db.execute(select(func.count()).select_from(User).where(User.role == "student"))
    teachers = await db.execute(select(func.count()).select_from(User).where(User.role == "teacher"))
    parents = await db.execute(select(func.count()).select_from(User).where(User.role == "parent"))
    directors = await db.execute(select(func.count()).select_from(User).where(User.role == "director"))

    students_count = students.scalar() or 0
    teachers_count = teachers.scalar() or 0
    parents_count = parents.scalar() or 0
    directors_count = directors.scalar() or 0

    today_users = await db.execute(
        select(func.count()).select_from(User).where(func.date(User.created_at) == today)
    )

    total_subs = await db.execute(
        select(func.count()).select_from(Submission).where(Submission.status == "completed")
    )
    today_subs = await db.execute(
        select(func.count()).select_from(Submission).where(
            and_(func.date(Submission.created_at) == today, Submission.status == "completed")
        )
    )

    viloyat_stats = await db.execute(
        select(User.viloyat, func.count()).select_from(User)
        .where(User.viloyat.isnot(None))
        .group_by(User.viloyat)
    )

    weekly = []
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        count_result = await db.execute(
            select(func.count()).select_from(User).where(func.date(User.created_at) == d)
        )
        weekly.append({"date": d.isoformat(), "count": count_result.scalar() or 0})

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


# ============================================================
# USERS — ro'yxat + edit + submission soni
# ============================================================

@router.get("/users")
async def get_admin_users(
    _=Depends(verify_admin_token),
    role: str = None,
    viloyat: str = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    """Barcha foydalanuvchilar ro'yxati + har birining submission soni."""
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if viloyat:
        query = query.where(User.viloyat == viloyat)

    result = await db.execute(query.order_by(User.created_at.desc()).limit(limit))
    users = result.scalars().all()

    user_list = []
    for u in users:
        sub_count = await db.execute(
            select(func.count()).select_from(Submission)
            .where(Submission.student_id == u.id, Submission.status == "completed")
        )
        user_list.append({
            "id": str(u.id),
            "telegram_id": u.telegram_id,
            "full_name": u.full_name,
            "username": u.username,
            "role": u.role,
            "gender": u.gender,
            "grade": u.grade,
            "class_letter": u.class_letter,
            "subject": u.subject,
            "viloyat": u.viloyat,
            "tuman": u.tuman,
            "maktab": u.maktab,
            "phone_number": u.phone_number if hasattr(u, 'phone_number') else None,
            "submission_count": sub_count.scalar() or 0,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })

    return user_list


@router.put("/users/{user_id}")
async def update_user(
    user_id: str,
    data: UserUpdate,
    _=Depends(verify_admin_token),
    db: AsyncSession = Depends(get_db),
):
    """Admin tomonidan foydalanuvchi ma'lumotlarini tahrirlash."""
    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")

    if data.full_name is not None:
        user.full_name = data.full_name
    if data.username is not None:
        user.username = data.username
    if data.role is not None:
        user.role = data.role
    if data.gender is not None:
        user.gender = data.gender
    if data.grade is not None:
        user.grade = data.grade
    if data.class_letter is not None:
        user.class_letter = data.class_letter
    if data.subject is not None:
        user.subject = data.subject
    if data.viloyat is not None:
        user.viloyat = data.viloyat
    if data.tuman is not None:
        user.tuman = data.tuman
    if data.maktab is not None:
        user.maktab = data.maktab
    if data.phone_number is not None:
        user.phone_number = data.phone_number

    user.updated_at = datetime.utcnow()
    await db.flush()

    return {"status": "updated", "message": f"{user.full_name} yangilandi"}


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    _=Depends(verify_admin_token),
    db: AsyncSession = Depends(get_db),
):
    """Admin tomonidan foydalanuvchini o'chirish."""
    result = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")

    name = user.full_name
    await db.delete(user)
    await db.flush()
    return {"status": "deleted", "message": f"{name} o'chirildi"}


# ============================================================
# RATINGS
# ============================================================

@router.post("/rating")
async def create_rating(data: RatingCreate, db: AsyncSession = Depends(get_db)):
    """Mini app ga baho berish (5 yulduz + izoh). Auth kerak emas."""
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
async def get_ratings(_=Depends(verify_admin_token), db: AsyncSession = Depends(get_db)):
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


# ============================================================
# DIRECTORS
# ============================================================

@router.get("/pending-directors")
async def get_pending_directors(_=Depends(verify_admin_token), db: AsyncSession = Depends(get_db)):
    """Tasdiqlanmagan direktorlar ro'yxati."""
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
    director_id: str = Query(...),
    approve: bool = Query(True),
    _=Depends(verify_admin_token),
    db: AsyncSession = Depends(get_db),
):
    """Direktorni tasdiqlash yoki rad etish."""
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


# ============================================================
# SUBMISSIONS STATS
# ============================================================

@router.get("/submissions-stats")
async def get_submissions_stats(_=Depends(verify_admin_token), db: AsyncSession = Depends(get_db)):
    """Tekshiruvlar bo'yicha batafsil statistika."""
    today = date.today()

    by_subject = await db.execute(
        select(Submission.subject, func.count(), func.avg(Submission.score))
        .where(Submission.status == "completed")
        .group_by(Submission.subject)
    )

    by_grade = await db.execute(
        select(Submission.grade, func.count(), func.avg(Submission.score))
        .where(Submission.status == "completed")
        .group_by(Submission.grade)
        .order_by(Submission.grade)
    )

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
async def get_active_users(_=Depends(verify_admin_token), db: AsyncSession = Depends(get_db)):
    """Eng faol foydalanuvchilar (ko'p tekshiruv yuborganlar)."""
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
