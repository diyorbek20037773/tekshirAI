import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, GraduationCap, BookOpen, TrendingUp, BarChart3, LogOut, RefreshCw } from 'lucide-react'

export default function DirectorDashboard() {
  const navigate = useNavigate()
  const telegramId = localStorage.getItem('telegramId')
  const directorName = localStorage.getItem('directorName') || 'Direktor'
  const directorMaktab = localStorage.getItem('directorMaktab') || ''

  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submissions, setSubmissions] = useState([])
  const [pendingApproval, setPendingApproval] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Avval profil tekshirish — tasdiqlangan yoki yo'q
      const meRes = await fetch(`/api/users/me?telegram_id=${telegramId}&role=director`)
      if (meRes.ok) {
        const me = await meRes.json()
        if (!me.is_approved) {
          setPendingApproval(true)
          setLoading(false)
          return
        }
      }

      const [statsRes, subsRes] = await Promise.all([
        fetch(`/api/director/stats?telegram_id=${telegramId}`),
        fetch(`/api/director/submissions?telegram_id=${telegramId}&limit=10`),
      ])
      if (statsRes.ok) setStats(await statsRes.json())
      if (subsRes.ok) setSubmissions(await subsRes.json())
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-500" />
    </div>
  )

  if (pendingApproval) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm text-center">
        <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">⏳</span>
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Tasdiqlash kutilmoqda</h1>
        <p className="text-sm text-gray-500 mb-4">
          Sizning direktor so'rovingiz admin tomonidan ko'rib chiqilmoqda.
          Tasdiqlangandan so'ng dashboard ochiladi.
        </p>
        <p className="text-xs text-gray-400">Maktab: {directorMaktab}</p>
        <button onClick={() => { fetchData() }}
          className="mt-4 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition">
          Qayta tekshirish
        </button>
        <button onClick={logout}
          className="mt-2 block w-full text-sm text-gray-400 hover:text-red-500">
          Chiqish
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-4 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-lg font-bold">{directorName}</h1>
            <p className="text-purple-100 text-xs">{directorMaktab}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchData} className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={logout} className="p-2 bg-white/20 rounded-lg hover:bg-white/30">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* KPI cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <GraduationCap className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xl font-bold">{stats.teachers_count}</p>
              <p className="text-[10px] opacity-80">O'qituvchi</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <BookOpen className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xl font-bold">{stats.students_count}</p>
              <p className="text-[10px] opacity-80">O'quvchi</p>
            </div>
            <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center">
              <Users className="w-5 h-5 mx-auto mb-1 opacity-80" />
              <p className="text-xl font-bold">{stats.parents_count}</p>
              <p className="text-[10px] opacity-80">Ota-ona</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 -mt-2">
        {/* Umumiy statistika */}
        {stats && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-purple-500" /> Umumiy ko'rsatkichlar
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Jami tekshiruvlar</p>
                <p className="text-lg font-bold text-purple-700">{stats.total_submissions}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-3">
                <p className="text-xs text-gray-500">Bugungi tekshiruvlar</p>
                <p className="text-lg font-bold text-green-700">{stats.today_submissions}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-500">O'rtacha ball</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-blue-700">{stats.avg_score}%</p>
                  <div className="flex-1 bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.avg_score}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fan bo'yicha statistika */}
        {stats?.fan_stats?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" /> Fan bo'yicha tahlil
            </h2>
            <div className="space-y-2">
              {stats.fan_stats.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-24 shrink-0">{f.fan}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${f.ortacha_ball >= 70 ? 'bg-green-400' : f.ortacha_ball >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                      style={{ width: `${Math.min(f.ortacha_ball, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-700 w-12 text-right">{f.ortacha_ball}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sinf taqsimoti */}
        {stats?.sinf_stats?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Sinf bo'yicha o'quvchilar</h2>
            <div className="flex flex-wrap gap-2">
              {stats.sinf_stats.map((s, i) => (
                <div key={i} className="bg-purple-50 rounded-lg px-3 py-2 text-center">
                  <p className="text-xs text-gray-500">{s.sinf}-sinf</p>
                  <p className="text-sm font-bold text-purple-700">{s.soni}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Oxirgi tekshiruvlar */}
        {submissions.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Oxirgi tekshiruvlar</h2>
            <div className="space-y-2">
              {submissions.map((s, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{s.student_name}</p>
                    <p className="text-[10px] text-gray-400">{s.subject} | {s.student_grade}-sinf</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    s.score >= 80 ? 'bg-green-100 text-green-700' :
                    s.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {s.score}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bo'sh holat */}
        {stats && stats.students_count === 0 && (
          <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
            <p className="text-4xl mb-3">🏫</p>
            <p className="text-sm text-gray-600">Hali hech kim ro'yxatdan o'tmagan</p>
            <p className="text-xs text-gray-400 mt-1">O'qituvchi va o'quvchilar ro'yxatdan o'tgach, statistika shu yerda ko'rinadi</p>
          </div>
        )}
      </div>
    </div>
  )
}
