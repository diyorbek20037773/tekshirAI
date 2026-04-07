"""
ASOSIY SERVIS — Gemini API bilan ishlash.
OCR + Tekshiruv + Tushuntirish + AI Suhbat — hammasi shu yerda.
"""

import json
import re
import asyncio
import logging
from typing import Dict, List

import google.generativeai as genai

from backend.services.key_manager import KeyManager
from backend.services.subject_prompts import get_subject_prompt
from backend.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    """Gemini API bilan ishlash — OCR + Tekshiruv + Tushuntirish + Suhbat."""

    def __init__(self):
        self.key_manager = KeyManager()
        self.model_name = settings.GEMINI_MODEL

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
        BITTA API chaqiruvda: OCR + Tekshiruv + Tushuntirish.
        """
        api_key = self.key_manager.get_current_key()
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(self.model_name)

        subject_specific = get_subject_prompt(subject)

        user_prompt = f"""{subject_specific}

Fan: {subject}
Sinf: {grade}-sinf
Mavzu: {topic or "umumiy"}

Yuqoridagi rasmdagi uyga vazifa yechimini tekshir va JSON formatda natija qaytar."""

        max_retries = 3

        for attempt in range(max_retries):
            try:
                contents = [
                    self.SYSTEM_PROMPT,
                    {"mime_type": mime_type, "data": image_bytes},
                    user_prompt,
                ]
                gen_config = genai.GenerationConfig(
                    temperature=0.1,
                    max_output_tokens=8192,
                )

                def _call():
                    return model.generate_content(contents, generation_config=gen_config)

                response = await asyncio.wait_for(
                    asyncio.to_thread(_call),
                    timeout=45,
                )

                self.key_manager.record_usage()
                logger.info(f"Gemini javob olindi: {len(response.text)} belgi")
                result = self._extract_json(response.text)

                if result.get("ocr_error"):
                    return result

                # Score foizini hisoblash
                if "total_problems" in result:
                    total = result["total_problems"]
                    correct = result.get("correct_count", 0)
                    result["score_percentage"] = round(
                        (correct / total * 100) if total > 0 else 0, 1
                    )

                return result

            except asyncio.TimeoutError:
                logger.warning(f"Gemini timeout! (urinish {attempt + 1})")
                if attempt == max_retries - 1:
                    return {
                        "error": True,
                        "error_message": "AI javob bermadi (timeout). Qayta urinib ko'ring.",
                        "problems": []
                    }
                continue

            except Exception as e:
                error_str = str(e)

                # Rate limit — keyingi kalitga o'tish
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    logger.warning(f"Rate limit! Kalit almashtirilmoqda... (urinish {attempt + 1})")
                    self.key_manager.rotate_key()

                    if attempt < max_retries - 1:
                        api_key = self.key_manager.get_current_key()
                        genai.configure(api_key=api_key)
                        model = genai.GenerativeModel(self.model_name)
                        await asyncio.sleep(1)
                        continue

                if attempt == max_retries - 1:
                    logger.error(f"Gemini xatosi: {error_str}")
                    return {
                        "error": True,
                        "error_message": f"AI tekshiruvda xatolik: {error_str[:200]}",
                        "problems": []
                    }

        return {"error": True, "error_message": "Noma'lum xato", "problems": []}

    async def explain_further(
        self,
        problem_data: Dict,
        student_question: str = ""
    ) -> str:
        """O'quvchi qo'shimcha tushuntirish so'raganda."""
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
- Batafsil tushuntir, fikrni oxirigacha yetkazib ber
- Emoji ishlat: ✅ ❌ 💡 📝
- FAQAT shu masala haqida gaplash, boshqa mavzularga o'tma
- Agar savol fanga aloqador bo'lmasa: "Men faqat fan bo'yicha yordam beraman 📚" de"""

        try:
            response = model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    temperature=0.3,
                    max_output_tokens=2048,
                )
            )
            self.key_manager.record_usage()
            return response.text
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                self.key_manager.rotate_key()
                return await self.explain_further(problem_data, student_question)
            return f"Tushuntirish olishda xatolik: {str(e)[:100]}"

    async def chat_about_problem(
        self,
        problem_data: Dict,
        conversation_history: List[Dict],
        student_message: str,
        grade: int = 7,
        subject: str = "matematika"
    ) -> str:
        """
        O'quvchi bilan masala haqida suhbat — to'liq dialog.
        O'quvchi tushunguncha davom etadi.
        """
        api_key = self.key_manager.get_current_key()
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(self.model_name)

        # Oldingi suhbat tarixini formatlash
        history_text = ""
        for msg in conversation_history:
            role = "O'quvchi" if msg["role"] == "student" else "AI o'qituvchi"
            history_text += f"{role}: {msg['text']}\n"

        prompt = f"""Sen sabr-toqatli o'zbek o'qituvchisan. O'quvchi {grade}-sinf, {subject} fanidan
masalani tushunmadi.

MASALA MA'LUMOTLARI:
- Masala: {problem_data.get('problem_text', '')}
- O'quvchi yechimi: {problem_data.get('student_solution', '')}
- Xatosi: {problem_data.get('error_explanation', '')}
- To'g'ri javob: {problem_data.get('correct_answer', '')}

OLDINGI SUHBAT:
{history_text}

O'QUVCHINING HOZIRGI SAVOLI: {student_message}

QOIDALAR:
- O'zbek tilida (lotin alifbosida) yoz
- Oddiy, tushunarli tilda tushuntir
- Hayotiy misollar bilan (bozor, sport, ovqat pishirish, pul hisoblash)
- Agar o'quvchi "tushundim" desa — tabrikla va rag'batlantir
- Agar o'quvchi "boshqa usulda" desa — boshqa usul bilan tushuntir
- Agar "shunga o'xshash masala" desa — o'xshash yangi masala ber
- Batafsil va tushunarli javob ber, fikrni oxirigacha yetkazib ber
- Emoji ishlat: ✅ ❌ 💡 📝 🎯

MUHIM CHEKLOV:
- Sen FAQAT {subject} fani va shu masala haqida gaplash
- Agar o'quvchi boshqa mavzuda savol bersa (masalan, o'yin, kino, shaxsiy savollar) — JAVOB BERMA
- Buning o'rniga ayt: "Men faqat {subject} fani bo'yicha yordam bera olaman. Shu fan bo'yicha savol bering! 📚"
- Hech qachon fan mavzusidan tashqari ma'lumot berma"""

        try:
            gen_config = genai.GenerationConfig(temperature=0.3, max_output_tokens=4096)
            def _call():
                return model.generate_content(prompt, generation_config=gen_config)
            response = await asyncio.wait_for(asyncio.to_thread(_call), timeout=45)
            self.key_manager.record_usage()
            return response.text
        except asyncio.TimeoutError:
            return "AI javob bermadi (timeout). Qayta urinib ko'ring."
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                self.key_manager.rotate_key()
                return await self.chat_about_problem(
                    problem_data, conversation_history, student_message, grade, subject
                )
            logger.error(f"Chat xatosi: {e}")
            return f"Javob olishda xatolik: {str(e)[:100]}"

    async def chat_about_topic(
        self,
        topic: str,
        conversation_history: List[Dict],
        student_message: str,
        grade: int = 7,
        subject: str = "matematika"
    ) -> str:
        """Umumiy mavzu haqida suhbat (masalasiz)."""
        api_key = self.key_manager.get_current_key()
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(self.model_name)

        history_text = ""
        for msg in conversation_history:
            role = "O'quvchi" if msg["role"] == "student" else "AI o'qituvchi"
            history_text += f"{role}: {msg['text']}\n"

        prompt = f"""Sen sabr-toqatli o'zbek o'qituvchisan. O'quvchi {grade}-sinf, {subject} fani.

MAVZU: {topic}

OLDINGI SUHBAT:
{history_text}

O'QUVCHI SAVOLI: {student_message}

QOIDALAR:
- O'zbek tilida (lotin alifbosida) yoz
- Oddiy, tushunarli tilda tushuntir
- Hayotiy misollar bilan (bozor, sport, ovqat pishirish, pul hisoblash)
- Savolga ANIQ javob ber, mavzudan chiqma
- Batafsil va tushunarli javob ber, fikrni oxirigacha yetkazib ber
- Emoji ishlat: ✅ ❌ 💡 📝 🎯

MUHIM CHEKLOV:
- Sen FAQAT {subject} fani va {topic} mavzusi haqida gaplash
- Agar o'quvchi boshqa mavzuda savol bersa (masalan, o'yin, kino, shaxsiy savollar, boshqa fan) — JAVOB BERMA
- Buning o'rniga ayt: "Men faqat {subject} fani bo'yicha yordam bera olaman. Shu fan bo'yicha savol bering! 📚"
- Hech qachon fan mavzusidan tashqari ma'lumot berma"""

        try:
            gen_config = genai.GenerationConfig(temperature=0.3, max_output_tokens=4096)
            def _call():
                return model.generate_content(prompt, generation_config=gen_config)
            response = await asyncio.wait_for(asyncio.to_thread(_call), timeout=45)
            self.key_manager.record_usage()
            return response.text
        except asyncio.TimeoutError:
            return "AI javob bermadi (timeout). Qayta urinib ko'ring."
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                self.key_manager.rotate_key()
                return await self.chat_about_topic(
                    topic, conversation_history, student_message, grade, subject
                )
            logger.error(f"Chat topic xatosi: {e}")
            return f"Javob olishda xatolik: {str(e)[:100]}"

    def _extract_json(self, text: str) -> Dict:
        """Gemini javobidan JSON ajratib olish (4 usul bilan)."""
        # Boshidagi/oxiridagi bo'sh joylarni tozalash
        text = text.strip()

        # 1. To'g'ridan-to'g'ri parse
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # 2. ```json ... ``` ichidan
        json_match = re.search(r'```(?:json)?\s*(.*?)\s*```', text, re.DOTALL)
        if json_match:
            try:
                return json.loads(json_match.group(1))
            except json.JSONDecodeError:
                pass

        # 3. { ... } ichidan (eng katta JSON blokni topish)
        brace_count = 0
        start = -1
        candidates = []
        for i, char in enumerate(text):
            if char == '{':
                if brace_count == 0:
                    start = i
                brace_count += 1
            elif char == '}':
                brace_count -= 1
                if brace_count == 0 and start != -1:
                    candidates.append(text[start:i + 1])
                    start = -1

        # Eng uzun kandidatni parse qilish
        for candidate in sorted(candidates, key=len, reverse=True):
            try:
                return json.loads(candidate)
            except json.JSONDecodeError:
                continue

        # 4. Yarim JSON ni tuzatishga harakat qilish (oxiri kesilgan bo'lishi mumkin)
        first_brace = text.find('{')
        if first_brace != -1:
            json_text = text[first_brace:]
            # Yopilmagan qavslarni yopish
            open_braces = json_text.count('{') - json_text.count('}')
            open_brackets = json_text.count('[') - json_text.count(']')
            json_text += ']' * max(0, open_brackets)
            json_text += '}' * max(0, open_braces)
            try:
                return json.loads(json_text)
            except json.JSONDecodeError:
                pass

        logger.warning(f"JSON parse xatosi. Javob boshi: {text[:200]}")
        return {
            "error": True,
            "error_message": "AI javobini parse qilib bo'lmadi. Qayta urinib ko'ring.",
            "problems": []
        }

    # ============================================
    # KASB BASHORAT TIZIMI
    # O'quvchining fan natijalariga qarab kelajakdagi
    # kasb yo'nalishlarini tavsiya qilish
    # ============================================

    CAREER_PREDICTION_PROMPT = """Sen O'zbekiston maktab o'quvchilari uchun professional kasbga yo'naltirish maslahatchisin.

O'QUVCHI MA'LUMOTLARI:
- Sinf: {grade}-sinf
- Jami tekshiruvlar: {total_submissions}

FAN BO'YICHA NATIJALAR:
{subjects_summary}

KUCHLI TOMONLAR: {strong_topics}
ZAIF TOMONLAR: {weak_topics}

VAZIFANG:
O'quvchining fan bo'yicha natijalariga qarab, uning kelajakda qaysi kasb yo'nalishlariga moyilligi borligini tahlil qil.

QOIDALAR:
1. O'zbek tilida (lotin alifbosida) yoz
2. "Bashorat" dema — "Qiziqarli yo'nalishlar" de
3. Har bir tavsiya etilgan kasb uchun NEGA mos kelishini tushuntir
4. Kamida 3 ta, ko'pi bilan 5 ta kasb tavsiya et
5. Har bir kasb uchun ishonch darajasini 0-100 orasida ber
6. Gender-neytral bo'l — barcha kasblar bola va qiz uchun teng
7. O'zbekiston mehnat bozorini hisobga ol
8. Motivatsion va rag'batlantiruvchi tonda yoz
9. Zaif tomonlarni yaxshilash tavsiyasini ham ber
10. Har bir kasb uchun qaysi fanlarga e'tibor berish kerakligini yoz

JSON FORMAT (AYNAN SHU FORMATDA QAYTAR):
{{
    "career_directions": [
        {{
            "career_name": "<kasb nomi>",
            "career_emoji": "<emoji>",
            "match_score": <0-100>,
            "reason": "<nega mos keladi — 1-2 gap>",
            "key_subjects": ["<muhim fanlar>"],
            "advice": "<nima qilish kerak — 1 gap>"
        }}
    ],
    "overall_summary": "<umumiy xulosa — 2-3 gap>",
    "improvement_plan": "<zaif tomonlarni yaxshilash rejasi — 2-3 gap>",
    "motivation": "<rag'batlantiruvchi gap>"
}}"""

    async def predict_career(self, student_data: Dict) -> Dict:
        """
        O'quvchining fan natijalariga qarab kasbiy yo'nalishlarni bashorat qilish.
        student_data: {{grade, total_submissions, subjects: {{name: avg_score}}, weak_topics, strong_topics}}
        """
        api_key = self.key_manager.get_current_key()
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(self.model_name)

        # Fan natijalarini formatlash
        subjects_summary = ""
        for subj, score in student_data.get("subjects", {}).items():
            subjects_summary += f"- {subj}: {score}%\n"

        prompt = self.CAREER_PREDICTION_PROMPT.format(
            grade=student_data.get("grade", 7),
            total_submissions=student_data.get("total_submissions", 0),
            subjects_summary=subjects_summary or "- Ma'lumot yetarli emas",
            strong_topics=", ".join(student_data.get("strong_topics", [])) or "Hali aniqlanmagan",
            weak_topics=", ".join(student_data.get("weak_topics", [])) or "Hali aniqlanmagan",
        )

        try:
            gen_config = genai.GenerationConfig(
                temperature=0.4,
                max_output_tokens=2048,
            )

            def _call():
                return model.generate_content(prompt, generation_config=gen_config)

            response = await asyncio.wait_for(
                asyncio.to_thread(_call),
                timeout=30,
            )
            self.key_manager.record_usage()
            result = self._extract_json(response.text)

            if result.get("error"):
                return {
                    "error": True,
                    "error_message": "AI javobini qayta ishlashda xatolik",
                    "career_directions": [],
                }

            return result

        except asyncio.TimeoutError:
            return {
                "error": True,
                "error_message": "AI javob bermadi (timeout)",
                "career_directions": [],
            }
        except Exception as e:
            if "429" in str(e) or "RESOURCE_EXHAUSTED" in str(e):
                self.key_manager.rotate_key()
                return await self.predict_career(student_data)
            logger.error(f"Career prediction xatosi: {e}")
            return {
                "error": True,
                "error_message": f"Xatolik: {str(e)[:200]}",
                "career_directions": [],
            }

    def get_api_stats(self) -> dict:
        """API kalitlar statistikasi."""
        return self.key_manager.get_stats()
