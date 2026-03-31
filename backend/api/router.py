"""Barcha API routerlarni birlashtirish."""

from fastapi import APIRouter

from backend.api.auth import router as auth_router
from backend.api.dashboard import router as dashboard_router
from backend.api.classrooms import router as classrooms_router
from backend.api.submissions import router as submissions_router
from backend.api.check import router as check_router
from backend.api.users import router as users_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(dashboard_router)
api_router.include_router(classrooms_router)
api_router.include_router(submissions_router)
api_router.include_router(check_router)
api_router.include_router(users_router)
