# TekshirAI — To'liq Loyiha Rejasi

## Context
TekshirAI — O'zbekiston maktab o'quvchilari (1-11 sinf, 6.78 mln) uchun AI asosida uyga vazifalarni avtomatik tekshirish + o'quvchi bilan AI suhbat tizimi. Telegram bot orqali ishlaydi (O'zbekistonda 18+ mln Telegram foydalanuvchi).

---

## TARGET AUDITORIYA

### Kimlar uchun?
| Segment | Tavsif | Rol |
|---------|--------|-----|
| **O'quvchilar (7-11 sinf)** | 13-17 yosh, asosiy foydalanuvchi | Rasm yuboradi, AI bilan suhbatlashadi |
| **Ota-onalar** | To'lovchi, farzand progressini kuzatuvchi | Kunlik hisobot oladi, premium sotib oladi |
| **O'qituvchilar** | Dashboard foydalanuvchisi | Sinf statistikasini ko'radi |
| **Maktab rahbariyati** | B2B qaror qabul qiluvchi | Maktab bo'ylab joriy etadi |
| **Xalq ta'limi vazirligi** | Strategik hamkor | Maktab.uz integratsiya |

### Qaysi fanlar? (STEAM + tillar)
**1-faza:** Matematika (eng katta talab — Eduten pilotda +16.9% natija)
**2-faza:** Fizika, Kimyo
**3-faza:** Biologiya, Informatika
**4-faza:** O'zbek tili (grammatika), Ingliz tili

### Qaysi maktablar?
- **Davlat maktablari** — 10,943 ta, asosiy bozor
- **Xususiy maktablar** — 455 ta, yuqori to'lov qobiliyati
- Boshlanish: Toshkent + viloyat markazlari -> kengaytirish

---

## BIZNES MODEL

### Narxlash (O'zbekiston bozori kontekstida)
- Xususiy repetitor: 80,000-150,000 so'm/soat
- TekshirAI: 10,000-30,000 so'm/oy — **10-15x arzonroq**

| Tarif | Narx | Imkoniyatlar |
|-------|------|-------------|
| **Bepul** | 0 | 3 tekshiruv/kun, AI suhbat cheklangan |
| **Premium** | 15,000 so'm/oy | Cheksiz tekshiruv, to'liq AI suhbat, tarix |
| **Oila** | 30,000 so'm/oy | 3-5 farzand, ota-ona dashboard |

### B2B (maktablar uchun)
| Hajm | Narx/oy |
|------|---------|
| Kichik maktab (300-500) | 400,000 so'm |
| O'rta maktab (500-1000) | 700,000 so'm |
| Katta maktab (1000+) | 1,000,000 so'm |

### Go-to-Market
1. B2C Telegram bot (bepul) -> foydalanuvchi bazasi
2. Premium sotish (ota-onalarga)
3. Maktablarga B2B pilotlar
4. Vazirliq hamkorligi -> Maktab.uz integratsiya

---

## UI/UX DIZAYN (Research asosida)

### Rang palitasi (bola psixologiyasi bo'yicha)
- Asosiy: #3B82F6 (ko'k) — tinchlik, diqqat, o'rganish
- Ikkinchi: #10B981 (yashil) — muvaffaqiyat, to'g'ri javob
- Aksent:  #F59E0B (sariq-to'q) — motivatsiya, mukofot, CTA
- Xato:    #EF4444 (qizil) — faqat xato ko'rsatish (kam ishlatish!)
- Premium: #8B5CF6 (binafsha) — ijodiylik, yutuqlar
- Fon:     #F8FAFC (och kulrang) — ko'zni charchatmaydigan

**Nima uchun:**
- Ko'k — diqqat va kontsentratsiyani oshiradi
- Yashil — muvaffaqiyat hissini kuchaytiradi
- Sariq/to'q — energiya beradi (lekin 10-20% dan oshmasin)
- Qizil — faqat xato ko'rsatishda, ortiqcha stress keltiradi

### Tipografiya
- **Shrift:** Inter yoki Nunito (sans-serif, bolalar uchun oson)
- **Hajm:** 16-18px body (kichik sinf), 14-16px (katta sinf)
- **Satr oralig'i:** 1.5-1.6x

### Telegram Bot UX
- Tugmalar: katta, aniq, 64px oraliq
- Har bir harakatga darhol javob (emoji + matn)
- Progress vizualizatsiya (haftalik, oylik)
- Xatolarni jazolamasdan ko'rsatish — "Deyarli to'g'ri! Mana qayerda xato:" uslubi

### Yosh bo'yicha farqlash
| Sinf | Yosh | UX xususiyatlari |
|------|------|------------------|
| 1-4 | 7-10 | Yorqin ranglar, katta tugmalar, ko'p emoji, oddiy til |
| 5-8 | 11-14 | Muvozanatli dizayn, shaxsiy progress, jamoaviy leaderboard |
| 9-11 | 15-17 | Professional interfeys, individual leaderboard, chuqur analitika |

---

## GAMIFICATION TIZIMI

### 1. XP (Tajriba ballari)
| Harakat | XP |
|---------|-----|
| Uyga vazifa tekshirish | +10 XP |
| O'z vaqtida topshirish | +5 bonus XP |
| Barcha masalalar to'g'ri | +15 bonus XP |
| AI bilan suhbat (tushunish) | +5 XP |
| 7 kunlik streak | +50 bonus XP |

### 2. Darajalar (Level)
| Daraja | XP | Nom |
|--------|-----|-----|
| 1 | 0 | Boshlang'ich |
| 2 | 100 | Harakat qiluvchi |
| 3 | 300 | Bilimdon |
| 4 | 600 | Ustoz yo'lida |
| 5 | 1000 | Akademik |
| 6 | 2000 | Professor |
| 7 | 5000 | Olim |

### 3. Streak (Ketma-ketlik)
- Har kuni kamida 1 ta vazifa tekshirish = streak davom etadi
- 7 kun streak = "Hafta yulduzi" badge
- 30 kun streak = "Oy chempioni" badge
- Dam olish kuni (yakshanba) streak buzmaydi
- "Streak himoya" — oyiga 1 marta streak buzilmasligi

### 4. Nishonlar (Badges)
| Nishon | Shart | Emoji |
|--------|-------|-------|
| Birinchi qadam | 1-chi vazifa tekshirish | birinchi yulduz |
| Hafta yulduzi | 7 kunlik streak | yulduz |
| Xatosiz kun | 1 kunda barcha to'g'ri | olmos |
| Matematik | 50 ta math to'g'ri | abakus |
| So'rovchi | AI dan 10 marta so'rash | o'ylayotgan |
| Oy chempioni | 30 kunlik streak | kubok |
| Sinf yulduzi | Sinfda 1-o'rin | toj |

### 5. Leaderboard (Reyting)
- Sinf reytingi — haftalik XP bo'yicha
- Shaxsiy progress — o'z o'tmishiga nisbatan
- Top 3: oltin, kumush, bronza medallar

---

## AI SUHBAT TIZIMI

### Konsept
O'quvchi natijani olgandan keyin tushunmagan masalasi haqida AI bilan to'liq dialog yuritadi.

### Qanday ishlaydi:
1. O'quvchi rasm yuboradi -> natija oladi
2. "Tushunmadim" tugmasini bosadi (masala raqami tanlab)
3. AI masalani qadam-baqadam tushuntiradi
4. O'quvchi yana savol berishi mumkin:
   - "Nega bunday?"
   - "Boshqa usulda ko'rsat"
   - "Shunga o'xshash masala ber"
   - "Hayotiy misol ber"
5. AI javob beradi — suhbat davom etadi
6. O'quvchi "Tushundim" bosguncha yoki 10 ta xabargacha

### Suhbat limiti
- Bepul: 3 xabar/masala
- Premium: 10 xabar/masala

---

## TEXNIK ARXITEKTURA

### Texnologiyalar
- Backend: Python 3.11+ / FastAPI
- Database: PostgreSQL + SQLAlchemy (async) + Alembic
- Bot: python-telegram-bot v20+
- AI: Google Gemini API (gemini-2.5-flash)
- Image Processing: OpenCV + Pillow
- Frontend: React 18 + TailwindCSS + Vite + Recharts
- Auth: JWT

### Fayl strukturasi
```
tekshir-ai/
  backend/
    __init__.py, main.py, config.py, database.py
    models/ — user.py, submission.py, classroom.py, conversation.py
    schemas/ — user.py, submission.py, classroom.py, conversation.py
    api/ — router.py, auth.py, dashboard.py, classrooms.py, submissions.py
    services/ — gemini_service.py, image_processor.py, key_manager.py,
                analytics.py, notification.py, gamification.py
    bot/ — bot.py, messages.py, keyboards.py
      handlers/ — start.py, register.py, submit.py, explain.py,
                  chat.py, stats.py, parent.py
    utils/
  frontend/ (React + Vite)
  scripts/ — init_db.py, seed_data.py, test_pipeline.py
  tests/
  alembic/
  .env.example, .gitignore, docker-compose.yml, requirements.txt, README.md
```

### Qurish tartibi
1. Loyiha skeleti — papkalar, config fayllar
2. Database — modellar, migratsiya
3. AI servislar — Gemini, OpenCV, gamification
4. Telegram bot — handlerlar, AI suhbat
5. API endpoints — dashboard, leaderboard
6. Frontend — React dashboard
7. Test va polish
