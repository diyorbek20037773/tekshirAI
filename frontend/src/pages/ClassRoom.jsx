import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, TrendingUp, BookCheck } from 'lucide-react'
import api from '../api/client'

export default function ClassRoom() {
  const { id } = useParams()
  const [classroom, setClassroom] = useState(null)
  const [students, setStudents] = useState([])
  const [stats, setStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [infoRes, statsRes] = await Promise.all([
        api.get(`/classrooms/${id}`),
        api.get(`/classrooms/${id}/stats`),
      ])
      setClassroom(infoRes.data.classroom)
      setStudents(infoRes.data.students)
      setStats(statsRes.data.students)
    } catch (err) {
      console.error('Sinf yuklashda xato:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{classroom?.name}</h1>
          <p className="text-gray-500">{classroom?.subject} | Kod: {classroom?.invite_code}</p>
        </div>
      </div>

      {/* O'quvchilar reytingi */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">O'quvchilar reytingi</h2>
        <div className="space-y-3">
          {stats.map((student, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`
            const scoreColor = student.avg_score >= 70
              ? 'text-success-500'
              : student.avg_score >= 50
              ? 'text-accent-500'
              : 'text-danger-500'

            return (
              <Link
                key={student.id}
                to={`/student/${student.id}`}
                className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xl w-8 text-center">{medal}</span>
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">{student.name}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <BookCheck className="w-3 h-3" />
                      {student.total_submissions} ta tekshiruv
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-bold ${scoreColor}`}>
                    {student.avg_score?.toFixed(0) || 0}%
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3 h-3" />
                    O'rtacha ball
                  </p>
                </div>
              </Link>
            )
          })}

          {stats.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              Hali o'quvchilar yo'q
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
