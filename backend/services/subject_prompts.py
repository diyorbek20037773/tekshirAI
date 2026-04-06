"""Fan bo'yicha maxsus promptlar — har bir fan uchun alohida tekshirish ko'rsatmalari."""


SUBJECT_PROMPTS = {
    "Matematika": """MATEMATIKA FANI BO'YICHA TEKSHIRISH:
- Har bir masalani QADAM-BAQADAM tekshir
- Arifmetik amallar: qo'shish, ayirish, ko'paytirish, bo'lish
- Masala yechish ketma-ketligiga e'tibor ber
- Jadval (ko'paytirish jadvali) bilishini tekshir
- Soddalashtirish, taqqoslash amallarini tekshir
- Xato bo'lsa hayotiy misol bilan tushuntir (bozorda pul hisoblash, mevalar sonini hisoblash)""",

    "Algebra": """ALGEBRA FANI BO'YICHA TEKSHIRISH:
- Algebraik ifodalar va tenglamalarni tekshir
- O'zgaruvchilar bilan ishlashni tekshir
- Tenglamani yechish bosqichlarini QADAM-BAQADAM tekshir
- Formulalar to'g'ri qo'llanganmi tekshir
- Funksiyalar, grafik chizish, tengsizliklar
- Ko'phadlar, kasrlar, ildizlar bilan ishlash
- Xato bo'lsa qaysi qadamda xato qilganini aniq ko'rsat""",

    "Geometriya": """GEOMETRIYA FANI BO'YICHA TEKSHIRISH:
- Geometrik shakllar: uchburchak, to'rtburchak, doira, ko'pburchak
- Yuzani va perimetrni hisoblash formulalarini tekshir
- Burchak o'lchamlari va xossalarini tekshir
- Teoremalar to'g'ri qo'llanganmi (Pifagor teoremasi, sinuslar, kosinuslar)
- Chizmalar va konstruksiyalarni tekshir
- Hajm va sirt yuzasini hisoblash (silindr, konus, shar)
- Xato bo'lsa to'g'ri formulani ko'rsat va qadam-baqadam yech""",

    "Ona tili": """ONA TILI (O'ZBEK TILI) FANI BO'YICHA TEKSHIRISH:
- IMLO XATOLARI: so'zlar to'g'ri yozilganmi tekshir
- TINISH BELGILARI: vergul, nuqta, so'roq, undov belgilari to'g'ri qo'yilganmi
- GAP TUZILISHI: gap bo'laklari to'g'ri joylashganmi (ega, kesim, to'ldiruvchi, aniqlovchi, hol)
- MORFOLOGIYA: so'z turkumlari, qo'shimchalar to'g'ri ishlatilganmi
- INSHO/BAYON: agar insho bo'lsa — mazmun, mantiq, uslub, imlo tekshir
- MASHQ JAVOBLARI: grammatik mashqlar to'g'ri bajarilganmi
- FE'L ZAMONLARI: hozirgi, o'tgan, kelasi zamon to'g'ri ishlatilganmi
- Xato bo'lsa qoidani eslatib, to'g'ri variantni ko'rsat""",

    "Ingliz tili": """INGLIZ TILI (ENGLISH) FANI BO'YICHA TEKSHIRISH:
- GRAMMAR: tenses (Present Simple, Past Simple, Future, Perfect, Continuous), articles, prepositions
- SPELLING: so'zlar to'g'ri yozilganmi
- VOCABULARY: so'z ma'nolari to'g'ri ishlatilganmi
- SENTENCE STRUCTURE: gap tuzilishi to'g'rimi (Subject-Verb-Object)
- TRANSLATION: tarjima to'g'rimi (o'zbek-ingliz yoki ingliz-o'zbek)
- ESSAY/COMPOSITION: agar insho bo'lsa — structure, grammar, vocabulary, coherence
- EXERCISES: gap to'ldirish, so'z tanlash, grammatik mashqlar
- Xatoni ingliz va o'zbek tilida tushuntir, to'g'ri variantni ko'rsat""",

    "Fizika": """FIZIKA FANI BO'YICHA TEKSHIRISH:
- FORMULALAR: to'g'ri formula ishlatilganmi tekshir
- BIRLIKLAR: SI birliklari to'g'ri ishlatilganmi (metr, kilogramm, sekund, Nyuton, Joul)
- BIRLIK ALMASHTIRISH: km→m, g→kg kabi o'zgartirishlar to'g'rimi
- HISOB-KITOB: raqamli hisoblash to'g'rimi
- FIZIK QONUNLAR: Nyuton qonunlari, Arximed, Kulon, Om qonuni to'g'ri qo'llanganmi
- MASALA YECHISH: berilgan, topish kerak, yechim ketma-ketligi
- GRAFIK VA JADVALLAR: agar bo'lsa tekshir
- Xato bo'lsa fizik ma'nosini tushuntir, to'g'ri formulani ko'rsat""",

    "Kimyo": """KIMYO FANI BO'YICHA TEKSHIRISH:
- KIMYOVIY FORMULALAR: moddalar formulasi to'g'ri yozilganmi (H2O, NaCl, H2SO4)
- REAKSIYA TENGLAMALARI: tenglanganmi, koeffitsientlar to'g'rimi
- VALENTLIK: elementlar valentligi to'g'ri aniqlganmi
- MOLYAR HISOB: mol, massa, hajm hisoblari
- DAVRIY JADVAL: element xossalari to'g'ri ishlatilganmi
- OKSIDLANISH-QAYTARILISH: elektron almashinuvi to'g'rimi
- ERITMALAR: konsentratsiya, eritma massasi hisoblari
- Xato bo'lsa kimyoviy qoidani eslatib, to'g'ri javobni ko'rsat""",

    "Biologiya": """BIOLOGIYA FANI BO'YICHA TEKSHIRISH:
- TERMINOLOGIYA: biologik atamalar to'g'ri ishlatilganmi
- TASNIF: tirik organizmlar tasnifi to'g'rimi (turkum, oila, tur)
- JARAYONLAR: fotosintez, nafas olish, ovqat hazm qilish to'g'ri tasvirlanganmi
- ANATOMIYA: organ va tizimlar to'g'ri aniqlganmi
- EKOLOGIYA: ekotizim, oziq zanjiri to'g'rimi
- GENETIKA: gen, xromosoma, irsiyat qonunlari
- HUJAYRA: tuzilishi, funksiyalari to'g'ri tasvirlanganmi
- Xato bo'lsa to'g'ri biologik tushunchani tushuntir""",

    "Informatika": """INFORMATIKA FANI BO'YICHA TEKSHIRISH:
- ALGORITMLAR: algoritm to'g'ri tuzilganmi, ketma-ketlik mantiqiymi
- DASTURLASH: kod to'g'ri yozilganmi (Python, Pascal, C++ kabi)
- MANTIQIY AMALLAR: AND, OR, NOT to'g'ri ishlatilganmi
- SONLAR SISTEMASI: ikkilik, sakkizlik, o'n oltilik o'girishlar
- JADVALLAR: Excel formulalari, jadval bilan ishlash
- MA'LUMOTLAR BAZASI: SQL so'rovlar, jadval tuzilishi
- KOMPYUTER TUZILISHI: qurilmalar, dasturiy ta'minot bilimi
- Xato bo'lsa mantiqiy xatoni tushuntir va to'g'ri javobni ko'rsat""",

    "Tabiatshunoslik": """TABIATSHUNOSLIK FANI BO'YICHA TEKSHIRISH:
- TABIAT HODISALARI: ob-havo, iqlim, suv aylanishi to'g'ri tasvirlanganmi
- EKOLOGIYA: atrof-muhit muhofazasi, ifloslanish, qayta ishlash
- GEOGRAFIYA ELEMENTLARI: materiklar, okeanlar, relef
- HAYOT VA TABIAT: o'simliklar, hayvonlar, ularning muhiti
- FIZIKA ASOSLARI: oddiy fizik hodisalar (issiqlik, yorug'lik, tovush)
- KIMYO ASOSLARI: oddiy moddalar va ularning xossalari
- TAJRIBALAR: tajriba natijalari to'g'ri yozilganmi
- Xato bo'lsa tabiat hodisasi bilan hayotiy misol keltir""",
}


def get_subject_prompt(subject: str) -> str:
    """Fan nomiga mos promptni qaytaradi. Topilmasa umumiy prompt."""
    # Aniq moslik
    if subject in SUBJECT_PROMPTS:
        return SUBJECT_PROMPTS[subject]

    # Kichik harf bilan qidirish
    subject_lower = subject.lower()
    for key, prompt in SUBJECT_PROMPTS.items():
        if key.lower() == subject_lower:
            return prompt

    # Qisman moslik
    for key, prompt in SUBJECT_PROMPTS.items():
        if key.lower() in subject_lower or subject_lower in key.lower():
            return prompt

    # Default — umumiy
    return f"""{subject.upper()} FANI BO'YICHA TEKSHIRISH:
- O'quvchining javoblarini diqqat bilan tekshir
- Har bir savolga to'g'ri javob berganmi aniqla
- Xato bo'lsa sababini tushuntir va to'g'ri javobni ko'rsat
- Fan terminologiyasi to'g'ri ishlatilganmi tekshir"""
