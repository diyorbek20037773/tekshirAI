import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  LogOut, TrendingUp, BookCheck, AlertCircle, Compass, GraduationCap,
  Star, Lightbulb, RefreshCw, Search, UserPlus, CheckCircle, XCircle, Link2
} from 'lucide-react'
import { getRandomParentQuote } from '../../data/quotes'
import RatingModal from '../../components/RatingModal'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const parentName = localStorage.getItem('parentName') || 'Ota-ona'
  const telegramId = localStorage.getItem('telegramId')

  const [childData, setChildData] = useState(null)
  const [childLinked, setChildLinked] = useState(null) // null = loading, true/false
  const [loading, setLoading] = useState(true)
  const [parentQuote] = useState(() => getRandomParentQuote())

  // Farzand qidirish
  const [searchMode, setSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchGrade, setSearchGrade] = useState(0)
  const [searchResults, setSearchResults] = useState([])
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkStatus, setLinkStatus] = useState(null)

  // Setup dan kiritilgan farzandlar
  const parentChildren = (() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('parentChildren') || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  })()

  // Kasb yo'nalishi
  const [careerPrediction, setCareerPrediction] = useState(null)

  // Farzand ma'lumotlarini yuklash
  const fetchChildData = async () => {
    if (!telegramId) return
    try {
      const res = await fetch(`/api/users/child-data?parent_telegram_id=${telegramId}`)
      const data = await res.json()
      if (data.linked) {
        setChildLinked(true)
        setChildData(data)
      } else {
        setChildLinked(false)
      }
    } catch {
      setChildLinked(false)
    }
    setLoading(false)
  }

  useEffect(() => { fetchChildData() }, [telegramId])

  // Farzand qidirish — ism + sinf bo'yicha
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearchError('')
    setSearchResults([])
    setSearchResult(null)
    try {
      const params = new URLSearchParams({ name: searchQuery.trim() })
      if (searchGrade > 0) params.append('grade', searchGrade)
      // Maktab filtri olib tashlandi — qattiq mos kelmasligi uchun
      // Ota-ona natijadan to'g'ri farzandni tanlaydi
      const res = await fetch(`/api/users/search-students?${params}`)
      if (res.ok) {
        const data = await res.json()
        if (data.length === 0) {
          setSearchError("O'quvchi topilmadi. Ismni tekshiring.")
        } else {
          setSearchResults(data)
        }
      } else {
        setSearchError("Qidiruvda xatolik")
      }
    } catch {
      setSearchError('Xatolik yuz berdi')
    }
  }

  // Farzandga bog'lanish
  const handleLink = async (student) => {
    const target = student || searchResult
    if (!target) return
    setLinking(true)
    try {
      const res = await fetch('/api/users/link-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_telegram_id: Number(telegramId),
          child_username: target.username,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        setLinkStatus(data)
        if (data.status === 'confirmed') {
          setTimeout(() => {
            setSearchMode(false)
            setLinkStatus(null)
            setSearchResults([])
            fetchChildData()
          }, 2000)
        }
      } else {
        setSearchError(data.detail || 'Xatolik')
      }
    } catch {
      setSearchError('Server bilan aloqa yo\'q')
    }
    setLinking(false)
  }

  // Orqaga — rol menyusiga qaytish
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      sessionStorage.setItem('showRoleMenu', 'true')
      window.location.href = '/'
    }
    window.addEventListener('popstate', handlePopState)
    const tg = window.Telegram?.WebApp
    if (tg?.BackButton) {
      tg.BackButton.show()
      tg.BackButton.onClick(handlePopState)
    }
    return () => {
      window.removeEventListener('popstate', handlePopState)
      if (tg?.BackButton) { tg.BackButton.offClick(handlePopState); tg.BackButton.hide() }
    }
  }, [])

  const [showExitRating, setShowExitRating] = useState(false)
  const doExit = () => {
    sessionStorage.setItem('showRoleMenu', 'true')
    window.location.href = '/'
  }
  const handleLogout = () => {
    setShowExitRating(true)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent-200 border-t-accent-500" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

        {/* === FARZAND BOG'LANMAGAN === */}
        {childLinked === false && !searchMode && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-accent-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Link2 className="w-8 h-8 text-accent-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">Farzandingizni bog'lang</h2>
              <p className="text-sm text-gray-500">Farzandingiz natijalarini kuzatish uchun uni toping</p>
            </div>

            {/* Setup da kiritilgan farzandlar */}
            {parentChildren.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Ro'yxatdan o'tishda kiritilgan farzandlar:</p>
                <div className="space-y-2">
                  {parentChildren.map((child, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-accent-50 rounded-xl border border-accent-100">
                      <span className="text-sm font-medium text-accent-700">{i + 1}-farzand: {child.grade}-sinf {child.classLetter || ''}</span>
                      <button onClick={() => { setSearchMode(true); setSearchGrade(child.grade) }}
                        className="text-xs bg-accent-500 text-white px-3 py-1.5 rounded-lg font-medium">
                        Topish
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => setSearchMode(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-accent-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-accent-600 transition">
              <Search className="w-5 h-5" /> Farzandni qidirish
            </button>
          </div>
        )}

        {/* === FARZAND QIDIRISH (ism + sinf) === */}
        {searchMode && (
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Farzandni qidirish</h2>
            <p className="text-xs text-gray-500 mb-3">Farzandingiz ismini kiriting</p>

            <div className="space-y-2 mb-3">
              <input
                type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Farzand ismi (masalan: Ali)"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400"
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <div className="flex gap-2">
                <select value={searchGrade} onChange={e => setSearchGrade(Number(e.target.value))}
                  className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white">
                  <option value={0}>Barcha sinflar</option>
                  {Array.from({ length: 11 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}-sinf</option>)}
                </select>
                <button onClick={handleSearch}
                  className="px-5 py-2.5 bg-accent-500 text-white rounded-xl hover:bg-accent-600 transition font-medium text-sm">
                  Qidirish
                </button>
              </div>
            </div>

            {searchError && <p className="text-sm text-danger-500 mb-3">{searchError}</p>}

            {/* Qidiruv natijalari (ro'yxat) */}
            {searchResults.length > 0 && !linkStatus && (
              <div className="space-y-2 mb-3">
                <p className="text-xs text-gray-500">{searchResults.length} ta o'quvchi topildi:</p>
                {searchResults.map(s => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-200 rounded-full flex items-center justify-center">
                        <GraduationCap className="w-4 h-4 text-blue-700" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{s.full_name}</p>
                        <p className="text-[11px] text-gray-500">{s.grade}-sinf {s.class_letter || ''} {s.maktab ? `| ${s.maktab}` : ''}</p>
                      </div>
                    </div>
                    <button onClick={() => handleLink(s)} disabled={linking}
                      className="text-xs bg-accent-500 text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-50">
                      Bog'lash
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Link natijasi */}
            {linkStatus && (
              <div className={`rounded-xl p-4 border mb-3 ${linkStatus.status === 'confirmed' ? 'bg-success-50 border-success-200' : 'bg-accent-50 border-accent-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {linkStatus.status === 'confirmed' ? (
                    <CheckCircle className="w-5 h-5 text-success-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-accent-500" />
                  )}
                  <p className="text-sm font-semibold text-gray-800">
                    {linkStatus.status === 'confirmed' ? 'Muvaffaqiyatli!' : 'So\'rov yuborildi'}
                  </p>
                </div>
                <p className="text-xs text-gray-600">{linkStatus.message}</p>
              </div>
            )}

            <button onClick={() => { setSearchMode(false); setSearchResults([]); setSearchResult(null); setLinkStatus(null); setSearchError('') }}
              className="w-full mt-1 text-sm text-gray-500 hover:text-gray-700">
              Bekor qilish
            </button>
          </div>
        )}

        {/* === FARZAND MA'LUMOTLARI (real) === */}
        {childLinked && childData && (
          <>
            {/* Farzand kartasi */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h2 className="text-base font-semibold text-gray-800 mb-3">Farzandim</h2>
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                <div className="flex items-center gap-3">
                  <img src={childData.child?.gender === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'}
                    alt="" className="w-10 h-10 rounded-full object-cover border-2 border-blue-200" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{childData.child?.full_name}</p>
                    <p className="text-xs text-gray-500">{childData.child?.grade}-sinf | {childData.child?.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${
                    childData.stats?.avg_score >= 80 ? 'text-success-500' : childData.stats?.avg_score >= 60 ? 'text-accent-500' : 'text-danger-500'
                  }`}>{childData.stats?.avg_score || 0}%</span>
                  <p className="text-[10px] text-gray-400">O'rtacha</p>
                </div>
              </div>
            </div>

            {/* Statistika */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                <BookCheck className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">{childData.stats?.total_submissions || 0}</p>
                <p className="text-[10px] text-gray-500">Tekshiruvlar</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                <TrendingUp className="w-5 h-5 text-success-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">{childData.stats?.avg_score || 0}%</p>
                <p className="text-[10px] text-gray-500">O'rtacha ball</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                <AlertCircle className="w-5 h-5 text-accent-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-800">{childData.stats?.weak_topics?.length || 0}</p>
                <p className="text-[10px] text-gray-500">Zaif mavzu</p>
              </div>
            </div>

            {/* Zaif mavzular */}
            {childData.stats?.weak_topics?.length > 0 && (
              <div className="bg-accent-50 rounded-xl p-4 border border-accent-100">
                <p className="text-xs font-semibold text-accent-700 mb-2">Mashq qilish kerak bo'lgan mavzular:</p>
                <div className="flex flex-wrap gap-1">
                  {childData.stats.weak_topics.map((t, i) => (
                    <span key={i} className="text-xs bg-white text-accent-700 px-2 py-1 rounded-full border border-accent-200">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Kasb yo'nalishi */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-purple-500" />
                  <h2 className="text-base font-semibold text-gray-800">Kasb yo'nalishi</h2>
                </div>
                <button onClick={() => {
                  const subj = (childData.child?.subject || '').toLowerCase()
                  let directions = []
                  if (subj.includes('matematik') || subj.includes('algebra')) {
                    directions = [
                      { career_name: "Dasturchi / IT", career_emoji: "💻", match_score: 88, reason: "Matematika kuchli", advice: "Python o'rganishni boshlang" },
                      { career_name: "Muhandis", career_emoji: "⚙️", match_score: 82, reason: "Aniq fanlar yaxshi", advice: "Robototexnika bilan shug'ullaning" },
                    ]
                  } else if (subj.includes('fizika')) {
                    directions = [
                      { career_name: "Muhandis", career_emoji: "⚙️", match_score: 85, reason: "Fizika kuchli", advice: "Laboratoriya tajribalarini ko'paytiring" },
                      { career_name: "Olim", career_emoji: "🔬", match_score: 80, reason: "Ilmiy tafakkur", advice: "Olimpiadalarda qatnashing" },
                    ]
                  } else {
                    directions = [
                      { career_name: "O'qituvchi", career_emoji: "📚", match_score: 80, reason: "Bilim ulashish qobiliyati", advice: "Pedagogika bilan tanishing" },
                      { career_name: "Tadqiqotchi", career_emoji: "🔍", match_score: 75, reason: "Tahliliy tafakkur", advice: "Ilmiy maqolalar o'qing" },
                    ]
                  }
                  setCareerPrediction({
                    career_directions: directions,
                    overall_summary: `${childData.child?.full_name} ${childData.child?.subject} fanida o'z salohiyatini ko'rsatmoqda.`,
                  })
                }}
                  className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition">
                  <RefreshCw className="w-3 h-3" />
                  {careerPrediction ? "Yangilash" : "Aniqlash"}
                </button>
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
                      <div className="mt-2 flex items-start gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-600">{career.advice}</p>
                      </div>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full" style={{ width: `${career.match_score}%` }} />
                      </div>
                    </div>
                  ))}
                  {careerPrediction.overall_summary && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <p className="text-xs text-purple-600">{careerPrediction.overall_summary}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Compass className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">"Aniqlash" tugmasini bosing</p>
                </div>
              )}
            </div>

            {/* Oxirgi tekshiruvlar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-800">Oxirgi tekshiruvlar</h2>
                <button onClick={fetchChildData} className="text-xs text-accent-500 hover:text-accent-700">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              {childData.submissions?.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Hali tekshiruv yo'q</p>
              ) : (
                childData.submissions?.map(sub => (
                  <div key={sub.id} className="p-3 mb-2 rounded-xl border border-gray-100 hover:border-blue-200 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800">{sub.subject}</p>
                        <p className="text-xs text-gray-400">{new Date(sub.created_at).toLocaleString('uz')}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-lg font-black ${
                          sub.score >= 80 ? 'text-success-500' : sub.score >= 60 ? 'text-accent-500' : 'text-danger-500'
                        }`}>{sub.score}%</span>
                        <p className="text-[10px] text-gray-400">{sub.correct_count}/{sub.total_problems} to'g'ri</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
      {showExitRating && <RatingModal onClose={() => { setShowExitRating(false); doExit() }} />}
    </div>
  )
}
