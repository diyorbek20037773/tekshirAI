/**
 * Sintetik (demo) ma'lumotlar — real dataday ko'rinadi.
 * O'qituvchi, o'quvchi, ota-ona uchun.
 */

// O'quvchilar ro'yxati
export const STUDENTS = [
  { id: '1', name: "Aziz Toshmatov", username: "aziz_t", grade: 7, subject: "Matematika", avgScore: 87, streak: 12, level: 4, xp: 780, badges: ["birinchi_qadam", "hafta_yulduzi", "matematik"] },
  { id: '2', name: "Dilnoza Rahimova", username: "dilnoza_r", grade: 7, subject: "Matematika", avgScore: 94, streak: 21, level: 5, xp: 1250, badges: ["birinchi_qadam", "hafta_yulduzi", "xatosiz_kun", "matematik", "oy_chempioni"] },
  { id: '3', name: "Bobur Aliyev", username: "bobur_a", grade: 7, subject: "Matematika", avgScore: 72, streak: 5, level: 3, xp: 420, badges: ["birinchi_qadam"] },
  { id: '4', name: "Nodira Karimova", username: "nodira_k", grade: 7, subject: "Matematika", avgScore: 91, streak: 18, level: 5, xp: 1100, badges: ["birinchi_qadam", "hafta_yulduzi", "xatosiz_kun"] },
  { id: '5', name: "Sardor Umarov", username: "sardor_u", grade: 7, subject: "Matematika", avgScore: 65, streak: 3, level: 2, xp: 210, badges: ["birinchi_qadam"] },
  { id: '6', name: "Malika Jumayeva", username: "malika_j", grade: 7, subject: "Matematika", avgScore: 83, streak: 9, level: 4, xp: 690, badges: ["birinchi_qadam", "hafta_yulduzi"] },
  { id: '7', name: "Jasur Karimov", username: "jasur_k", grade: 7, subject: "Matematika", avgScore: 78, streak: 7, level: 3, xp: 510, badges: ["birinchi_qadam", "hafta_yulduzi"] },
  { id: '8', name: "Gulnora Saidova", username: "gulnora_s", grade: 7, subject: "Matematika", avgScore: 96, streak: 25, level: 6, xp: 2100, badges: ["birinchi_qadam", "hafta_yulduzi", "xatosiz_kun", "matematik", "oy_chempioni", "sinf_yulduzi"] },
]

// Submissionlar
export const SUBMISSIONS = [
  { id: '1', studentId: '1', studentName: "Aziz Toshmatov", subject: "Matematika", score: 80, totalProblems: 5, correctCount: 4, date: "2026-03-29", time: "14:30" },
  { id: '2', studentId: '2', studentName: "Dilnoza Rahimova", subject: "Matematika", score: 100, totalProblems: 5, correctCount: 5, date: "2026-03-29", time: "15:10" },
  { id: '3', studentId: '3', studentName: "Bobur Aliyev", subject: "Matematika", score: 60, totalProblems: 5, correctCount: 3, date: "2026-03-29", time: "16:00" },
  { id: '4', studentId: '8', studentName: "Gulnora Saidova", subject: "Matematika", score: 100, totalProblems: 6, correctCount: 6, date: "2026-03-29", time: "14:45" },
  { id: '5', studentId: '4', studentName: "Nodira Karimova", subject: "Matematika", score: 83, totalProblems: 6, correctCount: 5, date: "2026-03-29", time: "17:20" },
  { id: '6', studentId: '6', studentName: "Malika Jumayeva", subject: "Matematika", score: 75, totalProblems: 4, correctCount: 3, date: "2026-03-28", time: "15:30" },
  { id: '7', studentId: '7', studentName: "Jasur Karimov", subject: "Matematika", score: 80, totalProblems: 5, correctCount: 4, date: "2026-03-28", time: "16:45" },
  { id: '8', studentId: '5', studentName: "Sardor Umarov", subject: "Matematika", score: 40, totalProblems: 5, correctCount: 2, date: "2026-03-28", time: "18:00" },
  { id: '9', studentId: '1', studentName: "Aziz Toshmatov", subject: "Matematika", score: 90, totalProblems: 5, correctCount: 4, date: "2026-03-27", time: "14:00" },
  { id: '10', studentId: '2', studentName: "Dilnoza Rahimova", subject: "Matematika", score: 100, totalProblems: 4, correctCount: 4, date: "2026-03-27", time: "15:30" },
]

// Mavzu bo'yicha xatolar
export const TOPIC_ERRORS = [
  { topic: "Kasrlar", count: 12 },
  { topic: "Tenglamalar", count: 9 },
  { topic: "Foizlar", count: 7 },
  { topic: "Geometriya", count: 6 },
  { topic: "Darajalar", count: 5 },
  { topic: "Manfiy sonlar", count: 4 },
]

// Sinflar
export const CLASSROOMS = [
  { id: '1', name: "7-A sinf", subject: "Matematika", studentCount: 8, avgScore: 83.3, todaySubmissions: 5, inviteCode: "7A2026MK" },
  { id: '2', name: "7-B sinf", subject: "Matematika", studentCount: 6, avgScore: 76.5, todaySubmissions: 3, inviteCode: "7B2026MK" },
  { id: '3', name: "8-A sinf", subject: "Fizika", studentCount: 7, avgScore: 79.1, todaySubmissions: 4, inviteCode: "8A2026FZ" },
]

// O'quvchi uchun submission tarixi (gamification bilan)
export const STUDENT_HISTORY = [
  { id: '1', subject: "Matematika", score: 80, totalProblems: 5, correctCount: 4, date: "2026-03-29", xpEarned: 10 },
  { id: '2', subject: "Matematika", score: 100, totalProblems: 4, correctCount: 4, date: "2026-03-28", xpEarned: 25 },
  { id: '3', subject: "Matematika", score: 60, totalProblems: 5, correctCount: 3, date: "2026-03-27", xpEarned: 10 },
  { id: '4', subject: "Matematika", score: 75, totalProblems: 4, correctCount: 3, date: "2026-03-26", xpEarned: 10 },
  { id: '5', subject: "Matematika", score: 90, totalProblems: 5, correctCount: 4, date: "2026-03-25", xpEarned: 10 },
  { id: '6', subject: "Matematika", score: 100, totalProblems: 6, correctCount: 6, date: "2026-03-24", xpEarned: 25 },
  { id: '7', subject: "Matematika", score: 85, totalProblems: 4, correctCount: 3, date: "2026-03-23", xpEarned: 10 },
]

// Nishonlar katalogi
export const BADGES_CATALOG = {
  birinchi_qadam: { name: "Birinchi qadam", emoji: "⭐", description: "1-chi vazifani tekshirish" },
  hafta_yulduzi: { name: "Hafta yulduzi", emoji: "🌟", description: "7 kunlik streak" },
  xatosiz_kun: { name: "Xatosiz kun", emoji: "💎", description: "1 kunda barcha masalalar to'g'ri" },
  matematik: { name: "Matematik", emoji: "🧮", description: "50 ta math masala to'g'ri" },
  sorovchi: { name: "So'rovchi", emoji: "🤔", description: "AI dan 10 marta so'rash" },
  oy_chempioni: { name: "Oy chempioni", emoji: "🏆", description: "30 kunlik streak" },
  sinf_yulduzi: { name: "Sinf yulduzi", emoji: "👑", description: "Sinfda 1-o'rin" },
  yuz_ball: { name: "Yuz ball", emoji: "💯", description: "10 marta 100% ball olish" },
}

// Darajalar
export const LEVELS = [
  { level: 1, name: "Boshlang'ich", xpRequired: 0, emoji: "🌱" },
  { level: 2, name: "Harakat qiluvchi", xpRequired: 100, emoji: "⭐" },
  { level: 3, name: "Bilimdon", xpRequired: 300, emoji: "📚" },
  { level: 4, name: "Ustoz yo'lida", xpRequired: 600, emoji: "🎯" },
  { level: 5, name: "Akademik", xpRequired: 1000, emoji: "🏅" },
  { level: 6, name: "Professor", xpRequired: 2000, emoji: "🎓" },
  { level: 7, name: "Olim", xpRequired: 5000, emoji: "🧪" },
]
