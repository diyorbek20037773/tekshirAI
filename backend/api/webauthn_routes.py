"""WebAuthn (Face ID / Touch ID / barmoq izi) — passkey ro'yxatga olish va kirish.

Oqim:
  - register/begin + register/finish: login qilingan foydalanuvchi qurilmasini bog'laydi.
  - auth/begin + auth/finish: parolsiz, biometrika bilan kirish -> JWT.
"""

import json
import time
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
    options_to_json,
)
from webauthn.helpers import bytes_to_base64url, base64url_to_bytes
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria,
    ResidentKeyRequirement,
    UserVerificationRequirement,
    PublicKeyCredentialDescriptor,
)

from backend.config import settings
from backend.database import get_db
from backend.models.user import User
from backend.models.webauthn import WebAuthnCredential
from backend.api.auth import get_current_user, create_access_token
from backend.api.users import user_to_response

router = APIRouter(prefix="/api/auth/webauthn", tags=["webauthn"])

RP_ID = settings.WEBAUTHN_RP_ID
RP_NAME = settings.WEBAUTHN_RP_NAME
ORIGIN = settings.WEBAUTHN_ORIGIN

# Qisqa muddatli challenge saqlash (single-process). Restart'da yo'qoladi — MVP uchun maqbul.
_challenges: dict[str, tuple[bytes, float]] = {}
_TTL = 300  # 5 daqiqa


def _put(key: str, challenge: bytes):
    _challenges[key] = (challenge, time.time() + _TTL)


def _pop(key: str):
    v = _challenges.pop(key, None)
    if not v or v[1] < time.time():
        return None
    return v[0]


@router.post("/register/begin")
async def register_begin(current_user: User = Depends(get_current_user)):
    """Passkey ro'yxatga olishni boshlash (avval parol bilan kirilgan bo'lsin)."""
    options = generate_registration_options(
        rp_id=RP_ID,
        rp_name=RP_NAME,
        user_name=current_user.username or str(current_user.id),
        user_id=str(current_user.id).encode(),
        user_display_name=current_user.full_name,
        authenticator_selection=AuthenticatorSelectionCriteria(
            resident_key=ResidentKeyRequirement.PREFERRED,
            user_verification=UserVerificationRequirement.PREFERRED,
        ),
    )
    _put(f"reg:{current_user.id}", options.challenge)
    return json.loads(options_to_json(options))


@router.post("/register/finish")
async def register_finish(
    body: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Passkey'ni tekshirib saqlash."""
    challenge = _pop(f"reg:{current_user.id}")
    if not challenge:
        raise HTTPException(status_code=400, detail="Muddati tugadi, qayta urinib ko'ring")

    try:
        verification = verify_registration_response(
            credential=json.dumps(body),
            expected_challenge=challenge,
            expected_rp_id=RP_ID,
            expected_origin=ORIGIN,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Tekshiruv xatosi: {str(e)[:120]}")

    cred_id = bytes_to_base64url(verification.credential_id)
    existing = await db.execute(
        select(WebAuthnCredential).where(WebAuthnCredential.credential_id == cred_id)
    )
    if not existing.scalar_one_or_none():
        db.add(
            WebAuthnCredential(
                user_id=current_user.id,
                credential_id=cred_id,
                public_key=bytes_to_base64url(verification.credential_public_key),
                sign_count=verification.sign_count,
                transports=",".join(body.get("response", {}).get("transports", []) or []),
            )
        )
    return {"status": "ok"}


@router.post("/auth/begin")
async def auth_begin(body: dict, db: AsyncSession = Depends(get_db)):
    """Biometrika bilan kirishni boshlash — username bo'yicha credential'larni topadi."""
    uname = (body.get("username") or "").strip().lower()
    creds = []
    if uname:
        res = await db.execute(
            select(User).where(func.lower(User.username) == uname, User.password_hash.is_not(None))
        )
        user = res.scalars().first()
        if user:
            cres = await db.execute(
                select(WebAuthnCredential).where(WebAuthnCredential.user_id == user.id)
            )
            creds = cres.scalars().all()

    options = generate_authentication_options(
        rp_id=RP_ID,
        allow_credentials=[
            PublicKeyCredentialDescriptor(id=base64url_to_bytes(c.credential_id)) for c in creds
        ],
        user_verification=UserVerificationRequirement.PREFERRED,
    )
    handle = secrets.token_urlsafe(16)
    _put(f"auth:{handle}", options.challenge)
    return {"handle": handle, "options": json.loads(options_to_json(options))}


@router.post("/auth/finish")
async def auth_finish(body: dict, db: AsyncSession = Depends(get_db)):
    """Biometrika assertion'ini tekshirib JWT berish."""
    handle = body.get("handle")
    credential = body.get("credential")
    if not handle or not credential:
        raise HTTPException(status_code=400, detail="Ma'lumot yetarli emas")

    challenge = _pop(f"auth:{handle}")
    if not challenge:
        raise HTTPException(status_code=400, detail="Muddati tugadi, qayta urinib ko'ring")

    cred_id = credential.get("id")
    cres = await db.execute(
        select(WebAuthnCredential).where(WebAuthnCredential.credential_id == cred_id)
    )
    stored = cres.scalar_one_or_none()
    if not stored:
        raise HTTPException(status_code=400, detail="Bu qurilma ro'yxatdan o'tmagan")

    try:
        verification = verify_authentication_response(
            credential=json.dumps(credential),
            expected_challenge=challenge,
            expected_rp_id=RP_ID,
            expected_origin=ORIGIN,
            credential_public_key=base64url_to_bytes(stored.public_key),
            credential_current_sign_count=stored.sign_count,
            require_user_verification=True,
        )
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Biometrika muvaffaqiyatsiz: {str(e)[:120]}")

    stored.sign_count = verification.new_sign_count
    ures = await db.execute(select(User).where(User.id == stored.user_id))
    user = ures.scalar_one()
    token = create_access_token({"sub": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "user": user_to_response(user)}
