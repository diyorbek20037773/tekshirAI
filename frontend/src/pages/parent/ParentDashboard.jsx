import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { LogOut, TrendingUp, BookCheck, AlertCircle, Compass, GraduationCap, Star, Lightbulb, RefreshCw, Clock } from 'lucide-react'
import { getRandomParentQuote } from '../../data/quotes'

// 2 ta demo farzand
const DEMO_FARZANDLAR = [
  { id: 'demo-1', name: 'Sardor Umarov', gender: 'male', grade: 7, avgScore: 78, subject: 'Matematika' },
  { id: 'demo-2', name: 'Nilufar Rahimova', gender: 'female', grade: 5, avgScore: 88, subject: 'Ona tili' },
]

export default function ParentDashboard() {
  const navigate = useNavigate()
  const parentName = localStorage.getItem('parentName') || 'Ota-ona'
  const telegramId = localStorage.getItem('telegramId')

  const [recentSubs, setRecentSubs] = useState([])
  const [globalStats, setGlobalStats] = useState(null)
  const [careerPrediction, setCareerPrediction] = useState(null)
  const [careerLoading, setCareerLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [parentQuote] = useState(() => getRandomParentQuote())

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/recent-all?limit=20').then(r => r.json()).catch(() => []),
      fetch('/api/dashboard/stats-all').then(r => r.json()).catch(() => null),
    ]).then(([recent, stats]) => {
      setRecentSubs(recent)
      setGlobalStats(stats)
    }).finally(() => setLoading(false))
  }, [])

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

        {/* Umumiy statistika */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <BookCheck className="w-5 h-5 text-primary-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{globalStats?.today_submissions || 0}</p>
            <p className="text-[10px] text-gray-500">Bugun</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <TrendingUp className="w-5 h-5 text-success-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{globalStats?.avg_score || 0}%</p>
            <p className="text-[10px] text-gray-500">O'rtacha</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <AlertCircle className="w-5 h-5 text-accent-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{globalStats?.total_students || 0}</p>
            <p className="text-[10px] text-gray-500">O'quvchilar</p>
          </div>
        </div>

        {/* Demo farzandlar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Farzandlarim</h2>
          <div className="space-y-3">
            {DEMO_FARZANDLAR.map(child => (
              <div key={child.id} className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-3">
                  <img src={child.gender === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'}
                    alt="" className="w-10 h-10 rounded-full object-cover border-2 border-blue-200" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{child.name}</p>
                    <p className="text-xs text-gray-500">{child.grade}-sinf | {child.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    child.avgScore >= 80 ? 'text-success-500' : child.avgScore >= 60 ? 'text-accent-500' : 'text-danger-500'
                  }`}>{child.avgScore}%</span>
                  <p className="text-[10px] text-gray-400">O'rtacha</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* === KASB YO'NALISHI === */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-500" />
              <h2 className="text-base font-semibold text-gray-800">Kasb yo'nalishi</h2>
            </div>
            {!careerLoading && (
              <button onClick={() => {
                setCareerPrediction({
                  career_directions: [
                    { career_name: "Dasturchi / IT mutaxassis", career_emoji: "💻", match_score: 88, reason: "Matematika va mantiqiy fikrlash kuchli", key_subjects: ["Informatika", "Matematika"], advice: "Python yoki JavaScript o'rganishni boshlang" },
                    { career_name: "Muhandis", career_emoji: "⚙️", match_score: 82, reason: "Fizika va matematika yaxshi natijalar", key_subjects: ["Fizika", "Matematika"], advice: "Robototexnika to'garaklariga qatnashing" },
                    { career_name: "Moliyachi", career_emoji: "📊", match_score: 75, reason: "Raqamlar bilan ishlash qobiliyati", key_subjects: ["Matematika", "Ingliz tili"], advice: "Iqtisodiyot asoslari bilan tanishing" },
                  ],
                  overall_summary: "Farzandingiz aniq fanlarda kuchli. Texnologiya sohasida salohiyat bor.",
                  motivation: "Har bir buyuk kashfiyot bitta qadamdan boshlanadi!",
                })
              }}
                className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition">
                <RefreshCw className="w-3 h-3" />
                {careerPrediction ? "Yangilash" : "Aniqlash"}
              </button>
            )}
          </div>
          {careerPrediction?.career_directions?.length > 0 ? (
            <div className="space-y-3">
              {careerPrediction.career_directions.map((career, i) => (
                <div key={i} className="border border-gray-100 rounded-lg p-3">
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
                    <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full" style={{ width: `${career.match_score}%` }}></div>
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
              <p className="text-[10px] text-gray-400 text-center">Bu AI tavsiyasi — yakuniy baho emas.</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <Compass className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">"Aniqlash" tugmasini bosing</p>
            </div>
          )}
        </div>

        {/* Oxirgi tekshiruvlar (real) */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent-200 border-t-accent-500 mx-auto"></div>
            <p className="text-sm text-gray-400 mt-3">Yuklanmoqda...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Oxirgi tekshiruvlar</h2>
            {recentSubs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Hali tekshiruv yo'q — o'quvchilar vazifa yuborishi kerak</p>
            ) : (
              recentSubs.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <img src={sub.student_gender === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'}
                      alt="" className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <p className="text-sm text-gray-700">{sub.student_name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {sub.subject} | {new Date(sub.created_at).toLocaleString('uz')}
                      </p>
                    </div>
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
        )}
      </div>
    </div>
  )
}
