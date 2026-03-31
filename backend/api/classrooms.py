"""Sinflar API — CRUD, statistika, o'quvchilar."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.api.auth import get_current_user
from backend.models.user import User
from backend.models.classroom import Classroom, ClassroomStudent
from backend.models.submission import Submission
from backend.schemas.classroom import ClassroomCreate, ClassroomResponse, ClassroomWithStats
from backend.schemas.user import UserResponse

router = APIRouter(prefix="/api/classrooms", tags=["classrooms"])


@router.get("/", response_model=List[ClassroomWithStats])
async def list_classrooms(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """O'qituvchining barcha sinflari."""
    result = await db.execute(
        select(Classroom).where(Classroom.teacher_id == current_user.id)
    )
    classrooms = result.scalars().all()

    response = []
    for c in classrooms:
        # O'quvchilar soni
        count_result = await db.execute(
            select(func.count()).select_from(ClassroomStudent)
            .where(ClassroomStudent.classroom_id == c.id)
        )
        student_count = count_result.scalar() or 0

        # O'rtacha ball
        avg_result = await db.execute(
            select(func.avg(Submission.score)).where(
                and_(Submission.classroom_id == c.id, Submission.status == "completed")
            )
        )
        avg_score = avg_result.scalar()

        response.append(ClassroomWithStats(
            id=c.id,
            teacher_id=c.teacher_id,
            name=c.name,
            subject=c.subject,
            invite_code=c.invite_code,
            created_at=c.created_at,
            student_count=student_count,
            avg_score=round(avg_score, 1) if avg_score else None,
        ))

    return response


@router.post("/", response_model=ClassroomResponse)
async def create_classroom(
    data: ClassroomCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Yangi sinf yaratish."""
    classroom = Classroom(
        teacher_id=current_user.id,
        name=data.name,
        subject=data.subject,
    )
    db.add(classroom)
    await db.flush()
    return classroom


@router.get("/{classroom_id}")
async def get_classroom(
    classroom_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bitta sinf ma'lumotlari."""
    result = await db.execute(
        select(Classroom).where(
            and_(Classroom.id == classroom_id, Classroom.teacher_id == current_user.id)
        )
    )
    classroom = result.scalar_one_or_none()
    if not classroom:
        raise HTTPException(status_code=404, detail="Sinf topilmadi")

    # O'quvchilar
    students_result = await db.execute(
        select(User).join(ClassroomStudent, ClassroomStudent.student_id == User.id)
        .where(ClassroomStudent.classroom_id == classroom_id)
    )
    students = students_result.scalars().all()

    return {
        "classroom": ClassroomResponse.model_validate(classroom),
        "students": [UserResponse.model_validate(s) for s in students],
    }


@router.get("/{classroom_id}/stats")
async def get_classroom_stats(
    classroom_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sinf statistikasi — o'quvchilar reytingi, mavzu analitikasi."""
    # O'quvchilar va ularning o'rtacha ballari
    result = await db.execute(
        select(
            User.id, User.full_name,
            func.avg(Submission.score).label("avg_score"),
            func.count(Submission.id).label("total_submissions"),
        )
        .join(ClassroomStudent, ClassroomStudent.student_id == User.id)
        .outerjoin(Submission, and_(
            Submission.student_id == User.id,
            Submission.status == "completed"
        ))
        .where(ClassroomStudent.classroom_id == classroom_id)
        .group_by(User.id, User.full_name)
        .order_by(func.avg(Submission.score).desc().nulls_last())
    )
    rows = result.all()

    students_stats = [
        {
            "id": str(row[0]),
            "name": row[1],
            "avg_score": round(row[2], 1) if row[2] else 0,
            "total_submissions": row[3],
        }
        for row in rows
    ]

    return {"students": students_stats}
