"""Rasm tekshirish API — Mini App dan rasm keladi, Gemini AI tekshiradi."""

import time
import logging
from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse

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
):
    """
    Rasm yuklash va Gemini AI bilan tekshirish.
    Haqiqiy OCR + tekshiruv + tushuntirish — galyusinatsiyasiz.
    """
    start_time = time.time()

    try:
        # 1. Rasmni o'qish
        image_bytes = await image.read()

        if len(image_bytes) > 10 * 1024 * 1024:
            return JSONResponse(
                status_code=400,
                content={"error": True, "error_message": "Rasm juda katta (max 10MB)"}
            )

        logger.info(f"Rasm qabul qilindi: {len(image_bytes)} bytes, fan: {subject}, sinf: {grade}")

        # 2. Image preprocessing — yengil (Gemini o'zi yaxshi OCR qiladi)
        try:
            processed_image = image_processor.process_light(image_bytes)
            mime_type = "image/jpeg"
            logger.info("Rasm preprocessing (light) muvaffaqiyatli")
        except Exception as e:
            logger.warning(f"Preprocessing xato, original rasm ishlatiladi: {e}")
            processed_image = image_bytes
            mime_type = "image/jpeg"

        # 3. GEMINI AI — haqiqiy tekshiruv (OCR + analiz + baho)
        ai_result = await gemini.check_homework(
            image_bytes=processed_image,
            subject=subject,
            grade=grade,
            topic="",
            mime_type=mime_type,
        )

        processing_time = int((time.time() - start_time) * 1000)

        # 4. Xato tekshirish
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

        # 5. Muvaffaqiyatli natija
        logger.info(
            f"Tekshiruv yakunlandi: {processing_time}ms, "
            f"ball: {ai_result.get('score_percentage', 0)}%, "
            f"masalalar: {ai_result.get('total_problems', 0)}"
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
