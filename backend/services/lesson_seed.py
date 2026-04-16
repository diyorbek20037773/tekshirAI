"""Interaktiv darslar uchun boshlang'ich ma'lumotlar (Biology only)."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.lesson import LessonSubject, LessonTopic, LessonPart


SUBJECTS = [
    {"slug": "biologiya",   "name_uz": "Biologiya",   "icon": "🌿", "is_active": True},
    {"slug": "kimyo",       "name_uz": "Kimyo",       "icon": "🧪", "is_active": True},
    {"slug": "fizika",      "name_uz": "Fizika",      "icon": "⚡", "is_active": True},
    {"slug": "astronomiya", "name_uz": "Astronomiya", "icon": "🪐", "is_active": True},
]

EYE_PARTS = [
    ("Kranium — O'ng tashqi", "Bosh suyagining o'ng tashqi qatlami. Frontal, parietal, temporal va sfenoid suyaklardan tashkil topgan. Ko'z orbita chetini hosil qiladi.", "0xa46842"),
    ("Kranium — O'ng ichki", "O'ng kranium ichki yuzasi. Miya pardasi (dura mater) shu yerga yopishgan. Kraniyal nervlar o'tuvchi teshiklarni o'z ichiga oladi.", "0xa46842"),
    ("Kranium — Chap tashqi", "Bosh suyagining chap tashqi qatlami. Ko'ruv kanalini (canalis opticus) va ustki orbital yoriqni o'z ichiga oladi.", "0xa46842"),
    ("Kranium — Chap ichki", "Chap kranium ichki yuzasi. Suyak qovurg'alari (orbital ridges) ko'zni mexanik ta'sirdan himoya qiladi.", "0xa46842"),
    ("Orbital Yog' To'qimasi", "Ko'z orbita kovagini to'ldirib turuvchi yog' to'qimasi. Ko'z olmasi va muskullarni orbital devordan ajratib, amortizator vazifasini bajaradi.", "0xc4b39a"),
    ("Tayoqchalar Qatlami (Rod Layer)", "Retinaning tashqi yadroviy qatlami. ~120 million tayoqcha fotoreseptor mavjud. Kechasi va sust yorug'likda ko'rishni ta'minlaydi.", "0xf5f4f2"),
    ("Konuscha Qatlami (Cone Layer)", "Markaziy retinaning konuscha fotoreseptorlari. ~7 million konuscha mavjud. Rang ajratish va aniq ko'rishni ta'minlaydi.", "0xf5f4f2"),
    ("Retinal Pigment Epithelium (RPE)", "Fotoreseptorlarni qo'llab-quvvatlovchi pigmentli bir qatlam hujayralar. A vitamini metabolizmi va fotoreseptor tiklanishida ishtirok etadi.", "0xf5f4f2"),
    ("Bruch Membranasi", "RPE va xoroid orasidagi 2–4 mkm qalinlikdagi membrana. Qon va to'r parda o'rtasida selektiv to'siq vazifasini bajaradi.", "0xf5f4f2"),
    ("Fovea Sentralis", "Retinaning markaziy chuqurchasi (diametri 1.5 mm). Faqat konuscha fotoreseptorlar mavjud. Ko'rishning eng aniq nuqtasi — 20/20 ko'rish shu yerda.", "0x572c20"),
    ("Optik Disk (Ko'ruv Nervi Boshi)", "Ko'ruv nervi tolalari retinadan chiqadigan nuqta. Fotoreseptorlar yo'q, shuning uchun 'ko'r dog'' deyiladi. Diametri ~1.7 mm.", "0x6e4a2d"),
    ("Retinal Qon Tomiri Tarmog'i I", "Ko'z markaziy arteriyasining (arteria centralis retinae) birinchi darajali tarmoqlari. To'r pardaning ichki qatlamlarini oziqlantiradi.", "0xdf0912"),
    ("Retinal Qon Tomiri Tarmog'i II", "Ikkinchi darajali retinal arteriya va venalar. Ustki va pastki temporal, burun tomirlari to'rini hosil qiladi.", "0xdf0912"),
    ("Retinal Qon Tomiri Tarmog'i III", "Uchinchi darajali mayda kapillyar tarmoqlar. Retinaning tashqi yadroviy qatlamigacha yetib boradi.", "0xdf0912"),
    ("Xoroidal Qon Tomiri Tarmog'i", "Xoroidni (ko'z tomirli pardasini) oziqlantiradigan qisqa posterior siliar arteriyalar. Retinal yog' asidlari sintezida muhim rol o'ynaydi.", "0xdf0912"),
    ("Venoz Drenaj Tizimi", "Ko'z markaziy venasi (vena centralis retinae) tarmoqlari. Qonni ko'z to'r pardasidan ophthalmic venaga olib chiqadi.", "0xdf0912"),
    ("Lateral Rektus Muskul", "Ko'zni tashqariga (abduktsiya) harakatlantiradi. VI (abducens) nervi tomonidan innervatsiya qilinadi. Uzunligi ~40 mm.", "0xe1e27d"),
    ("Medial Rektus Muskul", "Ko'zni ichkariga (adduktsiya) harakatlantiradi. III (okulomotor) nervi tomonidan innervatsiya qilinadi. Eng kuchli ko'z muskuli.", "0xe1e27d"),
    ("Ko'z Gavhari (Crystalline Lens)", "Elastik bikonveks shaffof linza. Diametri ~10 mm, qalinligi 3.6–5 mm. Siliar muskullar orqali yaqin/uzoqni ko'rish (akkommodatsiya) ta'minlaydi.", "0xd5bca8"),
    ("Ko'z Olmasi (Bulbus Oculi)", "Ko'zning tashqi himoya qopqog'i (sclera). Diametri ~24 mm, og'irligi ~7 g. Uch qavat devordan iborat: sklera, xoroid, retina.", "0xd2bba6"),
    ("Siliar Jasad (Corpus Ciliare)", "Iris bilan xoroid o'rtasidagi tuzilma. Suv humor (aqueous humor) ishlab chiqaradi va zonular tolalar orqali linzani ushlab turadi.", "0xc6b0a5"),
    ("Shisha Tana (Corpus Vitreum)", "Ko'z bo'shlig'ining 80%ini to'ldiruvchi shaffof jele. Suv (99%), gialuron kislotasi va kollagen tolalardan iborat. Retinani joyida ushlab turadi.", "0xaf836e"),
    ("Ko'ruv Nervi (Nervus Opticus)", "~1.2 million asab tolasidan iborat II kranial nerv. Ko'zdan chiqqach, xiyazma optika (chiasma opticum) orqali miyaga signal uzatadi.", "0xe2e27b"),
    ("Sklera (Oq Parda)", "Ko'zning qattiq tashqi himoya qopqog'i (5/6 qismini egallaydi). Kollagen tolalari zichligidan oq rangda. Ko'z muskullarini biriktiradi.", "0xe1eef7"),
]

BIO_TOPICS = [
    {
        "slug": "koz", "title_uz": "Ko'z anatomiyasi", "icon": "👁",
        "description_uz": "Inson ko'zining 24 ta asosiy qismi: kranium, retinada fotoreseptorlar, qon tomirlari, muskullar va ko'ruv nervi.",
        "model_file": "/lesson-models/eye.glb",
        "initial_rotation": "0,0,0", "sort_order": 1,
        "parts": EYE_PARTS,
    },
    {
        "slug": "miya", "title_uz": "Miya 3D", "icon": "🧠",
        "description_uz": "Markaziy asab tizimining asosiy organi. Frontal, parietal, temporal, oksipital loblar va miyacha.",
        "model_file": "/lesson-models/brain.glb",
        "initial_rotation": "0,3.14159,0", "sort_order": 2,
        "parts": [("Miya (Encephalon)", "Markaziy asab tizimining asosiy organi. Og'irligi ~1400g, 86 milliard neyron. Fikrlash, xotira, harakat va barcha tana funksiyalarini boshqaradi.", "0xc4b39a")],
    },
    {
        "slug": "yurak", "title_uz": "Yurak", "icon": "❤️",
        "description_uz": "Inson yuragining 4 kamerali realistik 3D modeli. Qo'shaloq nasos vazifasi.",
        "model_file": "/lesson-models/realistic_human_heart.glb",
        "initial_rotation": "0,0,0", "sort_order": 3,
        "parts": [("Yurak (Cor)", "Inson yuragining realistik 3D modeli. Qo'shaloq nasos — o'ng tomon o'pkaga, chap tomon butun tanaga qon yo'naltiradi. Og'irligi ~300g, minutiga 60-80 marta uradi.", "0xdf0912")],
    },
    {
        "slug": "yuqori-tana", "title_uz": "Yuqori tana", "icon": "🫀",
        "description_uz": "Inson tanasining yuqori qismi: bosh suyagi, miya, ko'krak qafasi, yurak, o'pka va qon tomirlari.",
        "model_file": "/lesson-models/upper_body.glb",
        "initial_rotation": "0,0,0", "sort_order": 4,
        "parts": [("Yuqori Tana Anatomiyasi", "Inson tanasining yuqori qismi: bosh suyagi, miya, bo'yin, ko'krak qafasi, muskullar, yurak, o'pka va qon tomirlari.", "0xd5bca8")],
    },
]

KIM_TOPICS = [
    {
        "slug": "atom", "title_uz": "Atom tuzilishi", "icon": "⚛️",
        "description_uz": "Atomning yadro va elektron qobiqlardan iborat tuzilishi. Bohr modeli bo'yicha 3D vizualizatsiya.",
        "model_file": "/lesson-models/atom.glb",
        "initial_rotation": "0,0,0", "sort_order": 1,
        "parts": [("Atom", "Atom — moddaning eng kichik kimyoviy bo'linmas zarrasi. Markazda musbat zaryadli yadro (proton va neytronlar), atrofida manfiy zaryadli elektronlar harakatlanadi. Yadroning o'lchami atomdan ~100000 marta kichik.", "0x4a90d9")],
    },
]

FIZ_TOPICS = [
    {
        "slug": "elektr-zanjiri", "title_uz": "Elektr zanjiri", "icon": "🔌",
        "description_uz": "Elementar elektr zanjiri: kuchlanish (voltaj), tok kuchi va qarshilik o'rtasidagi bog'liqlik.",
        "model_file": "/lesson-models/basics_of_an_electric_circuit_voltage_and_curre.glb",
        "initial_rotation": "0,0,0", "sort_order": 1,
        "parts": [("Elektr zanjiri", "Yopiq elektr zanjiri manba (batareya), o'tkazgich, iste'molchi (lampochka, qarshilik) va kalitdan iborat. Om qonuni: I = U/R — tok kuchi kuchlanishga to'g'ri, qarshilikka teskari proporsional.", "0xf0ad4e")],
    },
]

ASTR_TOPICS = [
    {
        "slug": "quyosh-tizimi", "title_uz": "Quyosh tizimi", "icon": "☀️",
        "description_uz": "Quyosh va uning atrofida aylanuvchi 8 ta sayyora. Quyosh tizimining umumiy 3D modeli.",
        "model_file": "/lesson-models/solar_system_custom.glb",
        "initial_rotation": "0,0,0", "sort_order": 1,
        "parts": [("Quyosh tizimi", "Quyosh tizimi Quyosh, 8 ta sayyora (Merkuriy, Venera, Yer, Mars, Yupiter, Saturn, Uran, Neptun), ularning yo'ldoshlari, asteroidlar, kometalar va boshqa kosmik jismlardan tashkil topgan. Yoshi ~4.6 mlrd yil.", "0xffd600")],
    },
    {
        "slug": "yer", "title_uz": "Yer sayyorasi", "icon": "🌍",
        "description_uz": "Yerning 3D modeli — quruqlik, okeanlar, atmosfera qatlami.",
        "model_file": "/lesson-models/simple_earth_planet.glb",
        "initial_rotation": "0,0,0", "sort_order": 2,
        "parts": [("Yer", "Quyosh tizimining 3-sayyorasi va Quyoshdan o'rtacha 149.6 mln km uzoqlikda. Yagona ma'lum yashash uchun yaroqli sayyora. Diametri 12 742 km, og'irligi 5.97×10²⁴ kg. Bir aylanish 24 soat, bir orbital aylanish 365.25 kun.", "0x2979ff")],
    },
    {
        "slug": "qora-tuynuk", "title_uz": "Qora tuynuk", "icon": "🕳️",
        "description_uz": "Qora tuynuk — gravitatsiyasi shu darajada kuchli kosmik obyekt, hatto yorug'lik undan qocha olmaydi.",
        "model_file": "/lesson-models/black_hole.glb",
        "initial_rotation": "0,0,0", "sort_order": 3,
        "parts": [("Qora tuynuk", "Qora tuynuk — fazo-vaqt egriligi cheksizlikka intiladigan obyekt. Markazda singularlik, atrofida hodisalar gorizonti (event horizon). Eng kichigi ~3 quyosh massasi, supermassiv qora tuynuklar millionlab quyosh massasi (galaktika markazlarida joylashgan).", "0x9b59b6")],
    },
]


async def _seed_topics(db, subject, topics):
    for t in topics:
        res = await db.execute(
            select(LessonTopic).where(LessonTopic.subject_id == subject.id, LessonTopic.slug == t["slug"])
        )
        if res.scalar_one_or_none():
            continue
        topic = LessonTopic(
            subject_id=subject.id,
            slug=t["slug"], title_uz=t["title_uz"], icon=t["icon"],
            description_uz=t["description_uz"], model_file=t["model_file"],
            initial_rotation=t["initial_rotation"], sort_order=t["sort_order"],
        )
        db.add(topic)
        await db.flush()
        for i, (label, info, color) in enumerate(t["parts"]):
            db.add(LessonPart(topic_id=topic.id, mesh_index=i, label_uz=label, info_uz=info, color_hex=color))


async def seed_lessons(db: AsyncSession):
    """Idempotent seed: fan/mavzu yo'q bo'lsa qo'shadi, mavjud fan is_active/icon/nomini yangilaydi."""
    subj_map = {}
    for s in SUBJECTS:
        res = await db.execute(select(LessonSubject).where(LessonSubject.slug == s["slug"]))
        existing = res.scalar_one_or_none()
        if existing:
            # Mavjud yozuvni yangilaymiz — is_active eski False qolib ketmasin
            existing.name_uz = s["name_uz"]
            existing.icon = s["icon"]
            existing.is_active = s["is_active"]
            subj_map[s["slug"]] = existing
            continue
        obj = LessonSubject(**s)
        db.add(obj)
        await db.flush()
        subj_map[s["slug"]] = obj

    await _seed_topics(db, subj_map["biologiya"],   BIO_TOPICS)
    await _seed_topics(db, subj_map["kimyo"],       KIM_TOPICS)
    await _seed_topics(db, subj_map["fizika"],      FIZ_TOPICS)
    await _seed_topics(db, subj_map["astronomiya"], ASTR_TOPICS)

    await db.commit()
