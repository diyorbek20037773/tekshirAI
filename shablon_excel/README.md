# 📚 Excel Shablonlari — Admin Panel uchun

Bu papkada admin panelda ishlatiladigan **4 ta Excel shablon** mavjud. Adminlar shu shablonlarni yuklab olib, o'z maktabi ma'lumotlarini kiritadi va keyin admin panelga yuklaydi.

## Yuklash tartibi (MUHIM!)

Shablonlar **shu tartibda** yuklanishi kerak (har biri oldingisiga bog'liq):

1. **`1_maktablar.xlsx`** — Avval maktablar yuklanadi
2. **`2_sinflar.xlsx`** — Maktablar bor bo'lgach, sinflar yuklanadi
3. **`3_oqituvchilar.xlsx`** — Maktab + sinf bor bo'lgach, o'qituvchilar
4. **`4_oquvchilar.xlsx`** — Hammasi bor bo'lgach, o'quvchilar

---

## 1️⃣ `1_maktablar.xlsx` — Maktablar ro'yxati

| Ustun | Majburiy | Tavsif |
|-------|----------|--------|
| Viloyat | ✅ Ha | Masalan: "Surxondaryo viloyati" |
| Tuman | ✅ Ha | Masalan: "Termiz tumani" |
| Maktab nomi | ✅ Ha | Masalan: "1-sonli IDUM" — UNIQUE bo'lishi kerak |
| Manzil | ❌ Yo'q | Masalan: "Bunyodkor 5" |

---

## 2️⃣ `2_sinflar.xlsx` — Sinflar va fanlar

| Ustun | Majburiy | Tavsif |
|-------|----------|--------|
| Maktab nomi | ✅ Ha | Maktablar.xlsx dagi nom bilan **bir xil** bo'lishi kerak |
| Sinf nomi | ✅ Ha | Masalan: "7-A", "9-B", "11-V" |
| Sinf raqami | ✅ Ha | 1 dan 11 gacha raqam |
| Fan | ✅ Ha | Masalan: "Matematika", "Ona tili" — fan bo'yicha alohida qator |

**Eslatma:** Bir sinfning bir nechta fani bor — har bir fan uchun **alohida qator** kiriting (masalan, 7-A sinfi uchun "Matematika" va "Ona tili" — 2 ta qator).

---

## 3️⃣ `3_oqituvchilar.xlsx` — O'qituvchilar

| Ustun | Majburiy | Tavsif |
|-------|----------|--------|
| Maktab nomi | ✅ Ha | Maktablar.xlsx dagi nom |
| Familiya | ✅ Ha | Masalan: "Karimov" |
| Ism | ✅ Ha | Masalan: "Aziz" |
| Otasining ismi | ❌ Yo'q | Masalan: "Sodiqovich" |
| Fan | ✅ Ha | Sinflar.xlsx da bo'lgan fan nomi |
| Telefon | ❌ Yo'q | Format: +998XXXXXXXXX |
| Sinf rahbari (ixtiyoriy) | ❌ Yo'q | Masalan: "7-A" — agar shu sinfning rahbari bo'lsa |

---

## 4️⃣ `4_oquvchilar.xlsx` — O'quvchilar

| Ustun | Majburiy | Tavsif |
|-------|----------|--------|
| Maktab nomi | ✅ Ha | Maktablar.xlsx dagi nom |
| Sinf | ✅ Ha | Sinflar.xlsx dagi sinf nomi (masalan: "7-A") |
| Familiya | ✅ Ha | "Ibragimov" |
| Ism | ✅ Ha | "Diyorbek" |
| Otasining ismi | ❌ Yo'q | "Akmalovich" |
| Tug'ilgan yili (ixtiyoriy) | ❌ Yo'q | Raqam: 2012 |
| Jinsi (M/F) | ❌ Yo'q | "M" — o'g'il, "F" — qiz |

---

## ⚠️ Umumiy qoidalar

1. **Birinchi qator (sarlavha) o'zgartirilmasin** — sariq misol qatorlarni o'chiring va o'zingizniki bilan to'ldiring
2. **Maktab nomi har joyda BIR XIL** yozilishi kerak — masalan, 1-fayl da "1-sonli IDUM" yozsangiz, qolgan fayllarda ham aynan shunday yozing (kichik harf, probel farqi muhim)
3. **Bo'sh qator qoldirmang** — boshqa qatorlardan keyin bo'sh qator bo'lsa, parsing to'xtaydi
4. **Excel formati .xlsx** bo'lishi kerak (.xls eski format ishlamaydi)
5. **Telefon format:** +998XXXXXXXXX (12 raqam)

---

## 📥 Admin panelda ishlatish

1. Admin panelga kiring (parol + maxfiy so'z)
2. "Maktab ma'lumotlari" bo'limiga o'ting
3. Tegishli tab tanlang (Maktablar / Sinflar / O'qituvchilar / O'quvchilar)
4. "Shablon yuklab olish" — bo'sh shablon yuklab olinadi
5. Excelni to'ldiring
6. "Yuklash" — faylni tanlang, "Tasdiqlash" bosing
7. Validatsiya natijasini ko'ring (xatolar, ogohlantirishlar)
8. "DB ga saqlash" — yakuniy yozish

---

**Ishlab chiquvchi:** Do'ppi X jamoasi  
**Loyiha:** TekshirAI 2026
