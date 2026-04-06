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

    # Topshiriqlar: shu sinflarga yoki umumiy (classroom_id=None, grade va subject mos)
    query = select(Assignment).where(
        Assignment.grade == student.grade
    )

    if classroom_ids:
        from sqlalchemy import or_
        query = query.where(
            or_(
                Assignment.classroom_id.in_(classroom_ids),
                and_(Assignment.classroom_id.is_(None), Assignment.subject == student.subject),
            )
        )
    else:
        query = query.where(
            and_(Assignment.classroom_id.is_(None), Assignment.subject == student.subject)
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


@router.delete("/{assignment_id}")
async def delete_assignment(
    assignment_id: str,
    telegram_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
):
    """Topshiriqni o'chirish."""
    result = await db.execute(
        select(Assignment).where(Assignment.id == UUID(assignment_id))
    )
    assignment = result.scalar_one_or_none()
    if not assignment:
        raise HTTPException(status_code=404, detail="Topshiriq topilmadi")

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
