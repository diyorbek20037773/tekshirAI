import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, TrendingUp, BookCheck, Flame } from 'lucide-react'
import { STUDENTS, CLASSROOMS } from '../../data/synthetic'

export default function TeacherClass() {
  const { id } = useParams()
  const classroom = CLASSROOMS.find(c => c.id === id) || CLASSROOMS[0]

  const sorted = [...STUDENTS].sort((a, b) => b.avgScore - a.avgScore)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/teacher" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{classroom.name}</h1>
            <p className="text-xs text-gray-500">{classroom.subject} | Kod: {classroom.inviteCode}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-3">
        {/* Sinf statistikasi */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500">O'quvchilar</p>
            <p className="text-xl font-bold text-primary-500">{classroom.studentCount}</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500">O'rtacha</p>
            <p className="text-xl font-bold text-success-500">{classroom.avgScore}%</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <p className="text-xs text-gray-500">Bugun</p>
            <p className="text-xl font-bold text-accent-500">{classroom.todaySubmissions}</p>
          </div>
        </div>

        {/* O'quvchilar reytingi */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">O'quvchilar reytingi</h2>
          <div className="space-y-2">
            {sorted.map((student, i) => {
              const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`
              return (
                <Link key={student.id} to={`/teacher/student/${student.id}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition border border-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="text-lg w-8 text-center">{medal}</span>
                    <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{student.name}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="flex items-center gap-0.5"><Flame className="w-3 h-3 text-orange-400" />{student.streak}</span>
                        <span>Lv.{student.level}</span>
                        <span>{student.xp} XP</span>
                      </div>
                    </div>
                  </div>
                  <span className={`text-base font-bold ${
                    student.avgScore >= 80 ? 'text-success-500' : student.avgScore >= 60 ? 'text-accent-500' : 'text-danger-500'
                  }`}>{student.avgScore}%</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
