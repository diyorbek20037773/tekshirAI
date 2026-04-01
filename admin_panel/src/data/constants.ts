/* ── 14 viloyat populyatsiya proportsiyalari ── */
export const VILOYAT_DATA: Record<string, {
  maktablar: number;
  oquvchilar: number;
  oqituvchilar: number;
}> = {
  toshkent_sh:    { maktablar: 620,  oquvchilar: 580000, oqituvchilar: 38000 },
  toshkent_v:     { maktablar: 980,  oquvchilar: 620000, oqituvchilar: 42000 },
  samarqand:      { maktablar: 1050, oquvchilar: 720000, oqituvchilar: 48000 },
  fargona:        { maktablar: 1020, oquvchilar: 700000, oqituvchilar: 46000 },
  andijon:        { maktablar: 850,  oquvchilar: 580000, oqituvchilar: 38000 },
  namangan:       { maktablar: 780,  oquvchilar: 530000, oqituvchilar: 35000 },
  buxoro:         { maktablar: 720,  oquvchilar: 420000, oqituvchilar: 28000 },
  xorazm:         { maktablar: 680,  oquvchilar: 390000, oqituvchilar: 26000 },
  qashqadaryo:    { maktablar: 1100, oquvchilar: 680000, oqituvchilar: 42000 },
  surxondaryo:    { maktablar: 850,  oquvchilar: 520000, oqituvchilar: 32000 },
  jizzax:         { maktablar: 560,  oquvchilar: 300000, oqituvchilar: 20000 },
  sirdaryo:       { maktablar: 420,  oquvchilar: 210000, oqituvchilar: 14000 },
  navoiy:         { maktablar: 450,  oquvchilar: 230000, oqituvchilar: 16000 },
  qoraqalpogiston:{ maktablar: 1059, oquvchilar: 420000, oqituvchilar: 25000 },
};
// Jami: ~11,139 maktab, ~6.9M o'quvchi, ~450K o'qituvchi

/* ── 8 ta fan ── */
export const FANLAR = [
  'Matematika',
  'Fizika',
  'Kimyo',
  'Biologiya',
  'Ona tili',
  'Ingliz tili',
  'Tarix',
  'Informatika',
] as const;

/* ── Har bir fan uchun mavzular ── */
export const FAN_MAVZULARI: Record<string, string[]> = {
  Matematika: [
    'Kasrlar ustida amallar',
    'Kvadrat tenglamalar',
    'Foizlar',
    'Geometrik shakllar yuzi',
    'Tengsizliklar',
    'Funksiyalar grafigi',
    'Trigonometriya asoslari',
    'Statistika elementlari',
  ],
  Fizika: [
    'Nyuton qonunlari',
    'Elektr zanjirlar',
    'Optika va linzalar',
    'Termodinamika',
    'Mexanik tebranishlar',
    'Atom tuzilishi',
    'Magnit maydon',
    'Energiya saqlanish qonuni',
  ],
  Kimyo: [
    'Kimyoviy tenglamalarni tenglashtirish',
    'Oksidlanish-qaytarilish',
    'Kislota va asoslar',
    'Organik birikmalar',
    'Atom tuzilishi',
    'Eritmalar konsentratsiyasi',
    'Elektrolitik dissotsiatsiya',
    'Metallar kimyosi',
  ],
  Biologiya: [
    'Hujayra tuzilishi',
    'Fotosintez jarayoni',
    'Genetika asoslari',
    'Qon aylanish tizimi',
    'Ekosistema va biomlar',
    'Evolyutsiya nazariyasi',
    'Nerv tizimi',
    'Ovqat hazm qilish',
  ],
  'Ona tili': [
    "So'z turkumlari",
    'Gap bo\'laklari',
    'Imlo qoidalari',
    'Tinish belgilari',
    'Matn tahlili',
    'Sinonimlar va antonimlar',
    'Fe\'l zamonlari',
    'Bog\'langan nutq',
  ],
  'Ingliz tili': [
    'Present Perfect tense',
    'Passive Voice',
    'Conditional sentences',
    'Reported Speech',
    'Articles (a/an/the)',
    'Prepositions of time/place',
    'Modal verbs',
    'Reading comprehension',
  ],
  Tarix: [
    'Amir Temur davlati',
    'Mustaqillik tarixi',
    'Ikkinchi jahon urushi',
    'Buyuk Ipak yo\'li',
    'Sovet davri',
    'Qadimgi tsivilizatsiyalar',
    'O\'rta Osiyo xonliklari',
    'Zamonaviy O\'zbekiston',
  ],
  Informatika: [
    'Algoritmlar va blok-sxema',
    'Python dasturlash',
    'Ma\'lumotlar bazasi',
    'Tarmoq asoslari',
    'HTML va CSS',
    'Sanoq sistemalari',
    'Mantiqiy amallar',
    'Axborot xavfsizligi',
  ],
};

/* ── O'zbek ismlari ── */
export const ERKAK_ISMLAR = [
  'Jasur', 'Sardor', 'Bobur', 'Sherzod', 'Asilbek', 'Dilshod', 'Bekzod',
  'Ulugbek', 'Otabek', 'Nodir', 'Abdulloh', 'Sanjar', 'Islom', 'Firdavs',
  'Javohir', 'Behruz', 'Kamol', 'Shamsiddin', 'Doniyor', 'Eldor',
  'Husan', 'Ibrohim', 'Mirzo', 'Ravshan', 'Temur', 'Umid', 'Valijon',
  'Xurshid', 'Yoqub', 'Zafar', 'Akbar', 'Bahrom', 'Davron', 'Erkin',
];

export const AYOL_ISMLAR = [
  'Madina', 'Gulnora', 'Nilufar', 'Shahlo', 'Zulfiya', 'Mohira', 'Dilnoza',
  'Kamola', 'Sevinch', 'Barno', 'Aziza', 'Dilorom', 'Feruza', 'Gavhar',
  'Hulkar', 'Iroda', 'Jamila', 'Komila', 'Lobar', 'Munira', 'Nafisa',
  'Ozoda', 'Parvin', 'Robiya', 'Sarvinoz', 'Tamara', 'Umida', 'Vasila',
];

export const FAMILIYALAR = [
  'Karimov', 'Rahimov', 'Aliyev', 'Toshmatov', 'Ergashev', 'Mirzayev',
  'Xolmatov', 'Nurmatov', 'Sobirov', 'Qodirov', 'Umarov', 'Abdullayev',
  'Botirov', 'Djurayev', 'Eshmatov', 'Fayzullayev', 'Ganiyev', 'Hamidov',
  'Ismoilov', 'Jurayev', 'Komilov', 'Latipov', 'Mahmudov', 'Nazarov',
  'Olimov', 'Pulatov', 'Rustamov', 'Salimov', 'Tursunov', 'Yuldashev',
];

export const SINF_HARFLAR = ['A', 'B', 'C', 'D'] as const;

/* ── Viloyat muammolari shablonlari ── */
export const MUAMMO_SHABLONLARI = [
  {
    turi: 'Past sifatli maktablar',
    tafsilot_shablon: '{miqdor} ta maktabda o\'rtacha ball 50% dan past',
    tavsiya: "O'qituvchilar malakasini oshirish kurslari va qo'shimcha dars soatlari ajratish",
  },
  {
    turi: 'Past davomat',
    tafsilot_shablon: 'Davomat ko\'rsatkichi {miqdor}% — respublika o\'rtachasidan past',
    tavsiya: "Transport va ovqatlanish sharoitlarini yaxshilash, ota-onalar bilan ishlash",
  },
  {
    turi: "O'qituvchi yetishmovchiligi",
    tafsilot_shablon: '{miqdor} ta maktabda fan o\'qituvchilari yetishmaydi',
    tavsiya: "Pedagogika universitetlari bilan hamkorlik, qishloq uchun imtiyozli shart-sharoitlar",
  },
  {
    turi: 'Moddiy-texnik baza muammosi',
    tafsilot_shablon: '{miqdor} ta maktabda zamonaviy laboratoriya va kompyuter sinflari yo\'q',
    tavsiya: "Davlat byudjeti va xalqaro grantlar hisobidan jihozlash dasturi",
  },
  {
    turi: 'AI platformadan foydalanish past',
    tafsilot_shablon: 'Faqat {miqdor}% o\'quvchilar TekshirAI dan muntazam foydalanmoqda',
    tavsiya: "O'qituvchilar va ota-onalar o'rtasida targ'ibot kampaniyasi o'tkazish",
  },
] as const;
