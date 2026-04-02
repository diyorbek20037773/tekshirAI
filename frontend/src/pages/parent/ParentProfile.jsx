import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Heart, BookCheck, TrendingUp, AlertCircle, Shield, Bell } from 'lucide-react'

export default function ParentProfile() {
  const parentName = localStorage.getItem('parentName') || 'Ota-ona'
  const telegramId = localStorage.getItem('telegramId')
  const childName = localStorage.getItem('childName')
  const childUsername = localStorage.getItem('childUsername')
  const childGrade = localStorage.getItem('childGrade')

  const [childData, setChildData] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (telegramId && telegramId !== '0') {
      fetch(`/api/users/child-data?parent_telegram_id=${telegramId}`)
        .then(r => r.json())
        .then(data => {
          if (data?.linked) {
            setChildData(data)
            if (data.child?.telegram_id) {
              fetch(`/api/analysis/student/${data.child.telegram_id}`)
                .then(r => r.json())
                .then(a => { if (a.total_submissions > 0) setAnalysis(a) })
                .catch(() => {})
            }
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false))
      return
    }
    setLoading(false)
  }, [telegramId])

  const child = childData?.child
  const stats = childData?.stats

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/parent" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Mening profilim</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Ota-ona ma'lumotlari */}
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-4">
            <img src="/avatars/parent.jpg" alt="Avatar" className="w-20 h-20 rounded-full object-cover border-3 border-white/30 shadow-lg" />
            <div>
              <h2 className="text-xl font-bold">{parentName}</h2>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Ota-ona</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-accent-200 border-t-accent-500 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Farzand ma'lumotlari */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500" /> Farzandim
              </h3>
              {child || childName ? (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {(child?.full_name || childName || '?')[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{child?.full_name || childName}</p>
                      {(child?.username || childUsername) && (
                        <p className="text-xs text-gray-500">@{child?.username || childUsername}</p>
                      )}
                      <p className="text-xs text-blue-600">{child?.grade || childGrade || '?'}-sinf</p>
                    </div>
                  </div>

                  {/* Farzand statistikasi */}
                  {stats && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="bg-white rounded-lg p-2 text-center">
                        <BookCheck className="w-4 h-4 text-blue-500 mx-auto mb-0.5" />
                        <p className="text-sm font-bold text-gray-800">{stats.total_submissions}</p>
                        <p className="text-[9px] text-gray-500">Tekshiruvlar</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-0.5" />
                        <p className="text-sm font-bold text-gray-800">{stats.avg_score}%</p>
                        <p className="text-[9px] text-gray-500">O'rtacha</p>
                      </div>
                      <div className="bg-white rounded-lg p-2 text-center">
                        <AlertCircle className="w-4 h-4 text-orange-500 mx-auto mb-0.5" />
                        <p className="text-sm font-bold text-gray-800">{stats.weak_topics?.length || 0}</p>
                        <p className="text-[9px] text-gray-500">Zaif mavzu</p>
                      </div>
                    </div>
                  )}

                  {/* Risk level */}
                  {analysis && (
                    <div className={`mt-3 p-2 rounded-lg text-center ${
                      analysis.risk_level === 'green' ? 'bg-green-50 border border-green-200' :
                      analysis.risk_level === 'yellow' ? 'bg-yellow-50 border border-yellow-200' :
                      'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`text-xs font-medium ${
                        analysis.risk_level === 'green' ? 'text-green-700' :
                        analysis.risk_level === 'yellow' ? 'text-yellow-700' : 'text-red-700'
                      }`}>
                        {analysis.risk_level === 'green' ? '🟢' : analysis.risk_level === 'yellow' ? '🟡' : '🔴'} {analysis.risk_label}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Heart className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">Farzandingiz hali bog'lanmagan</p>
                  <p className="text-[10px] text-gray-400 mt-1">Telegram botda /connect buyrug'ini yuboring</p>
                </div>
              )}
            </div>

            {/* Bildirishnomalar */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-500" /> Bildirishnomalar
              </h3>
              <p className="text-xs text-gray-500">
                Farzandingiz har bir vazifani tekshirganda Telegram orqali natija yuboriladi.
              </p>
              <div className="mt-2 flex items-center gap-2 bg-green-50 p-2 rounded-lg">
                <Shield className="w-4 h-4 text-green-500" />
                <p className="text-xs text-green-600">Avtomatik bildirishnomalar yoqilgan</p>
              </div>
            </div>

            {/* Telegram bot havolasi */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Foydali buyruqlar</h3>
              <div className="space-y-1.5">
                <p className="text-xs text-gray-600"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-primary-600">/connect</code> — Farzandni bog'lash</p>
                <p className="text-xs text-gray-600"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-primary-600">/myid</code> — Telegram ID ni bilish</p>
                <p className="text-xs text-gray-600"><code className="bg-gray-100 px-1.5 py-0.5 rounded text-primary-600">/stats</code> — Farzand statistikasi</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
