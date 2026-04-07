"""Mini App foydalanuvchilar — ro'yxatdan o'tish, profil, ota-ona bog'lash."""

from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query as Q
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User, UserGameProfile
from backend.models.submission import Submission

router = APIRouter(prefix="/api/users", tags=["users"])


# === Schemas ===

class UserRegister(BaseModel):
    telegram_id: int
    username: str | None = None
    full_name: str
    role: str  # student, teacher, parent, director
    gender: str | None = None  # male, female
    grade: int | None = None
    class_letter: str | None = None  # A, B, C, D, F
    subject: str | None = None
    viloyat: str | None = None
    tuman: str | None = None
    maktab: str | None = None
    phone_number: str | None = None
    teacher_class: str | None = None


class UserResponse(BaseModel):
    id: str
    telegram_id: int
    username: str | None
    full_name: str
    role: str
    gender: str | None = None
    grade: int | None
    class_letter: str | None = None
    subject: str | None
    viloyat: str | None = None
    tuman: str | None = None
    maktab: str | None = None
    is_premium: bool
    xp: int = 0
    level: int = 1
    streak_days: int = 0
    badges: list = []
    is_approved: bool = True
    parent_id: str | None = None
    pending_parent_username: str | None = None

    class Config:
        from_attributes = True


class LinkRequest(BaseModel):
    parent_telegram_id: int
    child_username: str


class ConfirmLink(BaseModel):
    child_telegram_id: int
    confirm: bool


class UserSearch(BaseModel):
    username: str
    full_name: str
    grade: int | None
    role: str


# === Helpers ===

async def find_user_by_telegram_id(telegram_id: int, db: AsyncSession, role: str = None) -> User | None:
    query = select(User).where(User.telegram_id == telegram_id)
    if role:
        query = query.where(User.role == role)
    result = await db.execute(query.order_by(User.created_at.desc()))
    return result.scalars().first()


def user_to_response(user: User) -> dict:
    gp = user.game_profile
    return {
        "id": str(user.id),
        "telegram_id": user.telegram_id,
        "username": user.username,
        "full_name": user.full_name,
        "role": user.role,
        "gender": user.gender,
        "grade": user.grade,
        "class_letter": user.class_letter,
        "subject": user.subject,
        "viloyat": user.viloyat,
        "tuman": user.tuman,
        "maktab": user.maktab,
        "is_approved": user.is_approved if hasattr(user, 'is_approved') else True,
        "is_premium": user.is_premium,
        "xp": gp.xp if gp else 0,
        "level": gp.level if gp else 1,
        "streak_days": gp.streak_days if gp else 0,
        "badges": gp.badges if gp else [],
        "parent_id": str(user.parent_id) if user.parent_id else None,
        "pending_parent_username": None,
    }


# === Endpoints ===

@router.post("/register", response_model=UserResponse)
async def register_user(data: UserRegister, db: AsyncSession = Depends(get_db)):
    """Mini App dan ro'yxatdan o'tish. Agar mavjud bo'lsa — profilni yangilaydi."""

    if data.role not in ("student", "teacher", "parent", "director"):
        raise HTTPException(status_code=400, detail="Noto'g'ri rol")

    existing = await find_user_by_telegram_id(data.telegram_id, db, role=data.role)
    if existing:
        existing.full_name = data.full_name
        if data.username:
            existing.username = data.username
        if data.gender:
            existing.gender = data.gender
        if data.grade is not None:
            existing.grade = data.grade
        if data.class_letter:
            existing.class_letter = data.class_letter
        if data.subject:
            existing.subject = data.subject
        if data.viloyat:
            existing.viloyat = data.viloyat
        if data.tuman:
            existing.tuman = data.tuman
        if data.maktab:
            existing.maktab = data.maktab
        if data.phone_number:
            existing.phone_number = data.phone_number
        existing.updated_at = datetime.utcnow()
        await db.flush()
        return user_to_response(existing)

    # Yangi user yaratish
    user = User(
        telegram_id=data.telegram_id,
        username=data.username,
        full_name=data.full_name,
        role=data.role,
        gender=data.gender,
        grade=data.grade,
        class_letter=data.class_letter,
        subject=data.subject,
        viloyat=data.viloyat,
        tuman=data.tuman,
        maktab=data.maktab,
        phone_number=data.phone_number,
        is_approved=data.role != "director",  # Direktor admin tasdiqlashi kerak
        daily_reset_date=date.today(),
    )
    db.add(user)
    await db.flush()

    # Student uchun game profile
    if data.role == "student":
        game_profile = UserGameProfile(
            user_id=user.id,
            xp=0,
            level=1,
            streak_days=0,
            badges=[],
            total_correct=0,
            total_submissions=0,
        )
        db.add(game_profile)
        await db.flush()

    # Reload with relationships
    result = await db.execute(select(User).where(User.id == user.id))
    user = result.scalar_one()

    return user_to_response(user)


@router.get("/roles")
async def get_user_roles(telegram_id: int, db: AsyncSession = Depends(get_db)):
    """Telegram ID bo'yicha barcha rollarni qaytarish (auto-login uchun)."""
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id).order_by(User.created_at)
    )
    users = result.scalars().all()

    return {
        "roles": [
            {
                "role": u.role,
                "id": str(u.id),
                "full_name": u.full_name,
                "grade": u.grade,
                "class_letter": u.class_letter,
                "gender": u.gender,
                "subject": u.subject,
                "viloyat": u.viloyat,
                "tuman": u.tuman,
                "maktab": u.maktab,
            }
            for u in users
        ]
    }


@router.get("/me")
async def get_me(telegram_id: int, role: str = None, db: AsyncSession = Depends(get_db)):
    """Telegram ID bo'yicha profil olish."""
    user = await find_user_by_telegram_id(telegram_id, db, role=role)
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")
    return user_to_response(user)


@router.get("/search")
async def search_user(username: str, db: AsyncSession = Depends(get_db)):
    """Username bo'yicha foydalanuvchi qidirish (ota-ona uchun)."""
    cleaned = username.replace("@", "").strip().lower()
    if not cleaned:
        raise HTTPException(status_code=400, detail="Username kiriting")

    result = await db.execute(
        select(User).where(
            User.username.ilike(cleaned),
            User.role == "student",
        )
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")

    return {
        "id": str(user.id),
        "username": user.username,
        "full_name": user.full_name,
        "grade": user.grade,
        "role": user.role,
    }


@router.post("/link-parent")
async def link_parent(data: LinkRequest, db: AsyncSession = Depends(get_db)):
    """Ota-ona farzandga bog'lanish so'rovi yuboradi."""
    parent = await find_user_by_telegram_id(data.parent_telegram_id, db, role="parent")
    if not parent:
        raise HTTPException(status_code=400, detail="Ota-ona topilmadi")

    cleaned = data.child_username.replace("@", "").strip().lower()
    result = await db.execute(
        select(User).where(
            User.username.ilike(cleaned),
            User.role == "student",
        )
    )
    child = result.scalar_one_or_none()
    if not child:
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")

    if child.parent_id:
        raise HTTPException(status_code=400, detail="Bu o'quvchi allaqachon bog'langan")

    # Agar ota-ona va farzand bitta telegram_id bo'lsa — avtomatik tasdiqlash
    if child.telegram_id == parent.telegram_id:
        child.parent_id = parent.id
        await db.flush()
        return {
            "status": "confirmed",
            "message": f"{child.full_name} avtomatik bog'landi",
            "child_name": child.full_name,
            "child_grade": child.grade,
        }

    child.pending_parent_id = parent.id
    await db.flush()

    return {
        "status": "pending",
        "message": f"{child.full_name} ga tasdiqlash so'rovi yuborildi",
        "child_name": child.full_name,
        "child_grade": child.grade,
    }


@router.get("/pending-parent")
async def get_pending_parent(telegram_id: int, db: AsyncSession = Depends(get_db)):
    """O'quvchi uchun — kutilayotgan ota-ona so'rovini ko'rish."""
    user = await find_user_by_telegram_id(telegram_id, db, role="student")
    if not user:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")

    if not user.pending_parent_id:
        return {"has_pending": False}

    result = await db.execute(select(User).where(User.id == user.pending_parent_id))
    parent = result.scalar_one_or_none()

    if not parent:
        return {"has_pending": False}

    return {
        "has_pending": True,
        "parent_name": parent.full_name,
        "parent_username": parent.username,
    }


@router.post("/confirm-parent")
async def confirm_parent(data: ConfirmLink, db: AsyncSession = Depends(get_db)):
    """O'quvchi ota-onani tasdiqlaydi yoki rad etadi."""
    child = await find_user_by_telegram_id(data.child_telegram_id, db, role="student")
    if not child:
        raise HTTPException(status_code=404, detail="Foydalanuvchi topilmadi")

    if not child.pending_parent_id:
        raise HTTPException(status_code=400, detail="Kutilayotgan so'rov yo'q")

    if data.confirm:
        child.parent_id = child.pending_parent_id
        child.pending_parent_id = None
        await db.flush()
        return {"status": "confirmed", "message": "Ota-ona muvaffaqiyatli bog'landi"}
    else:
        child.pending_parent_id = None
        await db.flush()
        return {"status": "rejected", "message": "So'rov rad etildi"}


# === O'qituvchi uchun ===

@router.get("/students")
async def get_all_students(
    maktab: str = None,
    grade: int = None,
    subject: str = None,
    db: AsyncSession = Depends(get_db),
):
    """O'quvchilar ro'yxati. maktab, sinf, fan parametrlari bilan filtr."""
    query = select(User).where(User.role == "student")
    if maktab:
        query = query.where(User.maktab == maktab)
    if grade:
        query = query.where(User.grade == grade)
    if subject:
        query = query.where(User.subject == subject)
    result = await db.execute(query.order_by(User.created_at.desc()))
    students = result.scalars().all()

    student_list = []
    for s in students:
        sub_result = await db.execute(
            select(
                func.count(Submission.id).label("count"),
                func.avg(Submission.score).label("avg_score"),
            ).where(Submission.student_id == s.id, Submission.status == "completed")
        )
        stats = sub_result.one()

        student_list.append({
            "id": str(s.id),
            "telegram_id": s.telegram_id,
            "username": s.username,
            "full_name": s.full_name,
            "gender": s.gender,
            "grade": s.grade,
            "class_letter": s.class_letter,
            "subject": s.subject,
            "viloyat": s.viloyat,
            "tuman": s.tuman,
            "maktab": s.maktab,
            "submission_count": stats.count or 0,
            "avg_score": round(stats.avg_score or 0, 1),
            "created_at": s.created_at.isoformat() if s.created_at else None,
        })

    return {"students": student_list, "total": len(student_list)}


@router.get("/student/{telegram_id}/submissions")
async def get_student_submissions(telegram_id: int, db: AsyncSession = Depends(get_db)):
    """O'quvchining barcha submissionlari."""
    user = await find_user_by_telegram_id(telegram_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")

    result = await db.execute(
        select(Submission)
        .where(Submission.student_id == user.id, Submission.status == "completed")
        .order_by(Submission.created_at.desc())
        .limit(50)
    )
    submissions = result.scalars().all()

    return {
        "student": {
            "full_name": user.full_name,
            "username": user.username,
            "grade": user.grade,
            "class_letter": user.class_letter,
            "subject": user.subject,
            "gender": user.gender,
        },
        "submissions": [
            {
                "id": str(sub.id),
                "image_url": sub.image_url,
                "subject": sub.subject,
                "grade": sub.grade,
                "score": sub.score,
                "total_problems": sub.total_problems,
                "correct_count": sub.correct_count,
                "incorrect_count": sub.incorrect_count,
                "ai_result": sub.ai_result,
                "created_at": sub.created_at.isoformat() if sub.created_at else None,
            }
            for sub in submissions
        ],
    }


# === Ota-ona uchun ===

@router.get("/child-data")
async def get_child_data(parent_telegram_id: int, db: AsyncSession = Depends(get_db)):
    """Ota-ona uchun — farzand ma'lumotlari + submissionlari."""
    parent = await find_user_by_telegram_id(parent_telegram_id, db, role="parent")
    if not parent:
        raise HTTPException(status_code=404, detail="Ota-ona topilmadi")

    result = await db.execute(
        select(User).where(User.parent_id == parent.id, User.role == "student")
    )
    child = result.scalar_one_or_none()
    if not child:
        return {"linked": False, "message": "Farzand hali bog'lanmagan"}

    sub_result = await db.execute(
        select(Submission)
        .where(Submission.student_id == child.id, Submission.status == "completed")
        .order_by(Submission.created_at.desc())
        .limit(20)
    )
    submissions = sub_result.scalars().all()

    avg_score = sum(s.score or 0 for s in submissions) / len(submissions) if submissions else 0
    weak_topics = set()
    for sub in submissions:
        if sub.ai_result and sub.ai_result.get("weak_topics"):
            weak_topics.update(sub.ai_result["weak_topics"])

    return {
        "linked": True,
        "child": {
            "full_name": child.full_name,
            "username": child.username,
            "grade": child.grade,
            "class_letter": child.class_letter,
            "subject": child.subject,
            "gender": child.gender,
            "telegram_id": child.telegram_id,
        },
        "stats": {
            "total_submissions": len(submissions),
            "avg_score": round(avg_score, 1),
            "weak_topics": list(weak_topics)[:5],
        },
        "submissions": [
            {
                "id": str(s.id),
                "subject": s.subject,
                "score": s.score,
                "total_problems": s.total_problems,
                "correct_count": s.correct_count,
                "created_at": s.created_at.isoformat() if s.created_at else None,
            }
            for s in submissions
        ],
    }
