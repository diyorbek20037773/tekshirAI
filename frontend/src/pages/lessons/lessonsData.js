// Static lessons catalog — used when backend lessons API is unavailable.
// Mirrors backend/services/lesson_seed.py shape.

const EYE_PARTS = [
  ["Kranium — O'ng tashqi", "Bosh suyagining o'ng tashqi qatlami. Frontal, parietal, temporal va sfenoid suyaklardan tashkil topgan. Ko'z orbita chetini hosil qiladi.", 0xa46842],
  ["Kranium — O'ng ichki", "O'ng kranium ichki yuzasi. Miya pardasi (dura mater) shu yerga yopishgan. Kraniyal nervlar o'tuvchi teshiklarni o'z ichiga oladi.", 0xa46842],
  ["Kranium — Chap tashqi", "Bosh suyagining chap tashqi qatlami. Ko'ruv kanalini (canalis opticus) va ustki orbital yoriqni o'z ichiga oladi.", 0xa46842],
  ["Kranium — Chap ichki", "Chap kranium ichki yuzasi. Suyak qovurg'alari (orbital ridges) ko'zni mexanik ta'sirdan himoya qiladi.", 0xa46842],
  ["Orbital Yog' To'qimasi", "Ko'z orbita kovagini to'ldirib turuvchi yog' to'qimasi. Ko'z olmasi va muskullarni orbital devordan ajratib, amortizator vazifasini bajaradi.", 0xc4b39a],
  ["Tayoqchalar Qatlami (Rod Layer)", "Retinaning tashqi yadroviy qatlami. ~120 million tayoqcha fotoreseptor mavjud. Kechasi va sust yorug'likda ko'rishni ta'minlaydi.", 0xf5f4f2],
  ["Konuscha Qatlami (Cone Layer)", "Markaziy retinaning konuscha fotoreseptorlari. ~7 million konuscha mavjud. Rang ajratish va aniq ko'rishni ta'minlaydi.", 0xf5f4f2],
  ["Retinal Pigment Epithelium (RPE)", "Fotoreseptorlarni qo'llab-quvvatlovchi pigmentli bir qatlam hujayralar. A vitamini metabolizmi va fotoreseptor tiklanishida ishtirok etadi.", 0xf5f4f2],
  ["Bruch Membranasi", "RPE va xoroid orasidagi 2–4 mkm qalinlikdagi membrana. Qon va to'r parda o'rtasida selektiv to'siq vazifasini bajaradi.", 0xf5f4f2],
  ["Fovea Sentralis", "Retinaning markaziy chuqurchasi (diametri 1.5 mm). Faqat konuscha fotoreseptorlar mavjud. Ko'rishning eng aniq nuqtasi — 20/20 ko'rish shu yerda.", 0x572c20],
  ["Optik Disk (Ko'ruv Nervi Boshi)", "Ko'ruv nervi tolalari retinadan chiqadigan nuqta. Fotoreseptorlar yo'q, shuning uchun 'ko'r dog'' deyiladi. Diametri ~1.7 mm.", 0x6e4a2d],
  ["Retinal Qon Tomiri Tarmog'i I", "Ko'z markaziy arteriyasining (arteria centralis retinae) birinchi darajali tarmoqlari. To'r pardaning ichki qatlamlarini oziqlantiradi.", 0xdf0912],
  ["Retinal Qon Tomiri Tarmog'i II", "Ikkinchi darajali retinal arteriya va venalar. Ustki va pastki temporal, burun tomirlari to'rini hosil qiladi.", 0xdf0912],
  ["Retinal Qon Tomiri Tarmog'i III", "Uchinchi darajali mayda kapillyar tarmoqlar. Retinaning tashqi yadroviy qatlamigacha yetib boradi.", 0xdf0912],
  ["Xoroidal Qon Tomiri Tarmog'i", "Xoroidni (ko'z tomirli pardasini) oziqlantiradigan qisqa posterior siliar arteriyalar. Retinal yog' asidlari sintezida muhim rol o'ynaydi.", 0xdf0912],
  ["Venoz Drenaj Tizimi", "Ko'z markaziy venasi (vena centralis retinae) tarmoqlari. Qonni ko'z to'r pardasidan ophthalmic venaga olib chiqadi.", 0xdf0912],
  ["Lateral Rektus Muskul", "Ko'zni tashqariga (abduktsiya) harakatlantiradi. VI (abducens) nervi tomonidan innervatsiya qilinadi. Uzunligi ~40 mm.", 0xe1e27d],
  ["Medial Rektus Muskul", "Ko'zni ichkariga (adduktsiya) harakatlantiradi. III (okulomotor) nervi tomonidan innervatsiya qilinadi. Eng kuchli ko'z muskuli.", 0xe1e27d],
  ["Ko'z Gavhari (Crystalline Lens)", "Elastik bikonveks shaffof linza. Diametri ~10 mm, qalinligi 3.6–5 mm. Siliar muskullar orqali yaqin/uzoqni ko'rish (akkommodatsiya) ta'minlaydi.", 0xd5bca8],
  ["Ko'z Olmasi (Bulbus Oculi)", "Ko'zning tashqi himoya qopqog'i (sclera). Diametri ~24 mm, og'irligi ~7 g. Uch qavat devordan iborat: sklera, xoroid, retina.", 0xd2bba6],
  ["Siliar Jasad (Corpus Ciliare)", "Iris bilan xoroid o'rtasidagi tuzilma. Suv humor (aqueous humor) ishlab chiqaradi va zonular tolalar orqali linzani ushlab turadi.", 0xc6b0a5],
  ["Shisha Tana (Corpus Vitreum)", "Ko'z bo'shlig'ining 80%ini to'ldiruvchi shaffof jele. Suv (99%), gialuron kislotasi va kollagen tolalardan iborat. Retinani joyida ushlab turadi.", 0xaf836e],
  ["Ko'ruv Nervi (Nervus Opticus)", "~1.2 million asab tolasidan iborat II kranial nerv. Ko'zdan chiqqach, xiyazma optika (chiasma opticum) orqali miyaga signal uzatadi.", 0xe2e27b],
  ["Sklera (Oq Parda)", "Ko'zning qattiq tashqi himoya qopqog'i (5/6 qismini egallaydi). Kollagen tolalari zichligidan oq rangda. Ko'z muskullarini biriktiradi.", 0xe1eef7],
]

const toParts = (arr) =>
  arr.map(([label, info, color], i) => ({
    mesh_index: i, label_uz: label, info_uz: info, color_hex: '0x' + color.toString(16).padStart(6, '0'),
  }))

export const SUBJECTS = [
  { slug: 'biologiya',   name_uz: 'Biologiya',   icon: '🌿', is_active: true, topic_count: 4 },
  { slug: 'kimyo',       name_uz: 'Kimyo',       icon: '🧪', is_active: true, topic_count: 1 },
  { slug: 'fizika',      name_uz: 'Fizika',      icon: '⚡', is_active: true, topic_count: 1 },
  { slug: 'astronomiya', name_uz: 'Astronomiya', icon: '🪐', is_active: true, topic_count: 3 },
]

export const TOPICS_BY_SUBJECT = {
  biologiya: [
    {
      id: 'bio-koz', slug: 'koz', title_uz: "Ko'z anatomiyasi", icon: '👁',
      description_uz: "Inson ko'zining 24 ta asosiy qismi: kranium, retinada fotoreseptorlar, qon tomirlari, muskullar va ko'ruv nervi.",
      model_file: '/lesson-models/eye.glb', initial_rotation: [0, 0, 0],
      parts: toParts(EYE_PARTS),
    },
    {
      id: 'bio-miya', slug: 'miya', title_uz: 'Miya 3D', icon: '🧠',
      description_uz: 'Markaziy asab tizimining asosiy organi. Frontal, parietal, temporal, oksipital loblar va miyacha.',
      model_file: '/lesson-models/brain.glb', initial_rotation: [0, Math.PI, 0],
      parts: toParts([["Miya (Encephalon)", "Markaziy asab tizimining asosiy organi. Og'irligi ~1400g, 86 milliard neyron. Fikrlash, xotira, harakat va barcha tana funksiyalarini boshqaradi.", 0xc4b39a]]),
    },
    {
      id: 'bio-yurak', slug: 'yurak', title_uz: 'Yurak', icon: '❤️',
      description_uz: 'Inson yuragining 4 kamerali realistik 3D modeli. Qo\'shaloq nasos vazifasi.',
      model_file: '/lesson-models/realistic_human_heart.glb', initial_rotation: [0, 0, 0],
      parts: toParts([["Yurak (Cor)", "Inson yuragining realistik 3D modeli. Qo'shaloq nasos — o'ng tomon o'pkaga, chap tomon butun tanaga qon yo'naltiradi. Og'irligi ~300g, minutiga 60-80 marta uradi.", 0xdf0912]]),
    },
    {
      id: 'bio-yuqori-tana', slug: 'yuqori-tana', title_uz: 'Yuqori tana', icon: '🫀',
      description_uz: 'Inson tanasining yuqori qismi: bosh suyagi, miya, ko\'krak qafasi, yurak, o\'pka va qon tomirlari.',
      model_file: '/lesson-models/upper_body.glb', initial_rotation: [0, 0, 0],
      parts: toParts([["Yuqori Tana Anatomiyasi", "Inson tanasining yuqori qismi: bosh suyagi, miya, bo'yin, ko'krak qafasi, muskullar, yurak, o'pka va qon tomirlari.", 0xd5bca8]]),
    },
  ],
  kimyo: [
    {
      id: 'kim-atom', slug: 'atom', title_uz: 'Atom tuzilishi', icon: '⚛️',
      description_uz: "Atomning yadro va elektron qobiqlardan iborat tuzilishi. Bohr modeli bo'yicha 3D vizualizatsiya.",
      model_file: '/lesson-models/atom.glb', initial_rotation: [0, 0, 0],
      parts: toParts([["Atom", "Atom — moddaning eng kichik kimyoviy bo'linmas zarrasi. Markazda musbat zaryadli yadro (proton va neytronlar), atrofida manfiy zaryadli elektronlar harakatlanadi. Yadroning o'lchami atomdan ~100000 marta kichik.", 0x4a90d9]]),
    },
  ],
  fizika: [
    {
      id: 'fiz-circuit', slug: 'elektr-zanjiri', title_uz: 'Elektr zanjiri', icon: '🔌',
      description_uz: "Elementar elektr zanjiri: kuchlanish (voltaj), tok kuchi va qarshilik o'rtasidagi bog'liqlik.",
      model_file: '/lesson-models/basics_of_an_electric_circuit_voltage_and_curre.glb', initial_rotation: [0, 0, 0],
      parts: toParts([["Elektr zanjiri", "Yopiq elektr zanjiri manba (batareya), o'tkazgich, iste'molchi (lampochka, qarshilik) va kalitdan iborat. Om qonuni: I = U/R — tok kuchi kuchlanishga to'g'ri, qarshilikka teskari proporsional.", 0xf0ad4e]]),
    },
  ],
  astronomiya: [
    {
      id: 'astr-solar', slug: 'quyosh-tizimi', title_uz: 'Quyosh tizimi', icon: '☀️',
      description_uz: "Quyosh va uning atrofida aylanuvchi 8 ta sayyora. Quyosh tizimining umumiy 3D modeli.",
      model_file: '/lesson-models/solar_system_custom.glb', initial_rotation: [0, 0, 0],
      parts: toParts([["Quyosh tizimi", "Quyosh tizimi Quyosh, 8 ta sayyora (Merkuriy, Venera, Yer, Mars, Yupiter, Saturn, Uran, Neptun), ularning yo'ldoshlari, asteroidlar, kometalar va boshqa kosmik jismlardan tashkil topgan. Yoshi ~4.6 mlrd yil.", 0xffd600]]),
    },
    {
      id: 'astr-earth', slug: 'yer', title_uz: 'Yer sayyorasi', icon: '🌍',
      description_uz: "Yerning 3D modeli — quruqlik, okeanlar, atmosfera qatlami.",
      model_file: '/lesson-models/simple_earth_planet.glb', initial_rotation: [0, 0, 0],
      parts: toParts([["Yer", "Quyosh tizimining 3-sayyorasi va Quyoshdan o'rtacha 149.6 mln km uzoqlikda. Yagona ma'lum yashash uchun yaroqli sayyora. Diametri 12 742 km, og'irligi 5.97×10²⁴ kg. Bir aylanish 24 soat, bir orbital aylanish 365.25 kun.", 0x2979ff]]),
    },
    {
      id: 'astr-blackhole', slug: 'qora-tuynuk', title_uz: 'Qora tuynuk', icon: '🕳️',
      description_uz: "Qora tuynuk — gravitatsiyasi shu darajada kuchli kosmik obyekt, hatto yorug'lik undan qocha olmaydi.",
      model_file: '/lesson-models/black_hole.glb', initial_rotation: [0, 0, 0],
      parts: toParts([["Qora tuynuk", "Qora tuynuk — fazo-vaqt egriligi cheksizlikka intiladigan obyekt. Markazda singularlik, atrofida hodisalar gorizonti (event horizon). Eng kichigi ~3 quyosh massasi, supermassiv qora tuynuklar millionlab quyosh massasi (galaktika markazlarida joylashgan).", 0x9b59b6]]),
    },
  ],
}

// Backend-compatible API surface (so pages can fall back transparently)
export async function fetchSubjects() {
  try {
    const r = await fetch('/api/lessons/subjects')
    if (r.ok) return await r.json()
  } catch {}
  return { subjects: SUBJECTS }
}

export async function fetchTopics(slug) {
  try {
    const r = await fetch(`/api/lessons/subjects/${slug}/topics`)
    if (r.ok) return await r.json()
  } catch {}
  const subj = SUBJECTS.find(s => s.slug === slug)
  const topics = (TOPICS_BY_SUBJECT[slug] || []).map(t => ({
    id: t.id, slug: t.slug, title_uz: t.title_uz, description_uz: t.description_uz,
    icon: t.icon, parts_count: t.parts.length,
  }))
  return { subject: subj ? { slug: subj.slug, name_uz: subj.name_uz, icon: subj.icon } : null, topics }
}

export async function fetchTopic(id) {
  try {
    const r = await fetch(`/api/lessons/topics/${id}`)
    if (r.ok) return await r.json()
  } catch {}
  for (const list of Object.values(TOPICS_BY_SUBJECT)) {
    const t = list.find(t => String(t.id) === String(id))
    if (t) return t
  }
  throw new Error('Topic not found')
}
