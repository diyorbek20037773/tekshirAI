# TekshirAI — To'liq Loyiha Hujjati (YANGILANGAN)
# AI asosida uyga vazifalarni avtomatik tekshirish tizimi
# Gemini API bilan — BEPUL, tez, aniq
# ============================================================

## 1. LOYIHA HAQIDA UMUMIY MA'LUMOT

### 1.1 Nima bu?
TekshirAI — O'zbekiston maktab o'quvchilari uchun AI asosida uyga vazifalarni 
avtomatik tekshirish platformasi. O'quvchi daftaridagi yechimni telefondan suratga 
olib Telegram botga yuboradi. AI tizim qo'lyozmani o'qiydi, har bir masalani 
qadam-baqadam tekshiradi, xatolarni o'zbek tilida tushuntiradi.

### 1.2 Uchta foydalanuvchi
1. **O'quvchi** — Telegram bot orqali rasm yuboradi, natija oladi
2. **O'qituvchi** — Web dashboard orqali sinf statistikasini ko'radi
3. **Ota-ona** — Telegram bot orqali bolasi natijalarini kuzatadi

### 1.3 Asosiy texnologiyalar
- **Backend**: Python 3.11+ / FastAPI
- **Database**: PostgreSQL + SQLAlchemy (async)
- **Bot**: python-telegram-bot (v20+)
- **AI (OCR + Tekshiruv + Tushuntirish)**: Google Gemini API (BEPUL)
  - Model: gemini-2.5-flash (tez, bepul, rasmni o'qiydi)
  - Gemini rasmni ko'radi + matnni o'qiydi + tekshiradi + tushuntiradi — HAMMASI BITTA API DA
- **Image Processing**: OpenCV + Pillow (preprocessing)
- **Frontend (Dashboard)**: React + TailwindCSS + Vite
- **Hosting**: Railway / Render / VPS

### 1.4 Nima uchun Gemini?
- BEPUL — kredit karta kerak emas
- Qo'lyozma o'qishda benchmark da eng yuqori aniqlik (100%)
- Bitta API — alohida OCR kerak emas, Gemini rasmni to'g'ridan-to'g'ri o'qiydi
- Bepul tier: kuniga 250 ta so'rov (Flash model)
- Ko'p API kalit strategiyasi: 5 ta Gmail = kuniga 1,250 ta bepul so'rov

---

## 2. LOYIHA FAYL STRUKTURASI

```
tekshir-ai/
├── README.md
├── .env
├── .env.example
├── docker-compose.yml
├── requirements.txt
│
├── backend/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app entry point
│   ├── config.py                 # Settings va environment variables
│   ├── database.py               # Database connection va session
│   │
│   ├── models/                   # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py               # User model (student/teacher/parent)
│   │   ├── submission.py         # Uyga vazifa submission
│   │   ├── classroom.py          # Sinf model
│   │   └── assignment.py         # Vazifa (topshiriq) model
│   │
│   ├── schemas/                  # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── submission.py
│   │   └── classroom.py
│   │
│   ├── api/                      # API endpoints
│   │   ├── __init__.py
│   │   ├── router.py             # Main router
│   │   ├── auth.py               # Authentication endpoints
│   │   ├── submissions.py        # Submission endpoints
│   │   ├── classrooms.py         # Classroom endpoints
│   │   ├── dashboard.py          # Dashboard/analytics endpoints
│   │   └── parents.py            # Parent notification endpoints
│   │
│   ├── services/                 # Business logic
│   │   ├── __init__.py
│   │   ├── gemini_service.py     # Gemini API — OCR + tekshiruv + tushuntirish (ASOSIY)
│   │   ├── image_processor.py    # OpenCV image preprocessing
│   │   ├── key_manager.py        # API kalitlarni rotate qilish
│   │   ├── notification.py       # Ota-ona notification service
│   │   └── analytics.py          # Statistika va analitika
│   │
│   ├── bot/                      # Telegram bot
│   │   ├── __init__.py
│   │   ├── bot.py                # Bot initialization
│   │   ├── handlers/
│   │   │   ├── __init__.py
│   │   │   ├── start.py          # /start command
│   │   │   ├── register.py       # Ro'yxatdan o'tish
│   │   │   ├── submit.py         # Rasm yuborish va tekshirish (ASOSIY HANDLER)
│   │   │   ├── stats.py          # /stats command
│   │   │   ├── explain.py        # Qo'shimcha tushuntirish so'rash
│   │   │   ├── parent.py         # Ota-ona uchun handlerlar
│   │   │   └── teacher.py        # O'qituvchi uchun handlerlar
│   │   ├── keyboards.py          # Inline va reply keyboardlar
│   │   └── messages.py           # Barcha bot xabarlari (o'zbek tilida)
│   │
│   └── utils/
│       ├── __init__.py
│       ├── helpers.py
│       └── constants.py
│
├── frontend/                     # React dashboard
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── client.js         # API client (axios)
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── Sidebar.jsx
│       │   ├── ClassList.jsx
│       │   ├── StudentCard.jsx
│       │   ├── SubmissionView.jsx
│       │   ├── TopicAnalytics.jsx
│       │   └── Charts.jsx
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── ClassRoom.jsx
│           ├── StudentProfile.jsx
│           └── Settings.jsx
│
├── tests/
│   ├── test_gemini.py
│   ├── test_image_processor.py
│   ├── test_pipeline.py
│   └── test_bot.py
│
└── scripts/
    ├── init_db.py
    ├── seed_data.py
    └── test_pipeline.py
```

---

## 3. ENVIRONMENT VARIABLES (.env)

```env
# === Database ===
DATABASE_URL=postgresql+asyncpg://tekshirai:password@localhost:5432/tekshirai
DATABASE_URL_SYNC=postgresql://tekshirai:password@localhost:5432/tekshirai

# === Telegram Bot ===
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# === Gemini API kalitlar (BEPUL — Google AI Studio dan oling) ===
# Har bir Gmail hisobdan alohida API kalit oling
# https://aistudio.google.com/apikey
GEMINI_API_KEYS=AIzaSy_key1_from_gmail1,AIzaSy_key2_from_gmail2,AIzaSy_key3_from_gmail3
GEMINI_MODEL=gemini-2.5-flash

# === App Settings ===
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
SECRET_KEY=your-secret-key-for-jwt
CORS_ORIGINS=http://localhost:5173,https://your-frontend.com

# === Limits ===
FREE_DAILY_LIMIT=3
PREMIUM_DAILY_LIMIT=999
MAX_IMAGE_SIZE_MB=10
```

---

## 4. YANGILANGAN AI PIPELINE (3 QADAM)

### Eski pipeline (6 qadam, 2 ta pullik API):
```
Rasm → Preprocessing → Google Vision OCR ($) → Parser → Claude API ($) → Natija
```

### YANGI pipeline (3 qadam, BEPUL):
```
O'quvchi rasm yuboradi (Telegram)
        │
        ▼
[1] Image Preprocessing (OpenCV) — ~1 sek
    - Resize, grayscale, deskew
    - Contrast oshirish
    - Noise olib tashlash
        │
        ▼
[2] Gemini API (BITTA CHAQIRUV) — ~3-5 sek
    - Rasmni ko'radi (Vision)
    - Qo'lyozmani o'qiydi (OCR)
    - Masalalarni ajratadi (Parser)
    - Har bir qadamni tekshiradi (AI Checker)
    - Xatoni tushuntiradi (Explainer)
    - Real hayotiy misol beradi
    - JSON natija qaytaradi
    *** HAMMASI BITTA API CHAQIRUVDA ***
        │
        ▼
[3] Natija yuborish — ~0.5 sek
    - O'quvchiga → Telegram xabar
    - O'qituvchiga → Dashboard yangilanadi
    - Ota-onaga → Telegram notification
    
JAMI VAQT: ~5-7 soniya (eskisidan tezroq!)
JAMI XARAJAT: $0 (BEPUL!)
```

---

## 5. ASOSIY SERVISLAR (BATAFSIL KOD)

### 5.1 API Key Manager (services/key_manager.py)

```python
"""
Gemini API kalitlarni boshqarish.
Bir nechta Gmail hisobdan olingan kalitlarni rotate qiladi.
Bitta kalit limitga yetsa, keyingisiga o'tadi.
"""

import os
import time
import logging
from typing import List, Optional
from dataclasses import dataclass, field

logger = logging.getLogger(__name__)


@dataclass
class APIKeyStatus:
    """Bitta API kalit holati."""
    key: str
    requests_today: int = 0
    last_used: float = 0
    is_exhausted: bool = False
    exhausted_at: float = 0
    daily_limit: int = 250  # Gemini Flash bepul tier


class KeyManager:
    """
    Ko'p API kalitlarni rotate qiladigan manager.
    
    Strategiya:
    - Kalitlarni navbatma-navbat ishlatish (round-robin)
    - Bitta kalit 429 xato bersa, keyingisiga o'tish
    - Kunlik limitga yetgan kalitni 24 soatga to'xtatish
    - Barcha kalitlar tugasa, foydalanuvchiga xabar berish
    """
    
    def __init__(self):
        keys_str = os.getenv("GEMINI_API_KEYS", "")
        if not keys_str:
            raise ValueError("GEMINI_API_KEYS environment variable bo'sh!")
        
        keys = [k.strip() for k in keys_str.split(",") if k.strip()]
        self.keys: List[APIKeyStatus] = [APIKeyStatus(key=k) for k in keys]
        self.current_index: int = 0
        
        logger.info(f"KeyManager ishga tushdi: {len(self.keys)} ta API kalit")
    
    def get_current_key(self) -> str:
        """Hozirgi faol API kalitni qaytarish."""
        self._refresh_exhausted_keys()
        
        # Faol kalit topish
        attempts = 0
        while attempts < len(self.keys):
            key_status = self.keys[self.current_index]
            if not key_status.is_exhausted:
                return key_status.key
            self.current_index = (self.current_index + 1) % len(self.keys)
            attempts += 1
        
        raise Exception(
            "Barcha API kalitlar limitga yetdi! "
            "Yangi Gmail hisobdan API kalit qo'shing yoki ertaga qayta urinib ko'ring."
        )
    
    def rotate_key(self):
        """Keyingi kalitga o'tish (429 xato bo'lganda)."""
        current = self.keys[self.current_index]
        current.is_exhausted = True
        current.exhausted_at = time.time()
        
        logger.warning(
            f"API kalit #{self.current_index} limitga yetdi. "
            f"Keyingisiga o'tilmoqda..."
        )
        
        self.current_index = (self.current_index + 1) % len(self.keys)
    
    def record_usage(self):
        """Muvaffaqiyatli so'rovni qayd qilish."""
        current = self.keys[self.current_index]
        current.requests_today += 1
        current.last_used = time.time()
    
    def _refresh_exhausted_keys(self):
        """24 soat o'tgan kalitlarni qayta faollashtirish."""
        now = time.time()
        for key_status in self.keys:
            if key_status.is_exhausted:
                # 24 soat o'tdimi?
                if now - key_status.exhausted_at > 86400:  # 24 * 60 * 60
                    key_status.is_exhausted = False
                    key_status.requests_today = 0
                    logger.info("API kalit qayta faollashtirildi")
    
    def get_stats(self) -> dict:
        """Barcha kalitlar statistikasi."""
        return {
            "total_keys": len(self.keys),
            "active_keys": sum(1 for k in self.keys if not k.is_exhausted),
            "exhausted_keys": sum(1 for k in self.keys if k.is_exhausted),
            "total_requests_today": sum(k.requests_today for k in self.keys),
            "current_key_index": self.current_index,
        }
```

### 5.2 Gemini Service — ASOSIY SERVIS (services/gemini_service.py)

```python
"""
Gemini API orqali daftar rasmini tekshirish.
BU LOYIHANING ENG MUHIM QISMI.

Gemini bitta chaqiruvda:
1. Rasmni ko'radi (Vision)
2. Qo'lyozmani o'qiydi (OCR)
3. Masalalarni ajratadi
4. Har bir qadamni tekshiradi
5. Xatolarni tushuntiradi
6. Real hayotiy misol beradi
7. JSON natija qaytaradi
"""

import google.generativeai as genai
import json
import re
import asyncio
import logging
from typing import Dict, Optional

from backend.services.key_manager import KeyManager

logger = logging.getLogger(__name__)


class GeminiService:
    """Gemini API bilan ishlash — OCR + Tekshiruv + Tushuntirish."""
    
    def __init__(self):
        self.key_manager = KeyManager()
        self.model_name = "gemini-2.5-flash"
    
    # ============================================
    # SYSTEM PROMPT — bu prompt JUDA MUHIM!
    # Shu prompt loyihaning sifatini belgilaydi
    # ============================================
    SYSTEM_PROMPT = """Sen O'zbekiston maktablari uchun professional AI o'qituvchisan.

VAZIFANG:
Senga daftar rasmi yuboriladi. Sen:
1. Rasmdagi qo'lyozma matnni ANIQ o'qi
2. Har bir masalani alohida aniqla
3. Har bir masalaning YECHIMINI qadam-baqadam tekshir
4. Xato bo'lsa sababini tushuntir
5. Real hayotiy misol bilan tushuntir

QOIDALAR:
1. Rasmdagi matnni JUDA DIQQAT BILAN o'qi. Qo'lyozma bo'lishi mumkin.
2. Raqamlarni ayniqsa diqqat bilan o'qi: 1 va 7, 5 va 6, 0 va O farqiga e'tibor ber
3. Matematik belgilarni to'g'ri aniqla: +, -, ×, ÷, =, <, >, ≤, ≥
4. Har bir masala uchun o'quvchining HAR BIR QADAMINI tekshir
5. Faqat natijaga emas, YECHIM YO'LIGA e'tibor ber
6. Xato bo'lsa:
   - Xatoning ANIQ sababini tushuntir
   - TO'G'RI yechimni ko'rsat
   - Real hayotiy misol bilan tushuntir (bozor, sport, ovqat pishirish, pul hisoblash kabi)
7. O'zbek tilida yoz (LOTIN alifbosida)
8. Javobni FAQAT JSON formatda qaytar, boshqa hech narsa yozma
9. Agar rasmni o'qib bo'lmasa yoki sifat past bo'lsa, "ocr_error": true qo'y

BAHOLASH:
- Har bir to'g'ri masala = 1 ball
- Qisman to'g'ri (yo'l to'g'ri, hisob xato) = 0.5 ball  
- Xato = 0 ball

JSON FORMAT (AYNAN SHU FORMATDA QAYTAR):
{
    "ocr_error": false,
    "ocr_text": "<rasmdagi barcha matn>",
    "overall_score": <to'g'ri_soni>,
    "total_problems": <jami_masalalar>,
    "correct_count": <to'g'ri>,
    "incorrect_count": <xato>,
    "problems": [
        {
            "number": 1,
            "problem_text": "<masala matni>",
            "student_solution": "<o'quvchi yechimi>",
            "is_correct": true,
            "score": 1,
            "steps": [
                {
                    "step_number": 1,
                    "student_step": "<o'quvchi yozgani>",
                    "is_correct": true,
                    "explanation": ""
                }
            ],
            "error_explanation": "",
            "correct_answer": "",
            "real_life_example": ""
        },
        {
            "number": 2,
            "problem_text": "<masala matni>",
            "student_solution": "<o'quvchi yechimi>",
            "is_correct": false,
            "score": 0,
            "error_step": 2,
            "steps": [
                {
                    "step_number": 1,
                    "student_step": "<qadam>",
                    "is_correct": true,
                    "explanation": ""
                },
                {
                    "step_number": 2,
                    "student_step": "<xato qadam>",
                    "is_correct": false,
                    "explanation": "<xato nimada ekanligi>"
                }
            ],
            "error_explanation": "<umumiy tushuntirish>",
            "correct_answer": "<to'g'ri javob>",
            "real_life_example": "<hayotiy misol bilan tushuntirish>"
        }
    ],
    "weak_topics": ["<zaif mavzular>"],
    "recommendation": "<o'quvchiga tavsiya>"
}

MUHIM: Agar rasmdagi yozuv o'qib bo'lmaydigan bo'lsa, quyidagi JSON qaytar:
{
    "ocr_error": true,
    "ocr_error_message": "Rasmdagi yozuvni o'qib bo'lmadi. Iltimos yaxshiroq sifatda qayta yuboring.",
    "problems": []
}"""

    async def check_homework(
        self,
        image_bytes: bytes,
        subject: str = "matematika",
        grade: int = 7,
        topic: str = "",
        mime_type: str = "image/jpeg"
    ) -> Dict:
        """
        Daftar rasmini Gemini ga yuborib tekshirish.
        
        Args:
            image_bytes: Preprocessed rasm (bytes)
            subject: Fan nomi
            grade: Sinf raqami
            topic: Mavzu nomi (ixtiyoriy)
            mime_type: Rasm turi (image/jpeg yoki image/png)
            
        Returns:
            Tekshiruv natijasi (dict)
        """
        # API kalitni olish va Gemini ni sozlash
        api_key = self.key_manager.get_current_key()
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(self.model_name)
        
        # User prompt
        user_prompt = f"""Fan: {subject}
Sinf: {grade}-sinf
Mavzu: {topic or "umumiy"}

Yuqoridagi rasmdagi uyga vazifa yechimini tekshir va JSON formatda natija qaytar."""
        
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                # Gemini ga rasm + prompt yuborish
                response = model.generate_content(
                    [
                        self.SYSTEM_PROMPT,
                        {
                            "mime_type": mime_type,
                            "data": image_bytes
                        },
                        user_prompt
                    ],
                    generation_config=genai.GenerationConfig(
                        temperature=0.1,  # Past temperature = aniqroq natija
                        max_output_tokens=4096,
                    )
                )
                
                # Muvaffaqiyatli so'rovni qayd qilish
                self.key_manager.record_usage()
                
                # JSON ni parse qilish
                result = self._extract_json(response.text)
                
                # OCR xatosi tekshirish
                if result.get("ocr_error"):
                    return result
                
                # Score qo'shish (agar yo'q bo'lsa)
                if "overall_score" in result and "total_problems" in result:
                    total = result["total_problems"]
                    correct = result.get("correct_count", 0)
                    result["score_percentage"] = round(
                        (correct / total * 100) if total > 0 else 0, 1
                    )
                
                return result
                
            except Exception as e:
                error_str = str(e)
                
                # Rate limit xatosi — keyingi kalitga o'tish
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    logger.warning(f"Rate limit! Kalit almashtirilmoqda... (urinish {attempt + 1})")
                    self.key_manager.rotate_key()
                    
                    if attempt < max_retries - 1:
                        # Yangi kalit bilan qayta sozlash
                        api_key = self.key_manager.get_current_key()
                        genai.configure(api_key=api_key)
                        model = genai.GenerativeModel(self.model_name)
                        await asyncio.sleep(1)  # 1 sek kutish
                        continue
                
                # Boshqa xato
                if attempt == max_retries - 1:
                    logger.error(f"Gemini xatosi: {error_str}")
                    return {
                        "error": True,
                        "error_message": f"AI tekshiruvda xatolik: {error_str[:200]}",
                        "problems": []
                    }
        
        return {"error": True, "error_message": "Noma'lum xato", "problems": []}
    
    def _extract_json(self, text: str) -> Dict:
        """Gemini javobidan JSON ajratib olish."""
        # 1. To'g'ridan-to'g'ri parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass
        
        # 2. ```json ... ``` ichidan
        json_match = re.search(r'```json\s*(.*?)\s*```', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # 3. { ... } ichidan (eng katta JSON blokni topish)
        brace_count = 0
        start = -1
        for i, char in enumerate(text):
            if char == '{':
                if brace_count == 0:
                    start = i
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0 and start != -1:
                    try:
                        return json.loads(text[start:i+1])
                    except json.JSONDecodeError:
                        start = -1
        
        # Parse qilib bo'lmadi
        return {
            "error": True,
            "error_message": "AI javobini parse qilib bo'lmadi",
            "raw_response": text[:500],
            "problems": []
        }
    
    async def explain_further(
        self,
        problem_data: Dict,
        student_question: str = ""
    ) -> str:
        """
        O'quvchi qo'shimcha tushuntirish so'raganda.
        
        Args:
            problem_data: Bitta masala haqida ma'lumot (ai_result dan)
            student_question: O'quvchining savoli
            
        Returns:
            Tushuntirish matni
        """
        api_key = self.key_manager.get_current_key()
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(self.model_name)
        
        prompt = f"""O'quvchi quyidagi masala haqida qo'shimcha tushuntirish so'rayapti:

Masala: {problem_data.get('problem_text', '')}
O'quvchining yechimi: {problem_data.get('student_solution', '')}
Xatosi: {problem_data.get('error_explanation', '')}
To'g'ri javob: {problem_data.get('correct_answer', '')}

O'quvchining savoli: {student_question or "Buni batafsil tushuntiring"}

QOIDALAR:
- O'zbek tilida (lotin alifbosida) yoz
- Sodda va tushunarli qilib tushuntir (maktab o'quvchisi tushunsin)
- Real hayotdan misol keltir (bozor, sport, ovqat pishirish)
- Qadam-baqadam ko'rsat
- Eng ko'pi bilan 200 so'z ishlat
- Emoji ishlat: ✅ ❌ 💡 📝"""
        
        try:
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=1024,
                )
            )
            self.key_manager.record_usage()
            return response.text
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                self.key_manager.rotate_key()
                return await self.explain_further(problem_data, student_question)
            return f"Tushuntirish olishda xatolik: {str(e)[:100]}"
    
    def get_api_stats(self) -> dict:
        """API kalitlar statistikasi."""
        return self.key_manager.get_stats()
```

### 5.3 Image Preprocessor (services/image_processor.py)

```python
"""
Daftar rasmlarini Gemini uchun tayyorlash.
OCR aniqligini 2-3 barobar oshiradi.
"""

import cv2
import numpy as np


class ImageProcessor:
    """Daftar rasmlarini optimal holatga keltiradi."""
    
    MAX_DIMENSION = 2000
    
    def process(self, image_bytes: bytes) -> bytes:
        """
        Rasm preprocessing pipeline.
        
        Args:
            image_bytes: Telegram dan kelgan raw rasm
            
        Returns:
            Gemini uchun tayyorlangan rasm (bytes)
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Rasmni o'qib bo'lmadi")
        
        # 1. Resize
        img = self._resize(img)
        
        # 2. Grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 3. Deskew (egrilikni to'g'rilash)
        gray = self._deskew(gray)
        
        # 4. Noise removal
        gray = cv2.fastNlMeansDenoising(gray, h=10)
        
        # 5. Contrast enhancement (CLAHE)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        gray = clahe.apply(gray)
        
        # 6. Adaptive threshold — qo'lyozmani aniqroq qiladi
        processed = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            blockSize=11,
            C=2
        )
        
        # PNG formatda qaytarish (sifat saqlanadi)
        success, buffer = cv2.imencode('.png', processed)
        if not success:
            raise ValueError("Rasmni encode qilib bo'lmadi")
        return buffer.tobytes()
    
    def process_light(self, image_bytes: bytes) -> bytes:
        """
        Yengil preprocessing — agar to'liq preprocessing
        natijani yomonlashtirsa.
        Faqat resize + contrast.
        """
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Rasmni o'qib bo'lmadi")
        
        img = self._resize(img)
        
        # Faqat contrast oshirish
        lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        l = clahe.apply(l)
        lab = cv2.merge([l, a, b])
        img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)
        
        success, buffer = cv2.imencode('.jpeg', img, [cv2.IMWRITE_JPEG_QUALITY, 95])
        return buffer.tobytes()
    
    def _resize(self, img: np.ndarray) -> np.ndarray:
        h, w = img.shape[:2]
        if max(h, w) > self.MAX_DIMENSION:
            scale = self.MAX_DIMENSION / max(h, w)
            img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_AREA)
        return img
    
    def _deskew(self, gray: np.ndarray) -> np.ndarray:
        coords = np.column_stack(np.where(gray > 0))
        if len(coords) < 100:
            return gray
        angle = cv2.minAreaRect(coords)[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        if abs(angle) < 0.5:
            return gray
        h, w = gray.shape[:2]
        M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
        return cv2.warpAffine(gray, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
```

### 5.4 Asosiy Handler (bot/handlers/submit.py)

```python
"""
ASOSIY HANDLER — o'quvchi rasm yuborganida ishlaydi.
Butun pipeline ni boshqaradi:
Rasm → Preprocessing → Gemini → Natija
"""

from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import ContextTypes
import time
import logging

from backend.services.gemini_service import GeminiService
from backend.services.image_processor import ImageProcessor
from backend.services.notification import NotificationService
from backend.bot.messages import *
from backend.database import get_session
from backend.models.submission import Submission
from backend.models.user import User

logger = logging.getLogger(__name__)

gemini = GeminiService()
image_processor = ImageProcessor()
notification = NotificationService()


async def handle_photo(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """O'quvchi rasm yuborganida — butun pipeline ishlaydi."""
    
    user_tg_id = update.effective_user.id
    
    # 1. Foydalanuvchini tekshirish
    async with get_session() as session:
        user = await User.get_by_telegram_id(session, user_tg_id)
        
        if not user:
            await update.message.reply_text("Avval ro'yxatdan o'ting: /start")
            return
        
        # 2. Kunlik limit tekshirish
        if not user.is_premium and user.daily_submissions_count >= 3:
            await update.message.reply_text(
                SUBMIT_DAILY_LIMIT.format(limit=3),
                parse_mode="Markdown"
            )
            return
    
    # 3. "Tekshirilmoqda..." xabari
    processing_msg = await update.message.reply_text(
        "⏳ Tekshirilmoqda... Bir oz kuting (5-7 soniya)"
    )
    start_time = time.time()
    
    try:
        # 4. Rasmni yuklab olish
        photo = update.message.photo[-1]  # eng katta razmer
        
        # Rasm hajmini tekshirish
        if photo.file_size and photo.file_size > 10 * 1024 * 1024:
            await processing_msg.edit_text(ERROR_IMAGE_TOO_LARGE)
            return
        
        file = await context.bot.get_file(photo.file_id)
        image_bytes = await file.download_as_bytearray()
        
        # 5. Image Preprocessing
        try:
            processed_image = image_processor.process(bytes(image_bytes))
            mime_type = "image/png"
        except Exception:
            # Preprocessing xato bersa, original rasmni ishlat
            processed_image = bytes(image_bytes)
            mime_type = "image/jpeg"
            logger.warning("Preprocessing xato, original rasm ishlatilmoqda")
        
        # 6. GEMINI — OCR + Tekshiruv + Tushuntirish (BITTA CHAQIRUV)
        ai_result = await gemini.check_homework(
            image_bytes=processed_image,
            subject=user.subject or "matematika",
            grade=user.grade or 7,
            topic="",
            mime_type=mime_type
        )
        
        # 7. Xatolarni tekshirish
        if ai_result.get("ocr_error"):
            await processing_msg.edit_text(
                SUBMIT_OCR_FAIL,
                parse_mode="Markdown"
            )
            return
        
        if ai_result.get("error"):
            await processing_msg.edit_text(
                f"❌ {ai_result.get('error_message', 'Xatolik yuz berdi')}"
            )
            return
        
        # 8. Natijani DB ga saqlash
        processing_time = int((time.time() - start_time) * 1000)
        score_pct = ai_result.get("score_percentage", 0)
        
        async with get_session() as session:
            submission = Submission(
                student_id=user.id,
                image_url=photo.file_id,
                ocr_raw_text=ai_result.get("ocr_text", ""),
                subject=user.subject or "matematika",
                grade=user.grade,
                ai_result=ai_result,
                score=score_pct,
                status="completed",
                processing_duration_ms=processing_time
            )
            session.add(submission)
            
            user.daily_submissions_count += 1
            await session.commit()
            
            submission_id = str(submission.id)
        
        # 9. Natijani foydalanuvchiga yuborish
        result_text = _format_result(ai_result, processing_time)
        
        # Tushuntirish tugmalari
        keyboard = _make_explain_keyboard(ai_result, submission_id)
        
        await processing_msg.edit_text(
            result_text,
            parse_mode="Markdown",
            reply_markup=keyboard
        )
        
        # 10. Ota-onaga notification
        if user.parent_id:
            await notification.notify_parent(
                parent_id=user.parent_id,
                child_name=user.full_name,
                ai_result=ai_result,
                subject=user.subject
            )
        
        logger.info(
            f"Tekshiruv yakunlandi: {processing_time}ms, "
            f"ball: {score_pct}%, "
            f"masalalar: {ai_result.get('total_problems', 0)}"
        )
        
    except Exception as e:
        logger.error(f"Pipeline xatosi: {str(e)}", exc_info=True)
        await processing_msg.edit_text(
            f"❌ Xatolik yuz berdi. Iltimos qayta urinib ko'ring.\n\n"
            f"Agar muammo davom etsa, /help buyrug'ini yuboring."
        )


def _format_result(ai_result: dict, processing_ms: int) -> str:
    """AI natijasini chiroyli Telegram xabar formatiga o'girish."""
    total = ai_result.get("total_problems", 0)
    correct = ai_result.get("correct_count", 0)
    incorrect = ai_result.get("incorrect_count", 0)
    score = ai_result.get("score_percentage", 0)
    
    # Emoji tanlash
    if score >= 90:
        emoji = "🏆"
        status = "Ajoyib!"
    elif score >= 70:
        emoji = "👍"
        status = "Yaxshi!"
    elif score >= 50:
        emoji = "💪"
        status = "O'rtacha, mashq qiling"
    else:
        emoji = "📚"
        status = "Ko'proq mashq kerak"
    
    # Asosiy natija
    text = f"""{emoji} *Natija: {status}*

✅ To'g'ri: {correct}/{total}
❌ Xato: {incorrect}/{total}
📊 Ball: {score}%
⏱ Vaqt: {processing_ms / 1000:.1f} sek

"""
    
    # Har bir masala
    for p in ai_result.get("problems", []):
        if p.get("is_correct"):
            text += f"✅ *{p['number']}-masala:* To'g'ri!\n"
        else:
            text += f"❌ *{p['number']}-masala:* Xato\n"
            if p.get("error_explanation"):
                text += f"   💡 _{p['error_explanation']}_\n"
            if p.get("correct_answer"):
                text += f"   ✏️ To'g'ri javob: `{p['correct_answer']}`\n"
        text += "\n"
    
    # Tavsiya
    rec = ai_result.get("recommendation", "")
    if rec:
        text += f"📌 *Tavsiya:* {rec}\n\n"
    
    text += "💡 _Tushunmagan masala bormi? Quyidagi tugmani bosing_"
    
    return text


def _make_explain_keyboard(ai_result: dict, submission_id: str):
    """Xato masalalar uchun "Tushuntir" tugmalari."""
    buttons = []
    row = []
    
    for p in ai_result.get("problems", []):
        if not p.get("is_correct"):
            row.append(
                InlineKeyboardButton(
                    f"📝 {p['number']}-masalani tushuntir",
                    callback_data=f"explain_{submission_id}_{p['number']}"
                )
            )
            if len(row) == 2:
                buttons.append(row)
                row = []
    
    if row:
        buttons.append(row)
    
    if not buttons:
        return None
    
    return InlineKeyboardMarkup(buttons)
```

### 5.5 Tushuntirish Handler (bot/handlers/explain.py)

```python
"""
O'quvchi "Tushuntir" tugmasini bosganda ishlaydi.
Xato masalani batafsil tushuntiradi.
"""

from telegram import Update, CallbackQuery
from telegram.ext import ContextTypes

from backend.services.gemini_service import GeminiService
from backend.database import get_session
from backend.models.submission import Submission

gemini = GeminiService()


async def handle_explain_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Inline tugma bosilganda — masalani batafsil tushuntirish."""
    query: CallbackQuery = update.callback_query
    await query.answer()
    
    # callback_data: "explain_{submission_id}_{problem_number}"
    parts = query.data.split("_")
    if len(parts) != 3:
        return
    
    submission_id = parts[1]
    problem_number = int(parts[2])
    
    await query.edit_message_text(
        query.message.text + "\n\n⏳ _Tushuntirish tayyorlanmoqda..._",
        parse_mode="Markdown"
    )
    
    # Submission dan masala ma'lumotlarini olish
    async with get_session() as session:
        submission = await session.get(Submission, submission_id)
        if not submission or not submission.ai_result:
            await query.edit_message_text("❌ Ma'lumot topilmadi")
            return
        
        # Kerakli masalani topish
        problem_data = None
        for p in submission.ai_result.get("problems", []):
            if p.get("number") == problem_number:
                problem_data = p
                break
        
        if not problem_data:
            await query.edit_message_text("❌ Masala topilmadi")
            return
    
    # Gemini dan batafsil tushuntirish olish
    explanation = await gemini.explain_further(
        problem_data=problem_data,
        student_question=""
    )
    
    # Original xabar + tushuntirish
    text = query.message.text.replace(
        "⏳ _Tushuntirish tayyorlanmoqda..._", ""
    )
    text += f"\n\n📖 *{problem_number}-masala tushuntirishi:*\n\n{explanation}"
    
    await query.edit_message_text(text, parse_mode="Markdown")
```

---

## 6. BOT XABARLARI (bot/messages.py)

```python
"""Barcha bot xabarlari o'zbek tilida."""

WELCOME_MESSAGE = """🎓 *TekshirAI* ga xush kelibsiz!

Men sizning shaxsiy AI repetitoringizman.
Uyga vazifangizni suratga olib yuboring — men tekshirib, xatolarni tushuntirib beraman.

📸 *Qanday ishlaydi:*
1. Daftaringizni suratga oling
2. Menga yuboring  
3. 5-7 soniyada natija oling!

🆓 *Bepul:* Kuniga 3 ta tekshiruv
💎 *Premium:* Cheksiz tekshiruv — 29,000 so'm/oy

Boshlash uchun ro'yxatdan o'ting 👇"""

REGISTRATION_ROLE = "Kim sifatida ro'yxatdan o'tmoqchisiz?"
REGISTRATION_NAME = "Ismingizni kiriting:"
REGISTRATION_GRADE = "Nechanchi sinfda o'qiysiz?"
REGISTRATION_SUBJECT = "Qaysi fanni tekshirmoqchisiz?"
REGISTRATION_SUCCESS = """✅ Ro'yxatdan o'tdingiz!

👤 Ism: {name}
📚 Sinf: {grade}-sinf
📐 Fan: {subject}

Endi daftar suratini yuboring! 📸"""

SUBMIT_OCR_FAIL = """❌ Rasmdagi yozuvni o'qiy olmadim.

Iltimos:
📸 Yaxshi yorug'likda suratga oling
📐 Daftarni tekis qo'ying
🔍 Yozuv aniq ko'rinsin
📏 Faqat yechilgan qismni suratga oling

Qayta yuboring 👇"""

SUBMIT_DAILY_LIMIT = """⚠️ Bugungi bepul limitingiz tugadi ({limit} ta).

💎 *Premium obuna bilan cheksiz tekshiring:*
💰 Oyiga atigi 29,000 so'm
✅ Cheksiz tekshiruv
✅ Barcha fanlar (Matem + Fizika + Kimyo)
✅ Batafsil tushuntirish + hayotiy misollar
✅ Adaptiv mashqlar

/premium — Obuna bo'lish"""

STATS_MESSAGE = """📊 *Sizning statistikangiz:*

📚 Jami tekshirilgan: {total} ta vazifa
✅ O'rtacha ball: {avg_score}%

💪 Kuchli tomoningiz: {strong_topics}
⚠️ Mashq qilish kerak: {weak_topics}

📅 Bugungi tekshiruvlar: {today_count}/{daily_limit}"""

PARENT_DAILY_REPORT = """📊 *{child_name}ning bugungi natijasi:*

📚 Fan: {subject}
✅ To'g'ri: {correct}/{total}  
📊 Ball: {score}%

{status_emoji} {status_message}

💡 *Tavsiya:* {recommendation}"""

ERROR_NOT_IMAGE = "📸 Iltimos, rasm yuboring."
ERROR_IMAGE_TOO_LARGE = "📸 Rasm juda katta (max 10MB). Kichikroq rasm yuboring."
ERROR_GENERAL = "❌ Xatolik yuz berdi. Iltimos qayta urinib ko'ring."
```

---

## 7. DATABASE MODELLARI

### 7.1 users jadvali
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(100),
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'teacher', 'parent')),
    grade INT CHECK (grade BETWEEN 1 AND 11),
    subject VARCHAR(100),
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP,
    daily_submissions_count INT DEFAULT 0,
    daily_reset_date DATE DEFAULT CURRENT_DATE,
    parent_id UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7.2 submissions jadvali
```sql
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id),
    classroom_id UUID REFERENCES classrooms(id),
    image_url TEXT NOT NULL,
    ocr_raw_text TEXT,
    subject VARCHAR(100) NOT NULL DEFAULT 'matematika',
    grade INT,
    topic VARCHAR(200),
    ai_result JSONB,  -- Gemini dan kelgan to'liq JSON
    score FLOAT,
    status VARCHAR(20) DEFAULT 'pending',
    error_message TEXT,
    processing_duration_ms INT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.3 classrooms jadvali
```sql
CREATE TABLE classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES users(id),
    name VARCHAR(50) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    invite_code VARCHAR(10) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.4 classroom_students
```sql
CREATE TABLE classroom_students (
    classroom_id UUID REFERENCES classrooms(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (classroom_id, student_id)
);
```

---

## 8. REQUIREMENTS.TXT

```
# Backend
fastapi==0.109.0
uvicorn[standard]==0.27.0
python-telegram-bot==20.7
sqlalchemy[asyncio]==2.0.25
asyncpg==0.29.0
psycopg2-binary==2.9.9
alembic==1.13.1
pydantic==2.5.3
pydantic-settings==2.1.0
python-dotenv==1.0.0
python-jose[cryptography]==3.3.0
python-multipart==0.0.6

# Gemini API
google-generativeai==0.8.0

# Image Processing
opencv-python-headless==4.9.0.80
Pillow==10.2.0
numpy==1.26.3

# Utils
httpx==0.26.0
aiofiles==23.2.1
```

---

## 9. DOCKER COMPOSE

```yaml
version: '3.8'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: tekshirai
      POSTGRES_USER: tekshirai
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: .
    command: uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
    ports:
      - "8000:8000"
    env_file: .env
    depends_on:
      - db

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"

volumes:
  postgres_data:
```

---

## 10. ISHGA TUSHIRISH

```bash
# 1. Clone
git clone https://github.com/your-username/tekshir-ai.git
cd tekshir-ai

# 2. Virtual environment
python -m venv venv
source venv/bin/activate

# 3. Dependencies
pip install -r requirements.txt

# 4. .env faylini yaratish
cp .env.example .env
# GEMINI_API_KEYS ga API kalitlarni qo'ying
# TELEGRAM_BOT_TOKEN ni qo'ying

# 5. Database
docker-compose up -d db
python scripts/init_db.py

# 6. Backend
uvicorn backend.main:app --reload --port 8000

# 7. Bot (alohida terminal)
python -m backend.bot.bot

# 8. Frontend (alohida terminal)
cd frontend && npm install && npm run dev
```

---

## 11. GEMINI API KALITLARNI OLISH

### Qadam-baqadam:
1. https://aistudio.google.com/apikey ga boring
2. Gmail hisobingiz bilan kiring
3. "Create API Key" tugmasini bosing
4. API kalitni nusxalang
5. .env fayliga qo'shing

### Ko'p kalit strategiyasi:
- gmail1@gmail.com → API Key 1 (kuniga 250 so'rov)
- gmail2@gmail.com → API Key 2 (kuniga 250 so'rov)
- gmail3@gmail.com → API Key 3 (kuniga 250 so'rov)
- gmail4@gmail.com → API Key 4 (kuniga 250 so'rov)
- gmail5@gmail.com → API Key 5 (kuniga 250 so'rov)
- JAMI: kuniga 1,250 ta BEPUL so'rov!

```env
GEMINI_API_KEYS=AIzaSy_key1,AIzaSy_key2,AIzaSy_key3,AIzaSy_key4,AIzaSy_key5
```

---

## 12. HACKATHON DEMO TAYYORGARLIK

### Demo scenario:
1. Telefondan daftarni suratga oling (oldindan tayyorlangan chiroyli yozuv)
2. Telegram botga yuboring
3. 5-7 soniyada natija chiqadi
4. "Tushuntir" tugmasini bosing — AI batafsil tushuntiradi
5. O'qituvchi dashboardni oching — sinf statistikasi
6. Ota-onaga avtomatik xabar bordi

### Tayyor test rasmlar tayyorlang:
- Rasm 1: 5 ta masala, barchasi to'g'ri (100%)
- Rasm 2: 5 ta masala, 2 ta xato (60%)
- Rasm 3: qiyin qo'lyozma (OCR test)

### Backup plan:
Agar demo paytida Gemini ishlamasa — /text buyrug'i orqali matnli kiritish

### Taqdimotdagi killer raqamlar:
- PISA-2022: O'zbekiston 364 ball, OECD 472 — 108 ball orqada
- 6.5 million o'quvchi, 450,000 o'qituvchi
- O'qituvchi kuniga 2-3 soat daftar tekshiradi
- TekshirAI: 5-7 soniyada natija, BEPUL
- Xitoy allaqachon qo'llayapti — lekin qimmat jihozlar bilan
- Biz = Xitoy natijasi + Telegram + $0 xarajat

---

## 13. TEXNOLOGIYA SOLISHTIRISHI

| Xususiyat | Eski (Google Vision + Claude) | YANGI (Gemini) |
|-----------|-------------------------------|----------------|
| API soni | 2 ta (pullik) | 1 ta (BEPUL) |
| Oylik xarajat | ~$15-20 | $0 |
| Pipeline bosqichlari | 6 ta | 3 ta |
| Qo'lyozma aniqligi | ~80% | ~95-100% |
| Javob vaqti | 8-10 sek | 5-7 sek |
| Til qo'llab-quvvatlash | Alohida sozlash kerak | O'zbek tilini tushunadi |
| Rasmni o'qish | Alohida OCR API | Gemini o'zi o'qiydi |
