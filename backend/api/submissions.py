"""Submissions API — detail, o'quvchi tarixi."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, desc, and_
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.api.auth import get_current_user
from backend.models.user import User
from backend.models.submission import Submission
from backend.schemas.submission import SubmissionResponse, SubmissionListResponse

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


@router.get("/{submission_id}", response_model=SubmissionResponse)
async def get_submission(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Bitta submission detali."""
    result = await db.execute(
        select(Submission).where(Submission.id == submission_id)
    )
    submission = result.scalar_one_or_none()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission topilmadi")
    return submission


@router.get("/student/{student_id}", response_model=List[SubmissionListResponse])
async def get_student_submissions(
    student_id: str,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """O'quvchining submissionlar tarixi."""
    result = await db.execute(
        select(Submission)
        .where(
            and_(
                Submission.student_id == student_id,
                Submission.status == "completed",
            )
        )
        .order_by(desc(Submission.created_at))
        .limit(limit)
    )
    return result.scalars().all()
