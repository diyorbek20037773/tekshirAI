import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, BookCheck, TrendingUp, School, Clock, LogOut, ChevronRight, Compass } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getRandomTeacherQuote } from '../../data/quotes'

// 24 ta sintetik o'quvchi
const SINTETIK_OQUVCHILAR = [
  { id: 's1', name: 'Aziza Karimova', gender: 'female', grade: 7, avgScore: 92, subject: 'Matematika' },
  { id: 's2', name: 'Jasur Toshmatov', gender: 'male', grade: 7, avgScore: 88, subject: 'Matematika' },
  { id: 's3', name: 'Nilufar Rahimova', gender: 'female', grade: 5, avgScore: 85, subject: 'Ona tili' },
  { id: 's4', name: 'Sardor Umarov', gender: 'male', grade: 8, avgScore: 78, subject: 'Fizika' },
  { id: 's5', name: 'Madina Qodirova', gender: 'female', grade: 6, avgScore: 95, subject: 'Biologiya' },
  { id: 's6', name: "Bobur Aliyev", gender: 'male', grade: 9, avgScore: 72, subject: 'Kimyo' },
  { id: 's7', name: 'Gulnora Saidova', gender: 'female', grade: 7, avgScore: 90, subject: 'Ingliz tili' },
  { id: 's8', name: 'Sherzod Mirzayev', gender: 'male', grade: 8, avgScore: 65, subject: 'Matematika' },
  { id: 's9', name: "Dilorom To'rayeva", gender: 'female', grade: 6, avgScore: 88, subject: 'Tarix' },
  { id: 's10', name: 'Nodir Xasanov', gender: 'male', grade: 7, avgScore: 82, subject: 'Informatika' },
  { id: 's11', name: 'Zulfiya Ergasheva', gender: 'female', grade: 5, avgScore: 91, subject: 'Matematika' },
  { id: 's12', name: "Abdulloh Jo'rayev", gender: 'male', grade: 9, avgScore: 55, subject: 'Fizika' },
  { id: 's13', name: "Kamola Ne'matova", gender: 'female', grade: 8, avgScore: 87, subject: 'Biologiya' },
  { id: 's14', name: 'Otabek Raximov', gender: 'male', grade: 7, avgScore: 76, subject: 'Matematika' },
  { id: 's15', name: 'Sevinch Nazarova', gender: 'female', grade: 6, avgScore: 93, subject: 'Ona tili' },
  { id: 's16', name: 'Jamshid Kamolov', gender: 'male', grade: 8, avgScore: 69, subject: 'Kimyo' },
  { id: 's17', name: "Mohira Qo'chqorova", gender: 'female', grade: 7, avgScore: 84, subject: 'Ingliz tili' },
  { id: 's18', name: 'Ulugbek Tursunov', gender: 'male', grade: 9, avgScore: 81, subject: 'Informatika' },
  { id: 's19', name: "Barno Abdullayeva", gender: 'female', grade: 5, avgScore: 96, subject: 'Matematika' },
  { id: 's20', name: 'Dostonbek Salimov', gender: 'male', grade: 6, avgScore: 42, subject: 'Fizika' },
  { id: 's21', name: 'Iroda Mahmudova', gender: 'female', grade: 8, avgScore: 79, subject: 'Tarix' },
  { id: 's22', name: "Firdavs O'rinov", gender: 'male', grade: 7, avgScore: 86, subject: 'Matematika' },
  { id: 's23', name: 'Sabina Xolmatova', gender: 'female', grade: 6, avgScore: 74, subject: 'Biologiya' },
  { id: 's24', name: 'Asilbek Normatov', gender: 'male', grade: 9, avgScore: 61, subject: 'Kimyo' },
]

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

  const [realStudents, setRealStudents] = useState([])
  const [riskData, setRiskData] = useState(null)
  const [recentSubs, setRecentSubs] = useState([])
  const [topicErrors, setTopicErrors] = useState([])
  const [globalStats, setGlobalStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/users/students').then(r => r.json()).catch(() => ({ students: [] })),
      fetch('/api/analysis/classroom-risks').then(r => r.json()).catch(() => null),
      fetch('/api/dashboard/recent-all?limit=10').then(r => r.json()).catch(() => []),
      fetch('/api/dashboard/topic-errors-all').then(r => r.json()).catch(() => []),
      fetch('/api/dashboard/stats-all').then(r => r.json()).catch(() => null),
    ]).then(([studentsData, risksData, recent, errors, stats]) => {
      setRealStudents(studentsData.students || [])
      setRiskData(risksData)
      setRecentSubs(recent)
      setTopicErrors(errors)
      setGlobalStats(stats)
    }).finally(() => setLoading(false))
  }, [])

  // Sintetik + real o'quvchilar birlashtirish
  const allStudents = [
    ...realStudents.map(s => ({
      id: s.id,
      name: s.full_name,
      gender: s.gender || 'male',
      grade: s.grade,
      avgScore: s.avg_score,
      subject: s.subject,
      submissions: s.submission_count,
      isReal: true,
      telegram_id: s.telegram_id,
    })),
    ...SINTETIK_OQUVCHILAR.map(s => ({ ...s, isReal: false })),
  ]

  const totalStudents = allStudents.length
  const avgScore = globalStats?.avg_score || (totalStudents > 0 ? Math.round(allStudents.reduce((a, s) => a + s.avgScore, 0) / totalStudents) : 0)
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
            <p className="text-xs text-gray-500">O'qituvchi paneli</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/teacher/profile">
              <img src="/avatars/teacher.jpg" alt="Profil" className="w-9 h-9 rounded-full object-cover border-2 border-gray-200" />
            </Link>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
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
          <StatCard icon={BookCheck} title="Bugun" value={`${globalStats?.today_submissions || 0} tekshiruv`} color="green" />
          <StatCard icon={TrendingUp} title="O'rtacha ball" value={`${avgScore}%`} color="yellow" />
          <StatCard icon={School} title="Real" value={`${realStudents.length} o'quvchi`} color="purple" />
        </div>

        {/* === RISK MANAGEMENT === */}
        {riskData && (riskData.green?.length > 0 || riskData.yellow?.length > 0 || riskData.red?.length > 0) && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-800">Real o'quvchilar tahlili</h2>
            {riskData.green?.length > 0 && (
              <div className="bg-success-50 rounded-xl p-4 border border-success-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-success-500 rounded-full" />
                  <p className="text-sm font-semibold text-success-800">Zo'r ({riskData.green.length})</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {riskData.green.map(s => (
                    <Link key={s.telegram_id} to={`/teacher/student/${s.telegram_id}`}
                      className="bg-white px-3 py-1.5 rounded-lg text-xs hover:shadow transition">
                      <span className="font-medium text-gray-700">{s.name}</span>
                      <span className="text-success-600 ml-1 font-bold">{s.avg_score}%</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {riskData.yellow?.length > 0 && (
              <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-accent-500 rounded-full" />
                  <p className="text-sm font-semibold text-accent-800">O'rtacha ({riskData.yellow.length})</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {riskData.yellow.map(s => (
                    <Link key={s.telegram_id} to={`/teacher/student/${s.telegram_id}`}
                      className="bg-white px-3 py-1.5 rounded-lg text-xs hover:shadow transition">
                      <span className="font-medium text-gray-700">{s.name}</span>
                      <span className="text-accent-600 ml-1 font-bold">{s.avg_score}%</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {riskData.red?.length > 0 && (
              <div className="bg-danger-50 rounded-xl p-4 border border-danger-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-danger-500 rounded-full" />
                  <p className="text-sm font-semibold text-danger-800">Yordam kerak ({riskData.red.length})</p>
                </div>
                <div className="space-y-2">
                  {riskData.red.map(s => (
                    <Link key={s.telegram_id} to={`/teacher/student/${s.telegram_id}`}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-lg hover:shadow transition">
                      <span className="text-sm font-medium text-gray-700">{s.name}</span>
                      <span className="text-sm font-bold text-danger-500">{s.avg_score}%</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Barcha o'quvchilar (sintetik + real) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">O'quvchilar ({allStudents.length})</h2>
          <div className="space-y-2">
            {allStudents.sort((a, b) => b.avgScore - a.avgScore).map(s => (
              <div key={s.id}
                className={`flex items-center justify-between p-2.5 rounded-lg border transition ${
                  s.isReal ? 'border-blue-200 bg-blue-50/30 hover:bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
                }`}>
                <div className="flex items-center gap-2">
                  <img src={s.gender === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'}
                    alt="" className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {s.name} {s.isReal && <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full ml-1">REAL</span>}
                    </p>
                    <p className="text-[10px] text-gray-400">{s.grade}-sinf | {s.subject}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${
                  s.avgScore >= 80 ? 'text-success-500' : s.avgScore >= 60 ? 'text-accent-500' : 'text-danger-500'
                }`}>{s.avgScore}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Oxirgi tekshiruvlar (real) */}
        {recentSubs.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Oxirgi tekshiruvlar (real)</h2>
            <div className="space-y-2">
              {recentSubs.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <img src={sub.student_gender === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'}
                      alt="" className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{sub.student_name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(sub.created_at).toLocaleString('uz')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-bold ${
                      sub.score >= 80 ? 'text-success-500' : sub.score >= 60 ? 'text-accent-500' : 'text-danger-500'
                    }`}>{sub.score}%</span>
                    <p className="text-xs text-gray-400">{sub.correct_count}/{sub.total_problems}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mavzu xatolari (real) */}
        {topicErrors.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Mavzu bo'yicha xatolar (real)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topicErrors}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Xatolar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Kasb moyilliklari */}
        {allStudents.filter(s => s.avgScore >= 70).length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-5 h-5 text-purple-500" />
              <h2 className="text-base font-semibold text-gray-800">Kasb moyilliklari</h2>
            </div>
            <div className="space-y-2">
              {allStudents.filter(s => s.avgScore >= 70).slice(0, 5).map(s => {
                const subj = (s.subject || '').toLowerCase()
                let career = { emoji: '📚', name: "Turli yo'nalishlar" }
                if (subj.includes('matematik') || subj.includes('algebra')) career = { emoji: '💻', name: 'IT / Muhandislik' }
                else if (subj.includes('fizika')) career = { emoji: '⚙️', name: 'Muhandis' }
                else if (subj.includes('biolog') || subj.includes('kimyo')) career = { emoji: '🔬', name: 'Shifokor / Olim' }
                else if (subj.includes('ona tili')) career = { emoji: '✍️', name: 'Jurnalist' }
                else if (subj.includes('ingliz')) career = { emoji: '🌍', name: 'Tarjimon' }
                else if (subj.includes('tarix')) career = { emoji: '⚖️', name: 'Huquqshunos' }
                else if (subj.includes('informatika')) career = { emoji: '💻', name: 'Dasturchi' }
                return (
                  <div key={s.id} className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{career.emoji}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{s.name}</p>
                        <p className="text-[10px] text-purple-500">{career.name}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-success-50 text-success-600 px-2 py-1 rounded-full">{s.avgScore}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
