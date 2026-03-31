import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Flame, Trophy, Target, BookCheck, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/client'

export default function StudentProfile() {
  const { id } = useParams()
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const res = await api.get(`/submissions/student/${id}?limit=30`)
      setSubmissions(res.data)
    } catch (err) {
      console.error('Profil yuklashda xato:', err)
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

  // Statistika hisoblash
  const totalSubmissions = submissions.length
  const avgScore = totalSubmissions > 0
    ? (submissions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSubmissions).toFixed(1)
    : 0
  const totalCorrect = submissions.reduce((sum, s) => sum + (s.correct_count || 0), 0)

  // Progress chart uchun ma'lumot
  const chartData = submissions
    .slice()
    .reverse()
    .map((s, i) => ({
      name: `#${i + 1}`,
      ball: s.score || 0,
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/" className="p-2 hover:bg-gray-100 rounded-lg transition">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">O'quvchi profili</h1>
          <p className="text-gray-500">Batafsil statistika</p>
        </div>
      </div>

      {/* Stat kartalar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
            <BookCheck className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Jami tekshiruvlar</p>
            <p className="text-2xl font-bold text-gray-800">{totalSubmissions}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-success-50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-success-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">O'rtacha ball</p>
            <p className="text-2xl font-bold text-gray-800">{avgScore}%</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center">
            <Target className="w-6 h-6 text-accent-500" />
          </div>
          <div>
            <p className="text-sm text-gray-500">To'g'ri masalalar</p>
            <p className="text-2xl font-bold text-gray-800">{totalCorrect}</p>
          </div>
        </div>
      </div>

      {/* Progress grafik */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Progress grafik</h2>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="ball"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Ball (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-gray-400">
            Hali ma'lumot yo'q
          </div>
        )}
      </div>

      {/* Submission tarixi */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tekshiruvlar tarixi</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">#</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Fan</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Ball</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">To'g'ri</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sana</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, i) => (
                <tr key={sub.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{i + 1}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{sub.subject}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-bold ${
                      (sub.score || 0) >= 70 ? 'text-success-500' : (sub.score || 0) >= 50 ? 'text-accent-500' : 'text-danger-500'
                    }`}>
                      {sub.score?.toFixed(0) || 0}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {sub.correct_count || 0}/{sub.total_problems || 0}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {new Date(sub.created_at).toLocaleDateString('uz-UZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {submissions.length === 0 && (
            <div className="text-center text-gray-400 py-8">Hali tekshiruv yo'q</div>
          )}
        </div>
      </div>
    </div>
  )
}
