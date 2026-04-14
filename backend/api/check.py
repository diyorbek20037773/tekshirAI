"""Rasm tekshirish API — Mini App dan rasm keladi, Gemini AI tekshiradi, DB ga saqlanadi."""

import time
import base64
import logging
from fastapi import APIRouter, UploadFile, File, Form, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models.user import User
from backend.models.submission import Submission
from backend.services.gemini_service import GeminiService
from backend.services.image_processor import ImageProcessor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/check", tags=["check"])

gemini = GeminiService()
image_processor = ImageProcessor()


@router.post("/homework")
async def check_homework(
    image: UploadFile = File(...),
    subject: str = Form(default="matematika"),
    grade: int = Form(default=7),
    telegram_id: int = Form(default=0),
    assignment_id: str = Form(default=""),
    db: AsyncSession = Depends(get_db),
):
    start_time = time.time()

    try:
        image_bytes = await image.read()

        if len(image_bytes) > 10 * 1024 * 1024:
            return JSONResponse(
                status_code=400,
                content={"error": True, "error_message": "Rasm juda katta (max 10MB)"}
            )

        logger.info(f"Rasm qabul qilindi: {len(image_bytes)} bytes, fan: {subject}, sinf: {grade}, tg: {telegram_id}")

        # Image preprocessing
        try:
            processed_image = image_processor.process_light(image_bytes)
            mime_type = "image/jpeg"
            logger.info(f"Preprocessing: {len(image_bytes)} -> {len(processed_image)} bytes")
        except Exception as e:
            logger.warning(f"Preprocessing xato: {e}")
            processed_image = image_bytes
            mime_type = "image/jpeg"

        # Gemini AI tekshiruv
        ai_result = await gemini.check_homework(
            image_bytes=processed_image,
            subject=subject,
            grade=grade,
            topic="",
            mime_type=mime_type,
        )

        processing_time = int((time.time() - start_time) * 1000)

        if ai_result.get("ocr_error"):
            return JSONResponse(content={
                "success": False,
                "ocr_error": True,
                "message": ai_result.get("ocr_error_message", "Rasmni o'qib bo'lmadi"),
                "processing_ms": processing_time,
            })

        if ai_result.get("error"):
            return JSONResponse(
                status_code=500,
                content={
                    "success": False,
                    "error": True,
                    "message": ai_result.get("error_message", "AI tekshiruvda xatolik"),
                    "processing_ms": processing_time,
                }
            )

        # DB ga submission saqlash
        student_id = None
        if telegram_id and telegram_id != 0:
            result = await db.execute(
                select(User).where(User.telegram_id == telegram_id, User.role == "student")
            )
            user = result.scalars().first()
            if user:
                student_id = user.id

        # Agar telegram_id orqali topilmasa — submission saqlanmaydi (boshqa userga yozilmasin)
        if not student_id:
            logger.warning(f"telegram_id={telegram_id} bo'yicha student topilmadi — submission saqlanmaydi")

        if student_id:
            # Rasmni base64 formatda saqlash
            image_base64 = f"data:image/jpeg;base64,{base64.b64encode(processed_image).decode()}"

            # Assignment_id ni parse qilish (agar kelgan bo'lsa)
            assignment_uuid = None
            if assignment_id:
                try:
                    from uuid import UUID as _UUID
                    assignment_uuid = _UUID(assignment_id)
                except (ValueError, TypeError):
                    logger.warning(f"Noto'g'ri assignment_id format: {assignment_id!r} — bog'lanmadi")
                    assignment_uuid = None

            submission = Submission(
                student_id=student_id,
                assignment_id=assignment_uuid,
                image_url=image_base64,
                subject=subject,
                grade=grade,
                ocr_raw_text=ai_result.get("ocr_text", ""),
                ai_result=ai_result,
                score=ai_result.get("score_percentage", 0),
                total_problems=ai_result.get("total_problems", 0),
                correct_count=ai_result.get("correct_count", 0),
                incorrect_count=ai_result.get("incorrect_count", 0),
                status="completed",
                processing_duration_ms=processing_time,
            )
            db.add(submission)
            await db.flush()
            logger.info(f"Submission saqlandi: {submission.id}, student: {student_id}")

        logger.info(
            f"Tekshiruv yakunlandi: {processing_time}ms, "
            f"ball: {ai_result.get('score_percentage', 0)}%"
        )

        return JSONResponse(content={
            "success": True,
            "processing_ms": processing_time,
            "result": ai_result,
        })

    except Exception as e:
        processing_time = int((time.time() - start_time) * 1000)
        logger.error(f"Tekshirish xatosi: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": True,
                "message": f"Xatolik: {str(e)[:200]}",
                "processing_ms": processing_time,
            }
        )
