import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, TrendingUp, BookCheck, AlertCircle, Compass, GraduationCap, Star, Lightbulb, RefreshCw } from 'lucide-react'
import { STUDENTS, STUDENT_HISTORY, TOPIC_ERRORS } from '../../data/synthetic'
import { getRandomParentQuote } from '../../data/quotes'
import RiskDashboard from '../../components/RiskDashboard'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const parentName = localStorage.getItem('parentName') || 'Ota-ona'
  const telegramId = localStorage.getItem('telegramId')
  const childId = localStorage.getItem('childId')
  const childNameLS = localStorage.getItem('childName')
  const childUsername = localStorage.getItem('childUsername')
  const childGrade = localStorage.getItem('childGrade')

  const [childData, setChildData] = useState(null)
  const [childAnalysis, setChildAnalysis] = useState(null)
  const [careerPrediction, setCareerPrediction] = useState(null)
  const [careerLoading, setCareerLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [parentQuote] = useState(() => getRandomParentQuote())

  useEffect(() => {
    // Real data olishga harakat
    if (telegramId && telegramId !== '0') {
      fetch(`/api/users/child-data?parent_telegram_id=${telegramId}`)
        .then(r => r.json())
        .then(data => {
          if (data?.linked) {
            setChildData(data)
            if (data.child?.telegram_id) {
              fetch(`/api/analysis/student/${data.child.telegram_id}`)
                .then(r => r.json())
                .then(a => { if (a.total_submissions > 0) setChildAnalysis(a) })
                .catch(() => {})
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
      return
    }

    // Demo farzand — sintetik datadan
    if (childId) {
      const demoChild = STUDENTS.find(s => s.id === childId)
      if (demoChild) {
        setChildData({
          linked: true,
          child: {
            full_name: demoChild.name,
            username: demoChild.username,
            grade: demoChild.grade,
          },
          stats: {
            total_submissions: STUDENT_HISTORY.length,
            avg_score: demoChild.avgScore,
            weak_topics: TOPIC_ERRORS.slice(0, 3).map(t => t.topic),
          },
          submissions: STUDENT_HISTORY.map((s) => ({
            id: s.id,
            subject: s.subject,
            score: s.score,
            total_problems: s.totalProblems || 5,
            correct_count: s.correctCount || Math.round(s.score / 20),
            created_at: s.date,
          })),
        })
        // Demo risk analysis
        setChildAnalysis({
          overall_score: demoChild.avgScore,
          risk_level: demoChild.avgScore >= 80 ? 'green' : demoChild.avgScore >= 50 ? 'yellow' : 'red',
          risk_label: demoChild.avgScore >= 80 ? 'Yaxshi o\'zlashtiryapti' : demoChild.avgScore >= 50 ? 'O\'rtacha, mashq kerak' : 'Qo\'shimcha tayyorlik kerak',
          total_submissions: STUDENT_HISTORY.length,
          subjects: {
            [demoChild.subject.toLowerCase()]: {
              avg_score: demoChild.avgScore,
              risk: demoChild.avgScore >= 80 ? 'green' : 'yellow',
              risk_label: demoChild.avgScore >= 80 ? 'Yaxshi' : 'O\'rtacha',
              total_submissions: STUDENT_HISTORY.length,
              topics: {},
              weak_topics: TOPIC_ERRORS.slice(0, 2).map(t => t.topic),
              strong_topics: ['Tenglamalar', 'Arifmetika'],
            }
          },
          recommendation: demoChild.avgScore >= 80
            ? 'Ajoyib natija! Murakkabroq masalalar bilan bilimini mustahkamlang.'
            : 'Kasrlar va foizlar mavzusiga ko\'proq e\'tibor bering.',
        })
      }
    } else if (childNameLS) {
      // localStorage dan minimal data
      setChildData({
        linked: true,
        child: { full_name: childNameLS, username: childUsername, grade: Number(childGrade) || 7 },
        stats: { total_submissions: 0, avg_score: 0, weak_topics: [] },
        submissions: [],
      })
    }

    setLoading(false)
  }, [telegramId, childId])

  const fetchCareerPrediction = async (tgId) => {
    setCareerLoading(true)
    try {
      const r = await fetch(`/api/analysis/career-prediction/${tgId}`)
      const data = await r.json()
      if (data.career_directions) setCareerPrediction(data)
    } catch (e) { /* ignore */ }
    finally { setCareerLoading(false) }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">{parentName}</h1>
            <p className="text-xs text-gray-500">Ota-ona paneli</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/parent/profile">
              <img src="/avatars/parent.jpg" alt="Profil" className="w-9 h-9 rounded-full object-cover border-2 border-gray-200" />
            </Link>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">

        {/* Hikmatli so'z */}
        <div className="bg-accent-50 rounded-xl px-4 py-3 border border-accent-100">
          <p className="text-xs text-accent-700 italic">"{parentQuote.text}"</p>
          {parentQuote.author && <p className="text-[10px] text-accent-400 mt-0.5">— {parentQuote.author}</p>}
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent-200 border-t-accent-500 mx-auto"></div>
            <p className="text-sm text-gray-400 mt-3">Yuklanmoqda...</p>
          </div>
        ) : childData?.linked ? (
          <>
            <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl p-5 text-white">
              <h2 className="font-bold text-lg">{childData.child.full_name}</h2>
              <p className="text-sm text-accent-100">
                {childData.child.grade ? `${childData.child.grade}-sinf` : ''}
                {childData.child.username ? ` | @${childData.child.username}` : ''}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                <BookCheck className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">{childData.stats.total_submissions}</p>
                <p className="text-[10px] text-gray-500">Tekshiruvlar</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                <TrendingUp className="w-5 h-5 text-success-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">{childData.stats.avg_score}%</p>
                <p className="text-[10px] text-gray-500">O'rtacha</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                <AlertCircle className="w-5 h-5 text-accent-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">{childData.stats.weak_topics.length}</p>
                <p className="text-[10px] text-gray-500">Zaif mavzu</p>
              </div>
            </div>

            {/* === RISK DASHBOARD — farzand tahlili === */}
            {childAnalysis && (
              <RiskDashboard
                analysis={childAnalysis}
                title="Farzandingiz bilim tahlili"
              />
            )}

            {/* === KASB YO'NALISHI BASHORATI === */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-500" />
                  <h2 className="text-base font-semibold text-gray-800">Kasb yo'nalishi</h2>
                </div>
                {!careerLoading && (
                  <button
                    onClick={() => {
                      const tgId = childData?.child?.telegram_id || telegramId
                      if (tgId && tgId !== '0') fetchCareerPrediction(tgId)
                      else {
                        // Demo prediction
                        setCareerPrediction({
                          ready: true,
                          career_directions: [
                            { career_name: "Dasturchi / IT mutaxassis", career_emoji: "💻", match_score: 88, reason: "Matematika va mantiqiy fikrlash kuchli — dasturlashda juda kerak", key_subjects: ["Informatika", "Matematika"], advice: "Python yoki JavaScript tillarini o'rganishni boshlang" },
                            { career_name: "Muhandis", career_emoji: "⚙️", match_score: 82, reason: "Fizika va matematika bo'yicha yaxshi natijalar", key_subjects: ["Fizika", "Matematika"], advice: "Robototexnika to'garaklariga qatnashing" },
                            { career_name: "Moliyachi / Iqtisodchi", career_emoji: "📊", match_score: 75, reason: "Raqamlar bilan ishlash qobiliyati yuqori", key_subjects: ["Matematika", "Ingliz tili"], advice: "Iqtisodiyot asoslari bilan tanishing" },
                          ],
                          overall_summary: "Farzandingiz aniq fanlar bo'yicha kuchli ko'rsatkichlarga ega. Texnologiya va muhandislik sohasida katta salohiyat bor.",
                          improvement_plan: "Ingliz tili va informatikaga ko'proq e'tibor berish tavsiya etiladi.",
                          motivation: "Har bir buyuk kashfiyot bitta qadamdan boshlanadi! 🌟",
                        })
                      }
                    }}
                    className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition"
                  >
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
                          <span key={j} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                            {subj}
                          </span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-start gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-600">{career.advice}</p>
                      </div>
                      {/* Match score progress bar */}
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full transition-all"
                          style={{ width: `${career.match_score}%` }}
                        ></div>
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

                  {careerPrediction.motivation && (
                    <div className="text-center py-2">
                      <p className="text-sm text-gray-600 italic">"{careerPrediction.motivation}"</p>
                    </div>
                  )}

                  <p className="text-[10px] text-gray-400 text-center">
                    Bu AI tavsiyasi bo'lib, yakuniy baho emas. Farzandingizning qiziqishlari va xohishlarini ham hisobga oling.
                  </p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Compass className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">
                    "Aniqlash" tugmasini bosing — AI farzandingizning kuchli tomonlarini tahlil qilib, mos kasb yo'nalishlarini tavsiya qiladi
                  </p>
                </div>
              )}
            </div>

            {childData.stats.weak_topics.length > 0 && !childAnalysis && (
              <div className="bg-accent-50 rounded-xl p-3 border border-accent-200">
                <p className="text-xs font-medium text-accent-700">
                  ⚠️ Zaif mavzular: {childData.stats.weak_topics.join(', ')}
                </p>
              </div>
            )}

            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 mb-3">Tekshiruvlar</h2>
              {childData.submissions.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Hali tekshiruv yo'q</p>
              ) : (
                childData.submissions.map(sub => (
                  <div key={sub.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-sm text-gray-700">{sub.subject}</p>
                      <p className="text-xs text-gray-400">
                        {sub.created_at ? new Date(sub.created_at).toLocaleString('uz') : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-sm font-bold ${
                        sub.score >= 80 ? 'text-success-500' : sub.score >= 60 ? 'text-accent-500' : 'text-danger-500'
                      }`}>{sub.score}%</span>
                      <p className="text-xs text-gray-400">{sub.correct_count}/{sub.total_problems}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-xl p-6 text-center shadow-sm">
            <p className="text-gray-500">Farzandingiz hali bog'lanmagan yoki tasdiqlamagan</p>
            <p className="text-xs text-gray-400 mt-2">Farzandingiz Telegram Mini App da tasdiqlashi kerak</p>
          </div>
        )}

        {/* Demo tarix */}
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
