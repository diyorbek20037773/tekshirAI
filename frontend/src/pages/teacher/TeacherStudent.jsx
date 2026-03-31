import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Flame, Star, Target, BookCheck } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { STUDENTS, STUDENT_HISTORY, BADGES_CATALOG, LEVELS } from '../../data/synthetic'

export default function TeacherStudent() {
  const { id } = useParams()
  const student = STUDENTS.find(s => s.id === id) || STUDENTS[0]
  const levelInfo = LEVELS.find(l => l.level === student.level) || LEVELS[0]
  const nextLevel = LEVELS.find(l => l.level === student.level + 1)

  const chartData = [...STUDENT_HISTORY].reverse().map((s, i) => ({
    name: s.date.slice(5),
    ball: s.score,
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/teacher" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{student.name}</h1>
            <p className="text-xs text-gray-500">{student.grade}-sinf | @{student.username}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Gamification profil */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{levelInfo.emoji}</span>
              <div>
                <p className="font-bold text-base">{levelInfo.name}</p>
                <p className="text-xs text-primary-100">Level {student.level}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{student.xp}</p>
              <p className="text-xs text-primary-100">XP</p>
            </div>
          </div>
          {/* XP progress bar */}
          {nextLevel && (
            <div>
              <div className="flex justify-between text-xs text-primary-100 mb-1">
                <span>{student.xp} XP</span>
                <span>{nextLevel.xpRequired} XP</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div className="bg-white rounded-full h-2 transition-all"
                  style={{ width: `${Math.min((student.xp / nextLevel.xpRequired) * 100, 100)}%` }} />
              </div>
            </div>
          )}
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-sm"><Flame className="w-4 h-4" />{student.streak} kun streak</span>
            <span className="flex items-center gap-1 text-sm"><Star className="w-4 h-4" />{student.avgScore}% o'rtacha</span>
          </div>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <BookCheck className="w-5 h-5 text-primary-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{STUDENT_HISTORY.length}</p>
            <p className="text-[10px] text-gray-500">Tekshiruvlar</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <Target className="w-5 h-5 text-success-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{student.avgScore}%</p>
            <p className="text-[10px] text-gray-500">O'rtacha</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <Flame className="w-5 h-5 text-orange-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{student.streak}</p>
            <p className="text-[10px] text-gray-500">Streak</p>
          </div>
        </div>

        {/* Nishonlar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Nishonlar ({student.badges.length})</h2>
          <div className="flex flex-wrap gap-2">
            {student.badges.map(badgeId => {
              const badge = BADGES_CATALOG[badgeId]
              return badge ? (
                <div key={badgeId} className="flex items-center gap-1.5 bg-accent-50 px-3 py-1.5 rounded-full">
                  <span className="text-base">{badge.emoji}</span>
                  <span className="text-xs font-medium text-gray-700">{badge.name}</span>
                </div>
              ) : null
            })}
          </div>
        </div>

        {/* Progress grafik */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Progress</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="ball" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} name="Ball" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tekshiruvlar tarixi */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Tarix</h2>
          {STUDENT_HISTORY.map((sub, i) => (
            <div key={sub.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm text-gray-700">{sub.subject}</p>
                <p className="text-xs text-gray-400">{sub.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-primary-500">+{sub.xpEarned} XP</span>
                <span className={`text-sm font-bold ${
                  sub.score >= 80 ? 'text-success-500' : sub.score >= 60 ? 'text-accent-500' : 'text-danger-500'
                }`}>{sub.score}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
