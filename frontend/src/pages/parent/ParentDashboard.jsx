import { useNavigate } from 'react-router-dom'
import { LogOut, Flame, Star, Target, TrendingUp, BookCheck, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { STUDENTS, STUDENT_HISTORY, BADGES_CATALOG, LEVELS } from '../../data/synthetic'

export default function ParentDashboard() {
  const navigate = useNavigate()
  const childId = localStorage.getItem('childId') || '1'
  const childName = localStorage.getItem('childName') || 'Aziz Toshmatov'
  const parentName = localStorage.getItem('parentName') || 'Ota-ona'

  const child = STUDENTS.find(s => s.id === childId) || STUDENTS[0]
  const levelInfo = LEVELS.find(l => l.level === child.level) || LEVELS[0]

  const chartData = [...STUDENT_HISTORY].reverse().map(s => ({
    name: s.date.slice(5),
    ball: s.score,
  }))

  // Kuchli va zaif tomonlar
  const avgScore = child.avgScore
  const strongTopics = avgScore >= 80 ? ['Tenglamalar', 'Arifmetika'] : ['Arifmetika']
  const weakTopics = avgScore < 90 ? ['Kasrlar', 'Foizlar'] : ['Kasrlar']

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-4 py-5 text-white">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-accent-100">Ota-ona paneli</p>
              <h1 className="text-lg font-bold">{childName}</h1>
              <p className="text-xs text-accent-100">{child.grade}-sinf | {child.subject}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-white/70 hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Bugungi hisobot */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Bugungi hisobot</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-success-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-success-600">{child.avgScore}%</p>
              <p className="text-xs text-gray-500 mt-1">O'rtacha ball</p>
            </div>
            <div className="bg-primary-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary-600">{STUDENT_HISTORY.length}</p>
              <p className="text-xs text-gray-500 mt-1">Tekshiruvlar</p>
            </div>
          </div>

          {/* Xulosa */}
          <div className={`mt-3 p-3 rounded-xl ${avgScore >= 80 ? 'bg-success-50' : avgScore >= 60 ? 'bg-accent-50' : 'bg-danger-50'}`}>
            <p className="text-sm">
              {avgScore >= 80 ? (
                <span className="text-success-700">👍 Farzandingiz yaxshi tayyorlanmoqda! Davom etsin.</span>
              ) : avgScore >= 60 ? (
                <span className="text-accent-700">💪 O'rtacha natija. Bir oz ko'proq mashq qilish tavsiya etiladi.</span>
              ) : (
                <span className="text-danger-700">📚 Natija past. Farzandingizga yordam bering yoki repetitor oling.</span>
              )}
            </p>
          </div>
        </div>

        {/* Gamification holati */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{levelInfo.emoji}</span>
              <div>
                <p className="font-bold">{levelInfo.name} (Lv.{child.level})</p>
                <p className="text-xs text-primary-100">{child.xp} XP</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex items-center gap-1 text-sm"><Flame className="w-4 h-4" />{child.streak}</span>
              <span className="flex items-center gap-1 text-sm"><Star className="w-4 h-4" />{child.badges.length}</span>
            </div>
          </div>
        </div>

        {/* Kuchli va zaif tomonlar */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-xs font-semibold text-success-600 mb-2 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Kuchli tomonlari
            </h3>
            {strongTopics.map(t => (
              <p key={t} className="text-sm text-gray-700 py-0.5">✅ {t}</p>
            ))}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-xs font-semibold text-danger-600 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Zaif tomonlari
            </h3>
            {weakTopics.map(t => (
              <p key={t} className="text-sm text-gray-700 py-0.5">⚠️ {t}</p>
            ))}
          </div>
        </div>

        {/* Progress grafik */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Progress grafik</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="ball" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} name="Ball" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Nishonlar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Farzandingiz nishonlari</h2>
          <div className="flex flex-wrap gap-2">
            {child.badges.map(id => {
              const b = BADGES_CATALOG[id]
              return b ? (
                <div key={id} className="flex items-center gap-1.5 bg-accent-50 px-3 py-1.5 rounded-full">
                  <span>{b.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">{b.name}</span>
                </div>
              ) : null
            })}
          </div>
        </div>

        {/* Tekshiruvlar tarixi */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Tekshiruvlar tarixi</h2>
          {STUDENT_HISTORY.map(sub => (
            <div key={sub.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm text-gray-700">{sub.subject}</p>
                <p className="text-xs text-gray-400">{sub.date}</p>
              </div>
              <div className="text-right">
                <span className={`text-sm font-bold ${
                  sub.score >= 80 ? 'text-success-500' : sub.score >= 60 ? 'text-accent-500' : 'text-danger-500'
                }`}>{sub.score}%</span>
                <p className="text-xs text-gray-400">{sub.correctCount}/{sub.totalProblems}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tavsiya */}
        <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
          <p className="text-sm text-primary-800">
            💡 <strong>Tavsiya:</strong> Farzandingizga kasrlar mavzusida qo'shimcha mashq bering.
            Kunlik streak ni davom ettirishga rag'batlantiring — bu motivatsiyani oshiradi!
          </p>
        </div>
      </div>
    </div>
  )
}
