import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Users, School, TrendingUp, Award, BarChart3 } from 'lucide-react'

export default function TeacherProfile() {
  const name = localStorage.getItem('teacherName') || "O'qituvchi"
  const subject = localStorage.getItem('teacherSubject') || 'Matematika'
  const teacherClass = localStorage.getItem('teacherClass') || '7-A'
  const telegramId = localStorage.getItem('telegramId')

  const [students, setStudents] = useState([])
  const [riskData, setRiskData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/users/students').then(r => r.json()).catch(() => ({ students: [] })),
      fetch('/api/analysis/classroom-risks').then(r => r.json()).catch(() => null),
    ]).then(([studentsData, risksData]) => {
      setStudents(studentsData.students || [])
      setRiskData(risksData)
    }).finally(() => setLoading(false))
  }, [])

  const totalStudents = students.length
  const avgScore = totalStudents > 0
    ? Math.round(students.reduce((a, s) => a + (s.avg_score || 0), 0) / totalStudents)
    : 0
  const greenCount = riskData?.summary?.green_count || 0
  const yellowCount = riskData?.summary?.yellow_count || 0
  const redCount = riskData?.summary?.red_count || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/teacher" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Mening profilim</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Shaxsiy ma'lumotlar */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center gap-4">
            <img src="/avatars/teacher.jpg" alt="Avatar" className="w-20 h-20 rounded-full object-cover border-3 border-white/30 shadow-lg" />
            <div>
              <h2 className="text-xl font-bold">{name}</h2>
              <div className="flex gap-2 mt-1">
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <BookOpen className="w-3 h-3" /> {subject}
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <School className="w-3 h-3" /> {teacherClass} sinf
                </span>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-500 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Statistika */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-blue-500" /> O'quv ko'rsatkichlarim
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-700">{totalStudents}</p>
                  <p className="text-[10px] text-blue-500">O'quvchilarim</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <TrendingUp className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-700">{avgScore}%</p>
                  <p className="text-[10px] text-green-500">O'rtacha ball</p>
                </div>
              </div>
            </div>

            {/* O'quvchilar holati */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" /> O'quvchilar holati
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
                  <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-1"></div>
                  <p className="text-lg font-bold text-green-700">{greenCount}</p>
                  <p className="text-[10px] text-green-600">Zo'r</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg text-center border border-yellow-100">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mx-auto mb-1"></div>
                  <p className="text-lg font-bold text-yellow-700">{yellowCount}</p>
                  <p className="text-[10px] text-yellow-600">O'rtacha</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center border border-red-100">
                  <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-1"></div>
                  <p className="text-lg font-bold text-red-700">{redCount}</p>
                  <p className="text-[10px] text-red-600">Yordam kerak</p>
                </div>
              </div>
            </div>

            {/* Top o'quvchilar */}
            {students.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">Eng yaxshi o'quvchilar</h3>
                <div className="space-y-2">
                  {[...students].sort((a, b) => b.avg_score - a.avg_score).slice(0, 5).map((s, i) => (
                    <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                        <p className="text-sm text-gray-700">{s.full_name}</p>
                      </div>
                      <span className={`text-sm font-bold ${
                        s.avg_score >= 80 ? 'text-green-600' : s.avg_score >= 60 ? 'text-yellow-600' : 'text-red-500'
                      }`}>{s.avg_score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
