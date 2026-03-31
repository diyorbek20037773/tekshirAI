import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, BookCheck, TrendingUp, School, Clock, LogOut, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { STUDENTS, SUBMISSIONS, TOPIC_ERRORS, CLASSROOMS } from '../../data/synthetic'

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

  const todaySubs = SUBMISSIONS.filter(s => s.date === '2026-03-29')

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
        {/* Stat kartalar */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Users} title="O'quvchilar" value={STUDENTS.length} color="blue" />
          <StatCard icon={BookCheck} title="Bugun" value={`${todaySubs.length} tekshiruv`} color="green" />
          <StatCard icon={TrendingUp} title="O'rtacha ball" value="83.3%" color="yellow" />
          <StatCard icon={School} title="Sinflar" value={CLASSROOMS.length} color="purple" />
        </div>

        {/* Sinflar ro'yxati */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Sinflar</h2>
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

        {/* Mavzu xatolari chart */}
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

        {/* Oxirgi tekshiruvlar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Oxirgi tekshiruvlar</h2>
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
