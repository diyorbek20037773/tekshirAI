"""Dashboard API — umumiy statistika."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.api.auth import get_current_user
from backend.models.user import User
from backend.services.analytics import analytics_service

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/overview")
async def get_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Umumiy statistika — jami o'quvchi, bugungi tekshiruvlar, o'rtacha ball."""
    overview = await analytics_service.get_dashboard_overview(db, str(current_user.id))
    return overview


@router.get("/recent")
async def get_recent_submissions(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Oxirgi submissionlar."""
    recent = await analytics_service.get_recent_submissions(db, str(current_user.id), limit)
    return recent


@router.get("/topic-errors")
async def get_topic_errors(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Mavzu bo'yicha xatolar statistikasi (chart uchun)."""
    errors = await analytics_service.get_topic_errors(db, str(current_user.id))
    return errors
