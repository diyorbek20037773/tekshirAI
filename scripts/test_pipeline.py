"""
End-to-end test — Gemini pipeline ni test qilish.
Rasm faylini o'qib, preprocessing va Gemini API ga yuboradi.

Foydalanish:
    python scripts/test_pipeline.py [rasm_fayl]
    python scripts/test_pipeline.py  # test rasm yaratadi
"""

import asyncio
import sys
import os
import json
import time

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


async def test_image_processor():
    """Image processor test."""
    print("\n=== IMAGE PROCESSOR TEST ===")
    try:
        from backend.services.image_processor import ImageProcessor
        processor = ImageProcessor()

        # Test rasm yaratish (oddiy oq rasm)
        import numpy as np
        import cv2

        # 200x300 oq rasm, ustiga matn yozish
        img = np.ones((300, 400, 3), dtype=np.uint8) * 255

        # Matn yozish
        cv2.putText(img, "2 + 3 = 5", (20, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
        cv2.putText(img, "7 - 4 = 2", (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)
        cv2.putText(img, "5 x 3 = 15", (20, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)

        _, buffer = cv2.imencode('.png', img)
        test_bytes = buffer.tobytes()

        # To'liq preprocessing
        result = processor.process(test_bytes)
        print(f"  To'liq preprocessing: {len(test_bytes)} -> {len(result)} bytes")

        # Yengil preprocessing
        result_light = processor.process_light(test_bytes)
        print(f"  Yengil preprocessing: {len(test_bytes)} -> {len(result_light)} bytes")

        print("  STATUS: OK ✅")
        return test_bytes
    except Exception as e:
        print(f"  STATUS: XATO ❌ — {e}")
        return None


async def test_key_manager():
    """Key manager test."""
    print("\n=== KEY MANAGER TEST ===")
    try:
        from backend.services.key_manager import KeyManager
        km = KeyManager()

        print(f"  Kalitlar soni: {len(km.keys)}")
        key = km.get_current_key()
        print(f"  Hozirgi kalit: ...{key[-6:]}")

        stats = km.get_stats()
        print(f"  Kunlik sig'im: {stats['total_daily_capacity']} so'rov")

        km.record_usage()
        print(f"  Foydalanish qayd qilindi")

        print("  STATUS: OK ✅")
    except Exception as e:
        print(f"  STATUS: XATO ❌ — {e}")


async def test_gemini(image_bytes=None):
    """Gemini API test — haqiqiy API chaqiruv."""
    print("\n=== GEMINI API TEST ===")
    try:
        from backend.services.gemini_service import GeminiService
        gemini = GeminiService()

        if image_bytes is None:
            print("  Rasm topilmadi, Gemini test o'tkazib yuborildi")
            print("  STATUS: SKIP ⏭")
            return

        print("  Rasm Gemini ga yuborilmoqda...")
        start = time.time()

        result = await gemini.check_homework(
            image_bytes=image_bytes,
            subject="matematika",
            grade=7,
            topic="arifmetika",
            mime_type="image/png"
        )

        elapsed = time.time() - start
        print(f"  Javob vaqti: {elapsed:.1f} sek")

        if result.get("error"):
            print(f"  Xato: {result.get('error_message')}")
            print("  STATUS: XATO ❌")
        elif result.get("ocr_error"):
            print(f"  OCR xato: {result.get('ocr_error_message')}")
            print("  STATUS: OCR XATO ⚠️")
        else:
            print(f"  Masalalar soni: {result.get('total_problems', 0)}")
            print(f"  To'g'ri: {result.get('correct_count', 0)}")
            print(f"  Xato: {result.get('incorrect_count', 0)}")
            print(f"  Ball: {result.get('score_percentage', 0)}%")
            print(f"\n  To'liq natija:")
            print(json.dumps(result, indent=2, ensure_ascii=False)[:2000])
            print("  STATUS: OK ✅")

        # API statistika
        stats = gemini.get_api_stats()
        print(f"\n  API statistika:")
        print(f"    Bugun ishlatilgan: {stats['total_used_today']}/{stats['total_daily_capacity']}")

    except Exception as e:
        print(f"  STATUS: XATO ❌ — {e}")


async def test_gamification():
    """Gamification logika test."""
    print("\n=== GAMIFICATION TEST ===")
    try:
        from backend.services.gamification import GamificationService, LEVELS, BADGES

        gs = GamificationService()

        # Level hisoblash
        assert gs._calculate_level(0) == 1
        assert gs._calculate_level(100) == 2
        assert gs._calculate_level(300) == 3
        assert gs._calculate_level(5000) == 7
        print(f"  Level hisoblash: OK")

        # Level info
        info = gs._get_level_info(1)
        assert info["name"] == "Boshlang'ich"
        print(f"  Level info: OK")

        print(f"  Darajalar: {len(LEVELS)} ta")
        print(f"  Nishonlar: {len(BADGES)} ta")
        print("  STATUS: OK ✅")
    except Exception as e:
        print(f"  STATUS: XATO ❌ — {e}")


async def main():
    print("=" * 50)
    print("  TekshirAI — End-to-End Pipeline Test")
    print("=" * 50)

    # 1. Image Processor
    test_image = await test_image_processor()

    # 2. Key Manager
    await test_key_manager()

    # 3. Gamification
    await test_gamification()

    # 4. Gemini (faqat rasm bo'lsa)
    # Command line dan rasm fayl berilgan bo'lsa
    image_for_gemini = None
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        if os.path.exists(image_path):
            with open(image_path, "rb") as f:
                image_for_gemini = f.read()
            print(f"\nRasm fayl: {image_path} ({len(image_for_gemini)} bytes)")
        else:
            print(f"\nFayl topilmadi: {image_path}")
    else:
        image_for_gemini = test_image

    await test_gemini(image_for_gemini)

    print("\n" + "=" * 50)
    print("  Test yakunlandi!")
    print("=" * 50)


if __name__ == "__main__":
    asyncio.run(main())
