"""Topshiriqlar API — o'qituvchi topshiriq yaratadi, o'quvchi ko'radi."""

import base64
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy import select, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from backend.database import get_db
from backend.models.user import User
from backend.models.assignment import Assignment
from backend.models.classroom import Classroom, ClassroomStudent

router = APIRouter(prefix="/api/assignments", tags=["assignments"])


# === Schemas ===

class AssignmentCreate(BaseModel):
    teacher_telegram_id: int
    classroom_id: str | None = None
    title: str
    description: str | None = None
    subject: str
    grade: int
    due_date: str | None = None  # ISO format


class AssignmentResponse(BaseModel):
    id: str
    title: str
    description: str | None
    subject: str
    grade: int
    teacher_name: str
    image_url: str | None
    due_date: str | None
    created_at: str


# === Endpoints ===

@router.post("/")
async def create_assignment(
    data: AssignmentCreate,
    db: AsyncSession = Depends(get_db),
):
    """O'qituvchi yangi topshiriq yaratadi."""
    # O'qituvchini topish
    result = await db.execute(
        select(User).where(User.telegram_id == data.teacher_telegram_id, User.role == "teacher")
    )
    teacher = result.scalars().first()
    if not teacher:
        raise HTTPException(status_code=404, detail="O'qituvchi topilmadi")

    due = None
    if data.due_date:
        try:
            due = datetime.fromisoformat(data.due_date)
        except ValueError:
            pass

    assignment = Assignment(
        teacher_id=teacher.id,
        classroom_id=UUID(data.classroom_id) if data.classroom_id else None,
        title=data.title,
        description=data.description,
        subject=data.subject,
        grade=data.grade,
        due_date=due,
    )
    db.add(assignment)
    await db.flush()

    return {
        "status": "created",
        "id": str(assignment.id),
        "title": assignment.title,
    }


@router.post("/{assignment_id}/image")
async def upload_assignment_image(
    assignment_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
):
    """Topshiriqqa rasm qo'shish."""
    result = await db.execute(
        select(Assignment).where(Assignment.id == UUID(assignment_id))
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Topshiriq topilmadi")

    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Rasm hajmi 10MB dan katta")

    b64 = base64.b64encode(contents).decode()
    assignment.image_url = f"data:{file.content_type};base64,{b64}"
    await db.flush()

    return {"status": "uploaded"}


@router.get("/teacher")
async def get_teacher_assignments(
    telegram_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """O'qituvchining barcha topshiriqlari."""
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id, User.role == "teacher")
    )
    teacher = result.scalars().first()
    if not teacher:
        raise HTTPException(status_code=404, detail="O'qituvchi topilmadi")

    assignments = await db.execute(
        select(Assignment).where(Assignment.teacher_id == teacher.id)
        .order_by(desc(Assignment.created_at))
        .limit(50)
    )

    return [
        _assignment_to_dict(a, teacher.full_name)
        for a in assignments.scalars().all()
    ]


@router.get("/student")
async def get_student_assignments(
    telegram_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """O'quvchi uchun topshiriqlar — uning sinfi va fani bo'yicha."""
    result = await db.execute(
        select(User).where(User.telegram_id == telegram_id, User.role == "student")
    )
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="O'quvchi topilmadi")

    # O'quvchi qaysi sinflarga a'zo
    classroom_ids_result = await db.execute(
        select(ClassroomStudent.classroom_id).where(ClassroomStudent.student_id == student.id)
    )
    classroom_ids = [row[0] for row in classroom_ids_result.all()]

    # Topshiriqlar: shu sinflarga yoki umumiy (classroom_id=None, grade mos)
    query = select(Assignment).where(
        Assignment.grade == student.grade
    )

    if classroom_ids:
        from sqlalchemy import or_
        query = query.where(
            or_(
                Assignment.classroom_id.in_(classroom_ids),
                Assignment.classroom_id.is_(None),
            )
        )

    assignments = await db.execute(
        query.order_by(desc(Assignment.created_at)).limit(20)
    )

    result_list = []
    for a in assignments.scalars().all():
        teacher_name = "O'qituvchi"
        if a.teacher:
            teacher_name = a.teacher.full_name
        result_list.append(_assignment_to_dict(a, teacher_name))

    return result_list


@router.get("/{assignment_id}/submissions")
async def get_assignment_submissions(
    assignment_id: str,
    telegram_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """O'qituvchi topshiriqni bajargan o'quvchilar ro'yxatini ko'radi."""
    from backend.models.submission import Submission

    # Assignment tekshiruvi
    try:
        aid = UUID(assignment_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Noto'g'ri assignment_id")

    a_res = await db.execute(select(Assignment).where(Assignment.id == aid))
    assignment = a_res.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Topshiriq topilmadi")

    # O'qituvchi ekanligini tekshirish
    t_res = await db.execute(
        select(User).where(User.telegram_id == telegram_id, User.role == "teacher")
    )
    teacher = t_res.scalars().first()
    if not teacher or assignment.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Bu topshiriq sizga tegishli emas")

    # Shu topshiriqqa tegishli barcha submissionlar
    s_res = await db.execute(
        select(Submission).where(Submission.assignment_id == aid).order_by(desc(Submission.created_at))
    )
    all_subs = s_res.scalars().all()

    # O'quvchi bo'yicha guruhlash
    by_student = {}
    for s in all_subs:
        if s.student_id not in by_student:
            by_student[s.student_id] = []
        by_student[s.student_id].append(s)

    # O'quvchilar ma'lumotini olish
    if not by_student:
        return []

    u_res = await db.execute(
        select(User).where(User.id.in_(list(by_student.keys())))
    )
    users = {u.id: u for u in u_res.scalars().all()}

    result_list = []
    for student_id, subs in by_student.items():
        user = users.get(student_id)
        if not user:
            continue
        # subs DESC tartiblangan — birinchisi eng yangi
        latest = subs[0]
        first = subs[-1]
        result_list.append({
            "student_id": str(student_id),
            "student_name": user.full_name,
            "username": user.username,
            "grade": user.grade,
            "class_letter": user.class_letter,
            "maktab": user.maktab,
            "latest_score": latest.score or 0,
            "latest_submission_id": str(latest.id),
            "attempts": len(subs),
            "first_attempt_at": first.created_at.isoformat() if first.created_at else None,
            "last_attempt_at": latest.created_at.isoformat() if latest.created_at else None,
        })

    # Sana bo'yicha DESC tartiblash
    result_list.sort(key=lambda x: x["last_attempt_at"] or "", reverse=True)
    return result_list


@router.get("/submission/{submission_id}")
async def get_submission_detail(
    submission_id: str,
    telegram_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """O'qituvchi submission tafsilotlarini ko'radi (faqat o'z topshiriqlari uchun)."""
    from backend.models.submission import Submission

    try:
        sid = UUID(submission_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Noto'g'ri submission_id")

    s_res = await db.execute(select(Submission).where(Submission.id == sid))
    submission = s_res.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission topilmadi")

    # Teacher huquqini tekshirish (agar assignment_id mavjud bo'lsa)
    if submission.assignment_id:
        a_res = await db.execute(select(Assignment).where(Assignment.id == submission.assignment_id))
        assignment = a_res.scalar_one_or_none()
        if assignment:
            t_res = await db.execute(
                select(User).where(User.telegram_id == telegram_id, User.role == "teacher")
            )
            teacher = t_res.scalars().first()
            if not teacher or assignment.teacher_id != teacher.id:
                raise HTTPException(status_code=403, detail="Ruxsat yo'q")

    # Student ma'lumotini olish
    u_res = await db.execute(select(User).where(User.id == submission.student_id))
    student = u_res.scalar_one_or_none()

    return {
        "id": str(submission.id),
        "student_name": student.full_name if student else "O'quvchi",
        "student_grade": student.grade if student else None,
        "subject": submission.subject,
        "grade": submission.grade,
        "image_url": submission.image_url,
        "score": submission.score or 0,
        "total_problems": submission.total_problems or 0,
        "correct_count": submission.correct_count or 0,
        "incorrect_count": submission.incorrect_count or 0,
        "ai_result": submission.ai_result,
        "created_at": submission.created_at.isoformat() if submission.created_at else None,
    }


@router.delete("/{assignment_id}")
async def delete_assignment(
    assignment_id: str,
    telegram_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Topshiriqni o'chirish (faqat o'z topshirig'ini)."""
    try:
        aid = UUID(assignment_id)
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="Noto'g'ri assignment_id")

    result = await db.execute(select(Assignment).where(Assignment.id == aid))
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Topshiriq topilmadi")

    # Egalik tekshiruvi — boshqa o'qituvchining ishini o'chirib bo'lmaydi
    t_res = await db.execute(
        select(User).where(User.telegram_id == telegram_id, User.role == "teacher")
    )
    teacher = t_res.scalars().first()
    if not teacher or assignment.teacher_id != teacher.id:
        raise HTTPException(status_code=403, detail="Bu topshiriq sizga tegishli emas")

    await db.delete(assignment)
    await db.flush()
    return {"status": "deleted"}


def _assignment_to_dict(a: Assignment, teacher_name: str) -> dict:
    return {
        "id": str(a.id),
        "title": a.title,
        "description": a.description,
        "subject": a.subject,
        "grade": a.grade,
        "teacher_name": teacher_name,
        "image_url": a.image_url,
        "due_date": a.due_date.isoformat() if a.due_date else None,
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }
