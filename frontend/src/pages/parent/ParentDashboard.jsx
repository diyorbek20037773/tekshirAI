import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, TrendingUp, BookCheck, AlertCircle } from 'lucide-react'
import { STUDENT_HISTORY } from '../../data/synthetic'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const parentName = localStorage.getItem('parentName') || 'Ota-ona'
  const telegramId = localStorage.getItem('telegramId')

  const [childData, setChildData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!telegramId || telegramId === '0') {
      setLoading(false)
      return
    }
    fetch(`/api/users/child-data?parent_telegram_id=${telegramId}`)
      .then(r => r.json())
      .then(data => setChildData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [telegramId])

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
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">

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

            {childData.stats.weak_topics.length > 0 && (
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
