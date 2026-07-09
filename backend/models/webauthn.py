"""WebAuthn credential — biometrika (passkey) uchun ochiq kalit saqlash."""

import uuid
from datetime import datetime

from sqlalchemy import String, BigInteger, DateTime, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID

from backend.database import Base


class WebAuthnCredential(Base):
    __tablename__ = "webauthn_credentials"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    credential_id: Mapped[str] = mapped_column(Text, unique=True, index=True)  # base64url
    public_key: Mapped[str] = mapped_column(Text)  # base64url COSE key
    sign_count: Mapped[int] = mapped_column(BigInteger, default=0)
    transports: Mapped[str | None] = mapped_column(String(255))  # csv: "internal,hybrid"
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
