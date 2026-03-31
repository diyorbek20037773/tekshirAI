import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, BookCheck, TrendingUp, School, Clock } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../api/client'

function StatCard({ icon: Icon, title, value, color, subtitle }) {
  const colorClasses = {
    blue: 'bg-primary-50 text-primary-500',
    green: 'bg-success-50 text-success-500',
    yellow: 'bg-accent-50 text-accent-500',
    purple: 'bg-purple-50 text-purple-500',
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null)
  const [recent, setRecent] = useState([])
  const [topicErrors, setTopicErrors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [overviewRes, recentRes, errorsRes] = await Promise.all([
        api.get('/dashboard/overview'),
        api.get('/dashboard/recent'),
        api.get('/dashboard/topic-errors'),
      ])
      setOverview(overviewRes.data)
      setRecent(recentRes.data)
      setTopicErrors(errorsRes.data)
    } catch (err) {
      console.error('Dashboard yuklashda xato:', err)
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
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 mt-1">Umumiy statistika</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          title="Jami o'quvchilar"
          value={overview?.total_students || 0}
          color="blue"
        />
        <StatCard
          icon={BookCheck}
          title="Bugungi tekshiruvlar"
          value={overview?.today_submissions || 0}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          title="O'rtacha ball"
          value={`${overview?.avg_score || 0}%`}
          color="yellow"
        />
        <StatCard
          icon={School}
          title="Sinflar soni"
          value={overview?.total_classrooms || 0}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mavzu bo'yicha xatolar chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Mavzu bo'yicha xatolar</h2>
          {topicErrors.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicErrors}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="topic" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Xatolar soni" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              Hali ma'lumot yo'q
            </div>
          )}
        </div>

        {/* Oxirgi submissionlar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Oxirgi tekshiruvlar</h2>
          <div className="overflow-y-auto max-h-[300px] space-y-3">
            {recent.length > 0 ? (
              recent.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-gray-700">{sub.student_name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{sub.subject}</span>
                      <span className="text-xs text-gray-300">|</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(sub.created_at).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg font-bold ${
                      sub.score >= 70 ? 'text-success-500' : sub.score >= 50 ? 'text-accent-500' : 'text-danger-500'
                    }`}>
                      {sub.score?.toFixed(0) || 0}%
                    </span>
                    <p className="text-xs text-gray-400">
                      {sub.correct_count}/{sub.total_problems}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-8">Hali tekshiruv yo'q</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
