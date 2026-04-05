"""Direktor API — maktab bo'yicha statistika va tahlil."""

from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User, UserGameProfile
from backend.models.submission import Submission

router = APIRouter(prefix="/api/director", tags=["director"])


async def _get_director(telegram_id: int, db: AsyncSession) -> User:
    """Direktorni topish va maktabini qaytarish."""
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id, User.role == "director")
    )
    director = result.scalars().first()
    if not director:
        raise HTTPException(status_code=404, detail="Direktor topilmadi")
    if not director.maktab:
        raise HTTPException(status_code=400, detail="Direktor maktabi belgilanmagan")
    return director


@router.get("/stats")
async def get_director_stats(telegram_id: int = Query(...), db: AsyncSession = Depends(get_db)):
    """Maktab bo'yicha to'liq statistika."""
    director = await _get_director(telegram_id, db)
    maktab = director.maktab
    today = date.today()

    # O'qituvchilar soni
    teachers = await db.execute(
        select(func.count()).select_from(User).where(
            User.role == "teacher", User.maktab == maktab
        )
    )
    # O'quvchilar soni
    students = await db.execute(
        select(func.count()).select_from(User).where(
            User.role == "student", User.maktab == maktab
        )
    )
    # Ota-onalar soni
    parents = await db.execute(
        select(func.count()).select_from(User).where(
            User.role == "parent", User.maktab == maktab
        )
    )

    # Maktab o'quvchilari ID lari
    student_ids_q = await db.execute(
        select(User.id).where(User.role == "student", User.maktab == maktab)
    )
    student_ids = [row[0] for row in student_ids_q.all()]

    # Jami tekshiruvlar
    total_subs = 0
    today_subs = 0
    avg_score_val = 0
    if student_ids:
        total_result = await db.execute(
            select(func.count()).select_from(Submission).where(
                Submission.student_id.in_(student_ids), Submission.status == "completed"
            )
        )
        total_subs = total_result.scalar() or 0

        today_result = await db.execute(
            select(func.count()).select_from(Submission).where(
                Submission.student_id.in_(student_ids),
                Submission.status == "completed",
                func.date(Submission.created_at) == today,
            )
        )
        today_subs = today_result.scalar() or 0

        avg_result = await db.execute(
            select(func.avg(Submission.score)).where(
                Submission.student_id.in_(student_ids), Submission.status == "completed"
            )
        )
        avg_score_val = round(avg_result.scalar() or 0, 1)

    # Fan bo'yicha o'rtacha ball
    fan_stats = []
    if student_ids:
        fan_result = await db.execute(
            select(Submission.subject, func.avg(Submission.score), func.count()).where(
                Submission.student_id.in_(student_ids), Submission.status == "completed"
            ).group_by(Submission.subject)
        )
        for row in fan_result.all():
            fan_stats.append({
                "fan": row[0],
                "ortacha_ball": round(row[1] or 0, 1),
                "tekshiruvlar": row[2],
            })

    # Sinf bo'yicha taqsimot
    sinf_result = await db.execute(
        select(User.grade, func.count()).where(
            User.role == "student", User.maktab == maktab, User.grade.isnot(None)
        ).group_by(User.grade).order_by(User.grade)
    )
    sinf_stats = [{"sinf": row[0], "soni": row[1]} for row in sinf_result.all()]

    return {
        "maktab": maktab,
        "viloyat": director.viloyat,
        "tuman": director.tuman,
        "teachers_count": teachers.scalar() or 0,
        "students_count": students.scalar() or 0,
        "parents_count": parents.scalar() or 0,
        "total_submissions": total_subs,
        "today_submissions": today_subs,
        "avg_score": avg_score_val,
        "fan_stats": fan_stats,
        "sinf_stats": sinf_stats,
    }


@router.get("/teachers")
async def get_director_teachers(telegram_id: int = Query(...), db: AsyncSession = Depends(get_db)):
    """Maktab o'qituvchilari ro'yxati."""
    director = await _get_director(telegram_id, db)

    result = await db.execute(
        select(User).where(
            User.role == "teacher", User.maktab == director.maktab
        ).order_by(User.full_name)
    )
    teachers = result.scalars().all()

    return [
        {
            "id": str(t.id),
            "full_name": t.full_name,
            "subject": t.subject,
            "grade": t.grade,
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in teachers
    ]


@router.get("/students")
async def get_director_students(
    telegram_id: int = Query(...),
    grade: int = None,
    db: AsyncSession = Depends(get_db),
):
    """Maktab o'quvchilari ro'yxati (sinf bo'yicha filtr)."""
    director = await _get_director(telegram_id, db)

    query = select(User).where(User.role == "student", User.maktab == director.maktab)
    if grade:
        query = query.where(User.grade == grade)

    result = await db.execute(query.order_by(User.full_name))
    students = result.scalars().all()

    student_list = []
    for s in students:
        sub_result = await db.execute(
            select(
                func.count(Submission.id),
                func.avg(Submission.score),
            ).where(Submission.student_id == s.id, Submission.status == "completed")
        )
        stats = sub_result.one()
        student_list.append({
            "id": str(s.id),
            "full_name": s.full_name,
            "grade": s.grade,
            "subject": s.subject,
            "gender": s.gender,
            "submission_count": stats[0] or 0,
            "avg_score": round(stats[1] or 0, 1),
        })

    return student_list


@router.get("/submissions")
async def get_director_submissions(
    telegram_id: int = Query(...),
    limit: int = 30,
    db: AsyncSession = Depends(get_db),
):
    """Maktab bo'yicha oxirgi tekshiruvlar."""
    director = await _get_director(telegram_id, db)

    student_ids_q = await db.execute(
        select(User.id).where(User.role == "student", User.maktab == director.maktab)
    )
    student_ids = [row[0] for row in student_ids_q.all()]

    if not student_ids:
        return []

    result = await db.execute(
        select(Submission, User.full_name, User.grade).join(
            User, Submission.student_id == User.id
        ).where(
            Submission.student_id.in_(student_ids),
            Submission.status == "completed",
        ).order_by(Submission.created_at.desc()).limit(limit)
    )

    return [
        {
            "id": str(row[0].id),
            "student_name": row[1],
            "student_grade": row[2],
            "subject": row[0].subject,
            "score": row[0].score,
            "total_problems": row[0].total_problems,
            "correct_count": row[0].correct_count,
            "created_at": row[0].created_at.isoformat() if row[0].created_at else None,
        }
        for row in result.all()
    ]
