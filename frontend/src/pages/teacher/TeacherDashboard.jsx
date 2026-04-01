import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, BookCheck, TrendingUp, School, Clock, LogOut, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { SUBMISSIONS, TOPIC_ERRORS, CLASSROOMS } from '../../data/synthetic'
import { getRandomTeacherQuote } from '../../data/quotes'

function StatCard({ icon: Icon, title, value, color }) {
  const colors = {
    blue: 'bg-primary-50 text-primary-500',
    green: 'bg-success-50 text-success-500',
    yellow: 'bg-accent-50 text-accent-600',
    purple: 'bg-purple-50 text-purple-500',
  }
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const teacherName = localStorage.getItem('teacherName') || "O'qituvchi"
  const teacherSubject = localStorage.getItem('teacherSubject') || 'Matematika'
  const teacherClass = localStorage.getItem('teacherClass') || '7-A'

  const [realStudents, setRealStudents] = useState([])
  const [riskData, setRiskData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/users/students').then(r => r.json()),
      fetch('/api/analysis/classroom-risks').then(r => r.json()),
    ])
      .then(([studentsData, risksData]) => {
        setRealStudents(studentsData.students || [])
        setRiskData(risksData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const todaySubs = SUBMISSIONS.filter(s => s.date === '2026-03-29')
  const totalStudents = realStudents.length
  const [teacherQuote] = useState(() => getRandomTeacherQuote())

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Salom, {teacherName.split(' ')[0]}!</h1>
            <p className="text-xs text-gray-500">{teacherSubject} | {teacherClass} sinf</p>
          </div>
          <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-5">
        {/* Hikmatli so'z */}
        <div className="bg-primary-50 rounded-xl px-4 py-3 border border-primary-100">
          <p className="text-xs text-primary-700 italic">"{teacherQuote.text}"</p>
          {teacherQuote.author && <p className="text-[10px] text-primary-400 mt-0.5">— {teacherQuote.author}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Users} title="O'quvchilar" value={totalStudents} color="blue" />
          <StatCard icon={BookCheck} title="Bugun" value={`${todaySubs.length} tekshiruv`} color="green" />
          <StatCard icon={TrendingUp} title="O'rtacha ball"
            value={totalStudents > 0 ? `${Math.round(realStudents.reduce((a, s) => a + s.avg_score, 0) / totalStudents)}%` : '—'}
            color="yellow" />
          <StatCard icon={School} title="Sinflar" value={CLASSROOMS.length} color="purple" />
        </div>

        {/* === RISK MANAGEMENT — 3 GURUH === */}
        {riskData && (riskData.green?.length > 0 || riskData.yellow?.length > 0 || riskData.red?.length > 0) && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-800">O'quvchilar tahlili</h2>

            {/* YASHIL — zo'r */}
            {riskData.green?.length > 0 && (
              <div className="bg-success-50 rounded-xl p-4 border border-success-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-success-500 rounded-full" />
                  <p className="text-sm font-semibold text-success-800">
                    Zo'r o'zlashtirayotgan ({riskData.green.length})
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {riskData.green.map(s => (
                    <Link key={s.telegram_id} to={`/teacher/student/${s.telegram_id}`}
                      className="bg-white px-3 py-1.5 rounded-lg text-xs hover:shadow transition">
                      <span className="font-medium text-gray-700">{s.name}</span>
                      <span className="text-success-600 ml-1 font-bold">{s.avg_score}%</span>
                    </Link>
                  ))}
                </div>
                <p className="text-xs text-success-700">💡 {riskData.summary?.green_advice}</p>
              </div>
            )}

            {/* SARIQ — o'rtacha */}
            {riskData.yellow?.length > 0 && (
              <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-accent-500 rounded-full" />
                  <p className="text-sm font-semibold text-accent-800">
                    O'rtacha ({riskData.yellow.length})
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                  {riskData.yellow.map(s => (
                    <Link key={s.telegram_id} to={`/teacher/student/${s.telegram_id}`}
                      className="bg-white px-3 py-1.5 rounded-lg text-xs hover:shadow transition">
                      <span className="font-medium text-gray-700">{s.name}</span>
                      <span className="text-accent-600 ml-1 font-bold">{s.avg_score}%</span>
                      {s.weak_topics?.length > 0 && (
                        <span className="text-gray-400 ml-1">({s.weak_topics[0]})</span>
                      )}
                    </Link>
                  ))}
                </div>
                <p className="text-xs text-accent-700">💡 {riskData.summary?.yellow_advice}</p>
              </div>
            )}

            {/* QIZIL — yordam kerak */}
            {riskData.red?.length > 0 && (
              <div className="bg-danger-50 rounded-xl p-4 border border-danger-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-danger-500 rounded-full" />
                  <p className="text-sm font-semibold text-danger-800">
                    Qo'shimcha tayyorlik kerak ({riskData.red.length})
                  </p>
                </div>
                <div className="space-y-2 mb-2">
                  {riskData.red.map(s => (
                    <Link key={s.telegram_id} to={`/teacher/student/${s.telegram_id}`}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-lg hover:shadow transition">
                      <div>
                        <span className="text-sm font-medium text-gray-700">{s.name}</span>
                        {s.weak_topics?.length > 0 && (
                          <p className="text-[10px] text-danger-500">Zaif: {s.weak_topics.join(', ')}</p>
                        )}
                      </div>
                      <span className="text-sm font-bold text-danger-500">{s.avg_score}%</span>
                    </Link>
                  ))}
                </div>
                <p className="text-xs text-danger-700">⚠️ {riskData.summary?.red_advice}</p>
              </div>
            )}
          </div>
        )}

        {/* Real o'quvchilar */}
        {realStudents.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-3">O'quvchilar</h2>
            <div className="space-y-2">
              {realStudents.map(s => (
                <Link key={s.id} to={`/teacher/student/${s.telegram_id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100">
                  <div>
                    <p className="font-medium text-gray-700">{s.full_name}</p>
                    <p className="text-xs text-gray-400">
                      {s.grade ? `${s.grade}-sinf` : ''} {s.subject ? `| ${s.subject}` : ''} | {s.submission_count} vazifa
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      s.avg_score >= 80 ? 'text-success-500' : s.avg_score >= 60 ? 'text-accent-500' : 'text-danger-500'
                    }`}>
                      {s.avg_score > 0 ? `${s.avg_score}%` : '—'}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Demo sinflar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Sinflar (demo)</h2>
          <div className="space-y-2">
            {CLASSROOMS.map(c => (
              <Link key={c.id} to={`/teacher/class/${c.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100">
                <div>
                  <p className="font-medium text-gray-700">{c.name}</p>
                  <p className="text-xs text-gray-400">{c.subject} | {c.studentCount} o'quvchi</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-bold ${c.avgScore >= 80 ? 'text-success-500' : 'text-accent-500'}`}>
                    {c.avgScore}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Mavzu xatolari */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Mavzu bo'yicha xatolar</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={TOPIC_ERRORS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Xatolar" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Oxirgi tekshiruvlar (demo) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Oxirgi tekshiruvlar (demo)</h2>
          <div className="space-y-2">
            {SUBMISSIONS.slice(0, 6).map(sub => (
              <div key={sub.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-700">{sub.studentName}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {sub.date} {sub.time}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-base font-bold ${
                    sub.score >= 80 ? 'text-success-500' : sub.score >= 60 ? 'text-accent-500' : 'text-danger-500'
                  }`}>{sub.score}%</span>
                  <p className="text-xs text-gray-400">{sub.correctCount}/{sub.totalProblems}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
