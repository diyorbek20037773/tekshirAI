import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, BookCheck, Target, AlertCircle } from 'lucide-react'
import { STUDENTS, STUDENT_HISTORY, BADGES_CATALOG, LEVELS } from '../../data/synthetic'

export default function TeacherStudent() {
  const { id } = useParams()

  // Synthetic data (demo uchun)
  const demoStudent = STUDENTS.find(s => s.id === id)

  // Real data
  const [realData, setRealData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // id raqam bo'lsa — real telegram_id, aks holda demo
    if (!isNaN(id) && Number(id) > 100) {
      fetch(`/api/users/student/${id}/submissions`)
        .then(r => r.json())
        .then(data => setRealData(data))
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [id])

  // Demo student view
  if (demoStudent && !realData) {
    const levelInfo = LEVELS.find(l => l.level === demoStudent.level) || LEVELS[0]
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <Link to="/teacher" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-800">{demoStudent.name}</h1>
              <p className="text-xs text-gray-500">{demoStudent.grade}-sinf | @{demoStudent.username}</p>
            </div>
          </div>
        </div>
        <div className="max-w-lg mx-auto p-4 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className="text-lg font-bold text-gray-800">{STUDENT_HISTORY.length}</p>
              <p className="text-[10px] text-gray-500">Tekshiruvlar</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className="text-lg font-bold text-success-600">{demoStudent.avgScore}%</p>
              <p className="text-[10px] text-gray-500">O'rtacha</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
              <p className="text-lg font-bold text-orange-500">{demoStudent.streak}</p>
              <p className="text-[10px] text-gray-500">Streak</p>
            </div>
          </div>
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

  // Real student view
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-500"></div>
      </div>
    )
  }

  if (!realData) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Link to="/teacher" className="text-primary-500">← Orqaga</Link>
        <p className="mt-4 text-gray-500">O'quvchi topilmadi</p>
      </div>
    )
  }

  const { student, submissions } = realData
  const avgScore = submissions.length > 0
    ? Math.round(submissions.reduce((a, s) => a + (s.score || 0), 0) / submissions.length)
    : 0

  // Zaif mavzular yig'ish
  const weakTopics = new Set()
  submissions.forEach(s => {
    if (s.ai_result?.weak_topics) {
      s.ai_result.weak_topics.forEach(t => weakTopics.add(t))
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/teacher" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{student.full_name}</h1>
            <p className="text-xs text-gray-500">
              {student.grade ? `${student.grade}-sinf` : ''} {student.username ? `| @${student.username}` : ''}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <BookCheck className="w-5 h-5 text-primary-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{submissions.length}</p>
            <p className="text-[10px] text-gray-500">Tekshiruvlar</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <Target className="w-5 h-5 text-success-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{avgScore}%</p>
            <p className="text-[10px] text-gray-500">O'rtacha</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
            <AlertCircle className="w-5 h-5 text-accent-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-gray-800">{weakTopics.size}</p>
            <p className="text-[10px] text-gray-500">Zaif mavzu</p>
          </div>
        </div>

        {weakTopics.size > 0 && (
          <div className="bg-accent-50 rounded-xl p-3 border border-accent-200">
            <p className="text-xs font-medium text-accent-700">
              ⚠️ Zaif mavzular: {[...weakTopics].join(', ')}
            </p>
          </div>
        )}

        {/* Submissionlar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Tekshiruvlar</h2>
          {submissions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Hali tekshiruv yo'q</p>
          ) : (
            submissions.map(sub => (
              <div key={sub.id} className="py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{sub.subject}</p>
                    <p className="text-xs text-gray-400">
                      {sub.created_at ? new Date(sub.created_at).toLocaleString('uz') : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${
                      sub.score >= 80 ? 'text-success-500' : sub.score >= 60 ? 'text-accent-500' : 'text-danger-500'
                    }`}>{sub.score}%</span>
                    <p className="text-xs text-gray-400">{sub.correct_count}/{sub.total_problems}</p>
                  </div>
                </div>

                {/* AI natija — masalalar */}
                {sub.ai_result?.problems && (
                  <div className="space-y-1 mt-2">
                    {sub.ai_result.problems.map((p, i) => (
                      <div key={i} className={`text-xs px-2 py-1 rounded ${
                        p.is_correct ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'
                      }`}>
                        {p.is_correct ? '✅' : '❌'} {p.number}-masala: {p.problem_text?.slice(0, 60)}
                        {!p.is_correct && p.error_explanation && (
                          <span className="block text-danger-600 mt-0.5">💡 {p.error_explanation}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {sub.ai_result?.recommendation && (
                  <p className="text-xs text-primary-600 mt-2">📌 {sub.ai_result.recommendation}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
