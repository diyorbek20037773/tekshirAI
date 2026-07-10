"""JWT autentifikatsiya — login/register."""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.config import settings
from backend.database import get_db
from backend.models.user import User, UserGameProfile
from backend.api.users import user_to_response

router = APIRouter(prefix="/api/auth", tags=["auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24


class Token(BaseModel):
    access_token: str
    token_type: str


class TeacherRegister(BaseModel):
    username: str
    password: str
    full_name: str
    subject: str


class TeacherLogin(BaseModel):
    username: str
    password: str


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    """JWT token dan foydalanuvchini olish."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token yaroqsiz",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


@router.post("/register", response_model=Token)
async def register(data: TeacherRegister, db: AsyncSession = Depends(get_db)):
    """O'qituvchi ro'yxatdan o'tishi (dashboard uchun)."""
    # Username tekshirish
    existing = await db.execute(
        select(User).where(User.username == data.username)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bu username band")

    user = User(
        telegram_id=0,  # Dashboard foydalanuvchisi, telegram_id kerak emas
        username=data.username,
        full_name=data.full_name,
        role="teacher",
        subject=data.subject,
    )
    db.add(user)
    await db.flush()

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=Token)
async def login(form: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    """O'qituvchi login (dashboard uchun)."""
    result = await db.execute(
        select(User).where(User.username == form.username)
    )
    user = result.scalar_one_or_none()

    if not user or user.role != "teacher":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Noto'g'ri login yoki parol",
        )

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer"}


# === Brauzer (PWA) auth — username + parol, barcha rollar uchun ===
# Telegramsiz foydalanuvchilar manfiy synthetic telegram_id oladi (real ID'lar musbat,
# to'qnashuv bo'lmaydi). Shunda mavjud telegram_id-ga bog'langan endpointlar o'zgarmasdan ishlaydi.

class BrowserRegister(BaseModel):
    username: str
    password: str
    full_name: str
    role: str  # student, teacher, parent, director
    gender: str | None = None
    grade: int | None = None
    class_letter: str | None = None
    subject: str | None = None
    viloyat: str | None = None
    tuman: str | None = None
    maktab: str | None = None


class BrowserLogin(BaseModel):
    username: str
    password: str


class AuthResult(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict


@router.post("/browser-register", response_model=AuthResult)
async def browser_register(data: BrowserRegister, db: AsyncSession = Depends(get_db)):
    """Brauzerdan ro'yxatdan o'tish (barcha rollar). Parol bcrypt bilan hash qilinadi."""
    if data.role not in ("student", "teacher", "parent", "director"):
        raise HTTPException(status_code=400, detail="Noto'g'ri rol")

    uname = data.username.strip().lower()
    if not uname or len(data.password) < 6:
        raise HTTPException(status_code=400, detail="Username va kamida 6 belgili parol kerak")

    # Faqat brauzer akkauntlar (password_hash bor) orasida username band emasligi
    existing = await db.execute(
        select(User).where(func.lower(User.username) == uname, User.password_hash.is_not(None))
    )
    if existing.scalars().first():
        raise HTTPException(status_code=400, detail="Bu username band")

    # Synthetic manfiy telegram_id (real ID'lar musbat)
    row = await db.execute(select(func.min(User.telegram_id)))
    synthetic_id = min(row.scalar() or 0, 0) - 1

    user = User(
        telegram_id=synthetic_id,
        username=uname,
        password_hash=pwd_context.hash(data.password),
        full_name=data.full_name,
        role=data.role,
        gender=data.gender,
        grade=data.grade,
        class_letter=data.class_letter,
        subject=data.subject,
        viloyat=data.viloyat,
        tuman=data.tuman,
        maktab=data.maktab,
        is_approved=(data.role != "director"),  # direktorni admin tasdiqlaydi
    )
    db.add(user)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Bu username band")

    if data.role == "student":
        db.add(UserGameProfile(user_id=user.id))
        await db.flush()

    # game_profile relationship yuklanishi uchun qayta o'qiymiz
    result = await db.execute(select(User).where(User.id == user.id))
    user = result.scalar_one()

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user_to_response(user)}


@router.post("/browser-login", response_model=AuthResult)
async def browser_login(data: BrowserLogin, db: AsyncSession = Depends(get_db)):
    """Brauzerdan kirish — username + parol."""
    uname = data.username.strip().lower()
    result = await db.execute(
        select(User).where(func.lower(User.username) == uname, User.password_hash.is_not(None))
    )
    user = result.scalars().first()

    if not user or not user.password_hash or not pwd_context.verify(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Noto'g'ri login yoki parol")

    # Direktor admin tasdig'idan o'tmaguncha kira olmaydi
    if user.role == "director" and not user.is_approved:
        raise HTTPException(status_code=403, detail="Direktor hisobingiz hali admin tomonidan tasdiqlanmagan")

    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user_to_response(user)}
