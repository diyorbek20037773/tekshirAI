// ============================================================
// TekshirAI — Gamifikatsiya uchun hikmatli so'zlar
// O'quvchi, O'qituvchi va Ota-ona uchun motivatsion xabarlar
// ============================================================

// === O'QUVCHI — Ball bo'yicha ===

export const STUDENT_SCORE_QUOTES = {
  // 100% to'g'ri
  perfect: [
    { text: "Ilmli ming yashar, ilmsiz bir yashar.", author: "O'zbek xalq maqoli" },
    { text: "Oz-oz o'rganib dono bo'lur, qatra-qatra yig'ilib daryo bo'lur.", author: "Alisher Navoiy" },
    { text: "Men aqlli emasman, shunchaki muammolar bilan uzoqroq shug'ullanaman.", author: "Albert Eynshteyn" },
    { text: "Ilm baxt keltirar, bilim taxt keltirar.", author: "O'zbek xalq maqoli" },
    { text: "Bilim — aql chirog'i.", author: "O'zbek xalq maqoli" },
    { text: "Ajoyib! Sen bugun o'zingdan o'tding!", author: null },
  ],
  // 80-99%
  good: [
    { text: "Ilmning avvali achchiq, so'ngi — totli.", author: "O'zbek xalq maqoli" },
    { text: "Tasavvur bilimdan muhimroqdir.", author: "Albert Eynshteyn" },
    { text: "Ilm izlagan yetar, izlamagan — yitar.", author: "O'zbek xalq maqoli" },
    { text: "Emdikim ilm o'ldi, amal aylagil.", author: "Alisher Navoiy" },
    { text: "Zo'rsan! Shu yo'lda davom et!", author: null },
  ],
  // 60-79%
  average: [
    { text: "Ilm olish — nina bilan quduq qazish.", author: "O'zbek xalq maqoli" },
    { text: "Bilmaganni so'rab o'rgangan olim, orlanib so'ramagan o'ziga zolim.", author: "O'zbek xalq maqoli" },
    { text: "Xato qilgan odam hech narsa qilmagan odamdan yaxshiroqdir.", author: "Albert Eynshteyn" },
    { text: "Ilm istasang, takror qil.", author: "O'zbek xalq maqoli" },
    { text: "Davom et! Har bir xato — yangi bilim!", author: null },
  ],
  // 60% dan past
  low: [
    { text: "Ilm olishning erta-kechi yo'q.", author: "O'zbek xalq maqoli" },
    { text: "Bilmagan ayb emas, bilishga tirishmagan ayb.", author: "O'zbek xalq maqoli" },
    { text: "Beshikdan qabrgacha bilim ista.", author: "Hadis" },
    { text: "Uchishga qanot kerak, o'qishga — toqat.", author: "O'zbek xalq maqoli" },
    { text: "Tashvishlanma! Har bir ustoz ham bir paytlar shogird bo'lgan.", author: null },
  ],
}

// === O'QUVCHI — Xato qilganda ===
export const ERROR_MOTIVATION = [
  { text: "Xato — bu muvaffaqiyatsizlik emas, o'rganish jarayoni!", author: null },
  { text: "Eynshteyn ham maktabda 'sekin o'rganuvchi' deb atalingan. Muhimi — to'xtamaslik!", author: null },
  { text: "Xato qilding — demak harakat qilding. Harakat qilmagan hech narsaga erisha olmaydi.", author: null },
  { text: "Bu masalani 3 marta yechsang, 4-chi safar albatta to'g'ri chiqadi! Qayta urinib ko'r.", author: null },
  { text: "Mirzo Ulug'bek yulduzlarni o'rganish uchun yillar sarflagan. Sening bir xatoing — bir lahza!", author: null },
  { text: "Ilmning avvali achchiq, so'ngi — totli. Hozir achchiq qism — totlisi kelmoqda!", author: "O'zbek xalq maqoli" },
]

// === O'QUVCHI — Streak ===
export const STREAK_QUOTES = {
  3:  { text: "Uch kun ketma-ket! Odatga aylanyapti!", author: null },
  7:  { text: "Bir hafta! 'Ilm — yorug'lik, jaholat — zulmat.'", author: "O'zbek xalq maqoli" },
  14: { text: "Ikki hafta! 'Zehn qo'ysa, ong qo'nar, hunar ortsa, ish unar!'", author: "O'zbek xalq maqoli" },
  30: { text: "Bir oy! 'Ilmli uy — charog'on, ilmsiz uy — zimiston!'", author: "O'zbek xalq maqoli" },
}

// === DARAJA TIZIMI ===
export const LEVELS = [
  { level: 1, name: "Yangi o'quvchi", xpRequired: 0,    emoji: "🌱", quote: "Har bir sayohat birinchi qadamdan boshlanadi", author: "Lao Tsze" },
  { level: 2, name: "Shogird",        xpRequired: 100,  emoji: "📖", quote: "Bilmaganni so'rab o'rgangan olim", author: "O'zbek maqoli" },
  { level: 3, name: "Bilimdon",       xpRequired: 500,  emoji: "🎓", quote: "Ilm — aql bulog'i, aql — yashash chirog'i", author: "O'zbek maqoli" },
  { level: 4, name: "Ustoz",          xpRequired: 1500, emoji: "⭐", quote: "Emdikim ilm o'ldi, amal aylagil", author: "Alisher Navoiy" },
  { level: 5, name: "Alloma",         xpRequired: 3000, emoji: "🏅", quote: "Tafakkur birla bildi odamizod", author: "Alisher Navoiy" },
  { level: 6, name: "Dono",           xpRequired: 5000, emoji: "👑", quote: "Ilmli ming yashar, ilmsiz bir yashar", author: "O'zbek maqoli" },
  { level: 7, name: "Daho",           xpRequired: 10000,emoji: "🌟", quote: "Oz-oz o'rganib dono bo'lur, qatra-qatra yig'ilib daryo bo'lur", author: "Alisher Navoiy" },
]

// === BALL TIZIMI ===
export const POINTS = {
  correctProblem: 10,
  partialCorrect: 5,
  perfectScore: 20,    // bonus
  dailyStreak: 15,     // bonus
  weeklyStreak: 50,    // bonus
  weakTopicWin: 30,    // bonus
  inviteFriend: 50,    // bonus
}

// === YUTUQLAR (Achievements) ===
export const ACHIEVEMENTS = [
  { id: "birinchi_qadam", name: "Birinchi qadam",  emoji: "🎯", condition: "Birinchi vazifa yuborish",        quote: "Yuz ming yillik yo'l ham bir qadamdan boshlanadi!", author: "Lao Tsze" },
  { id: "olovli_hafta",  name: "Olovli hafta",    emoji: "🔥", condition: "7 kun ketma-ket",                  quote: "Ilm — yonar chiroq! Sen yonmoqdasan!", author: "O'zbek maqoli" },
  { id: "mukammal",      name: "Mukammal",         emoji: "💯", condition: "100% natija",                      quote: "Ilmli odam — ilikli suyak!", author: "O'zbek maqoli" },
  { id: "matematik",     name: "Matematik",        emoji: "🧮", condition: "50 ta matematika masala",          quote: "Xorazmiy senga faxrlanar edi!", author: null },
  { id: "osish",         name: "O'sish",           emoji: "📈", condition: "Ball 30%+ oshganda",               quote: "Oz-oz o'rganib dono bo'lur!", author: "Alisher Navoiy" },
  { id: "dostona",       name: "Do'stona",         emoji: "👥", condition: "3 ta do'stni taklif qilish",       quote: "Ilmning afzali o'rganib, boshqalarga o'rgatish", author: "Hadis" },
  { id: "sinf_yulduzi",  name: "Sinf yulduzi",     emoji: "🏆", condition: "Sinfda 1-o'rin",                   quote: "Go'zallik — ilm-u ma'rifatda!", author: "O'zbek maqoli" },
  { id: "yenguvchi",     name: "Yenguvchi",        emoji: "💪", condition: "Zaif mavzuni yengish",             quote: "Bilmagan ayb emas, bilishga tirishmagan ayb!", author: "O'zbek maqoli" },
  { id: "yuz_masala",    name: "100 masala",        emoji: "📖", condition: "100 ta masala yechish",            quote: "Ilm — tubsiz quduq — sen chuqurroq sho'ng'imoqdasan!", author: "O'zbek maqoli" },
  { id: "navoiy",        name: "Navoiy",           emoji: "🖋", condition: "1000 ball to'plash",               quote: "Emdikim ilm o'ldi, amal aylagil", author: "Alisher Navoiy" },
]

// === KUNDALIK MOTIVATION ===
export const DAILY_QUOTES = {
  1: { text: "Yangi hafta — yangi imkoniyat! 'Ilm olishning erta-kechi yo'q'", author: "O'zbek xalq maqoli" },
  2: { text: "'Zehn qo'ysa, ong qo'nar' — bugun diqqat bilan yech!", author: "O'zbek xalq maqoli" },
  3: { text: "Hafta o'rtasi! 'Ilm ko'p, umr oz — keragini o'qi'", author: "O'zbek xalq maqoli" },
  4: { text: "'Bilak bilan bitmagan, bilim bilan bitar' — davom et!", author: "O'zbek xalq maqoli" },
  5: { text: "'Ilm istasang, takror qil' — bugun takrorlash kuni!", author: "O'zbek xalq maqoli" },
  6: { text: "Dam olish ham muhim! Lekin bitta masala yechib qo'y", author: null },
  0: { text: "'Beshikdan qabrgacha bilim ista' — yangi haftaga tayyor bo'l!", author: "Hadis" },
}

// === O'QITUVCHI UCHUN ===
export const TEACHER_QUOTES = [
  { text: "Haq yo'linda kim senga bir harf o'qitmish ranj ila, aylamak bo'lmas ado oning haqin yuz ganj ila.", author: "Alisher Navoiy" },
  { text: "Yaxshi bilsang ishingni, yaxshilar silar boshingni.", author: "O'zbek xalq maqoli" },
  { text: "Avval o'rgan, keyin o'rgat.", author: "O'zbek xalq maqoli" },
  { text: "Yaxshi o'qituvchi tushuntiradi, ajoyib o'qituvchi ilhomlantiradi.", author: "Uilyam Artur Uord" },
  { text: "Shogirding oqil bo'lsa, boshingda toj.", author: "O'zbek xalq maqoli" },
]

// === OTA-ONA UCHUN ===
export const PARENT_QUOTES = [
  { text: "Ilm baxt keltirar, bilim taxt keltirar.", author: "O'zbek xalq maqoli" },
  { text: "Didli yigit — ilmli yigit.", author: "O'zbek xalq maqoli" },
  { text: "Oz-oz o'rganib dono bo'lur, qatra-qatra yig'ilib daryo bo'lur.", author: "Alisher Navoiy" },
  { text: "Bilmagan ayb emas, bilishga tirishmagan ayb.", author: "O'zbek xalq maqoli" },
  { text: "Ilm olish — nina bilan quduq qazish.", author: "O'zbek xalq maqoli" },
]

// === HELPER FUNCTIONS ===

export function getQuoteByScore(score) {
  if (score >= 100) return randomFrom(STUDENT_SCORE_QUOTES.perfect)
  if (score >= 80) return randomFrom(STUDENT_SCORE_QUOTES.good)
  if (score >= 60) return randomFrom(STUDENT_SCORE_QUOTES.average)
  return randomFrom(STUDENT_SCORE_QUOTES.low)
}

export function getDailyQuote() {
  const day = new Date().getDay()
  return DAILY_QUOTES[day]
}

export function getLevelInfo(xp) {
  let current = LEVELS[0]
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl
    else break
  }
  return current
}

export function getNextLevel(xp) {
  for (const lvl of LEVELS) {
    if (xp < lvl.xpRequired) return lvl
  }
  return null
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function getRandomTeacherQuote() {
  return randomFrom(TEACHER_QUOTES)
}

export function getRandomParentQuote() {
  return randomFrom(PARENT_QUOTES)
}

export function getRandomErrorMotivation() {
  return randomFrom(ERROR_MOTIVATION)
}
