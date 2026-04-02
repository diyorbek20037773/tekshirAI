import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookCheck, Target, AlertCircle, Compass, Star, Lightbulb, GraduationCap, RefreshCw } from 'lucide-react'
import { STUDENTS, STUDENT_HISTORY, BADGES_CATALOG, LEVELS } from '../../data/synthetic'

function CareerPredictionCard({ careerPrediction, careerLoading, onFetch }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-purple-500" />
          <h2 className="text-base font-semibold text-gray-800">Kasb yo'nalishi</h2>
        </div>
        {!careerLoading && (
          <button onClick={onFetch}
            className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition">
            <RefreshCw className="w-3 h-3" />
            {careerPrediction ? "Yangilash" : "Aniqlash"}
          </button>
        )}
      </div>

      {careerLoading ? (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-500 mx-auto"></div>
          <p className="text-xs text-gray-400 mt-2">AI tahlil qilmoqda...</p>
        </div>
      ) : careerPrediction?.career_directions?.length > 0 ? (
        <div className="space-y-3">
          {careerPrediction.career_directions.map((career, i) => (
            <div key={i} className="border border-gray-100 rounded-lg p-3 hover:border-purple-200 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{career.career_emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{career.career_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{career.reason}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-full">
                  <Star className="w-3 h-3 text-purple-500" />
                  <span className="text-xs font-bold text-purple-600">{career.match_score}%</span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {career.key_subjects?.map((subj, j) => (
                  <span key={j} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{subj}</span>
                ))}
              </div>
              <div className="mt-2 flex items-start gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-xs text-gray-600">{career.advice}</p>
              </div>
              <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full transition-all"
                  style={{ width: `${career.match_score}%` }}></div>
              </div>
            </div>
          ))}
          {careerPrediction.overall_summary && (
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div className="flex items-center gap-1 mb-1">
                <GraduationCap className="w-4 h-4 text-purple-600" />
                <p className="text-xs font-semibold text-purple-700">Xulosa</p>
              </div>
              <p className="text-xs text-purple-600">{careerPrediction.overall_summary}</p>
            </div>
          )}
          {careerPrediction.improvement_plan && (
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-1">Tavsiya</p>
              <p className="text-xs text-blue-600">{careerPrediction.improvement_plan}</p>
            </div>
          )}
          <p className="text-[10px] text-gray-400 text-center">
            Bu AI tavsiyasi bo'lib, yakuniy baho emas.
          </p>
        </div>
      ) : (
        <div className="text-center py-4">
          <Compass className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-400">"Aniqlash" tugmasini bosing — AI o'quvchining kasb yo'nalishini tahlil qiladi</p>
        </div>
      )}
    </div>
  )
}

export default function TeacherStudent() {
  const { id } = useParams()

  // Synthetic data (demo uchun)
  const demoStudent = STUDENTS.find(s => s.id === id)

  // Real data
  const [realData, setRealData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [careerPrediction, setCareerPrediction] = useState(null)
  const [careerLoading, setCareerLoading] = useState(false)

  const fetchCareerPrediction = async (tgId) => {
    setCareerLoading(true)
    try {
      const r = await fetch(`/api/analysis/career-prediction/${tgId}`)
      const data = await r.json()
      if (data.career_directions) setCareerPrediction(data)
    } catch (e) { /* ignore */ }
    finally { setCareerLoading(false) }
  }

  useEffect(() => {
    // id raqam bo'lsa — real telegram_id, aks holda demo
    if (!isNaN(id) && Number(id) > 100) {
      fetch(`/api/users/student/${id}/submissions`)
        .then(r => r.json())
        .then(data => setRealData(data))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [id])

  // Demo student view
  if (demoStudent && !realData) {
    const levelInfo = LEVELS.find(l => l.level === demoStudent.level) || LEVELS[0]
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Link to="/teacher" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{demoStudent.name}</h1>
              <p className="text-xs text-gray-500">{demoStudent.grade}-sinf | @{demoStudent.username}</p>
            </div>
          </div>
        </div>
        <div className="max-w-lg mx-auto p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className="text-lg font-bold text-gray-800">{STUDENT_HISTORY.length}</p>
              <p className="text-[10px] text-gray-500">Tekshiruvlar</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className="text-lg font-bold text-success-600">{demoStudent.avgScore}%</p>
              <p className="text-[10px] text-gray-500">O'rtacha</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className="text-lg font-bold text-orange-500">{demoStudent.streak}</p>
              <p className="text-[10px] text-gray-500">Streak</p>
            </div>
          </div>
          {/* === KASB YO'NALISHI (demo) === */}
          <CareerPredictionCard
            careerPrediction={careerPrediction}
            careerLoading={careerLoading}
            onFetch={() => {
              setCareerPrediction({
                ready: true,
                career_directions: [
                  { career_name: "Dasturchi / IT mutaxassis", career_emoji: "💻", match_score: 88, reason: "Matematika va mantiqiy fikrlash kuchli", key_subjects: ["Informatika", "Matematika"], advice: "Python yoki JavaScript tillarini o'rganishni boshlang" },
                  { career_name: "Muhandis", career_emoji: "⚙️", match_score: 82, reason: "Fizika va matematika bo'yicha yaxshi natijalar", key_subjects: ["Fizika", "Matematika"], advice: "Robototexnika to'garaklariga qatnashing" },
                  { career_name: "Moliyachi", career_emoji: "📊", match_score: 75, reason: "Raqamlar bilan ishlash qobiliyati yuqori", key_subjects: ["Matematika", "Ingliz tili"], advice: "Iqtisodiyot asoslari bilan tanishing" },
                ],
                overall_summary: "O'quvchi aniq fanlar bo'yicha kuchli ko'rsatkichlarga ega. Texnologiya va muhandislik sohasida katta salohiyat bor.",
                improvement_plan: "Ingliz tili va informatikaga ko'proq e'tibor berish tavsiya etiladi.",
                motivation: "Har bir buyuk kashfiyot bitta qadamdan boshlanadi!",
              })
            }}
          />

          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Tarix (demo)</h2>
            {STUDENT_HISTORY.map(sub => (
              <div key={sub.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm text-gray-700">{sub.subject}</p>
                  <p className="text-xs text-gray-400">{sub.date}</p>
                </div>
                <span className={`text-sm font-bold ${
                  sub.score >= 80 ? 'text-success-500' : sub.score >= 60 ? 'text-accent-500' : 'text-danger-500'
                }`}>{sub.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Real student view
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-500"></div>
      </div>
    )
  }

  if (!realData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Link to="/teacher" className="text-primary-500">← Orqaga</Link>
        <p className="mt-4 text-gray-500">O'quvchi topilmadi</p>
      </div>
    )
  }

  const { student, submissions } = realData
  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((a, s) => a + (s.score || 0), 0) / submissions.length)
    : 0

  // Zaif mavzular yig'ish
  const weakTopics = new Set()
  submissions.forEach(s => {
    if (s.ai_result?.weak_topics) {
      s.ai_result.weak_topics.forEach(t => weakTopics.add(t))
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/teacher" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{student.full_name}</h1>
            <p className="text-xs text-gray-500">
              {student.grade ? `${student.grade}-sinf` : ''} {student.username ? `| @${student.username}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <BookCheck className="w-5 h-5 text-primary-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{submissions.length}</p>
            <p className="text-[10px] text-gray-500">Tekshiruvlar</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <Target className="w-5 h-5 text-success-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{avgScore}%</p>
            <p className="text-[10px] text-gray-500">O'rtacha</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <AlertCircle className="w-5 h-5 text-accent-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{weakTopics.size}</p>
            <p className="text-[10px] text-gray-500">Zaif mavzu</p>
          </div>
        </div>

        {weakTopics.size > 0 && (
          <div className="bg-accent-50 rounded-xl p-3 border border-accent-200">
            <p className="text-xs font-medium text-accent-700">
              ⚠️ Zaif mavzular: {[...weakTopics].join(', ')}
            </p>
          </div>
        )}

        {/* === KASB YO'NALISHI (real) === */}
        <CareerPredictionCard
          careerPrediction={careerPrediction}
          careerLoading={careerLoading}
          onFetch={() => fetchCareerPrediction(id)}
        />

        {/* Submissionlar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Tekshiruvlar</h2>
          {submissions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Hali tekshiruv yo'q</p>
          ) : (
            submissions.map(sub => (
              <div key={sub.id} className="py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{sub.subject}</p>
                    <p className="text-xs text-gray-400">
                      {sub.created_at ? new Date(sub.created_at).toLocaleString('uz') : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${
                      sub.score >= 80 ? 'text-success-500' : sub.score >= 60 ? 'text-accent-500' : 'text-danger-500'
                    }`}>{sub.score}%</span>
                    <p className="text-xs text-gray-400">{sub.correct_count}/{sub.total_problems}</p>
                  </div>
                </div>

                {/* AI natija — masalalar */}
                {sub.ai_result?.problems && (
                  <div className="space-y-1 mt-2">
                    {sub.ai_result.problems.map((p, i) => (
                      <div key={i} className={`text-xs px-2 py-1 rounded ${
                        p.is_correct ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
                      }`}>
                        {p.is_correct ? '✅' : '❌'} {p.number}-masala: {p.problem_text?.slice(0, 60)}
                        {!p.is_correct && p.error_explanation && (
                          <span className="block text-danger-600 mt-0.5">💡 {p.error_explanation}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {sub.ai_result?.recommendation && (
                  <p className="text-xs text-primary-600 mt-2">📌 {sub.ai_result.recommendation}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
