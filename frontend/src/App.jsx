import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import RoleSelect from './pages/RoleSelect'
import TeacherSetup from './pages/teacher/TeacherSetup'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherClass from './pages/teacher/TeacherClass'
import TeacherStudent from './pages/teacher/TeacherStudent'
import StudentSetup from './pages/student/StudentSetup'
import StudentHome from './pages/student/StudentHome'
import StudentProfile from './pages/student/StudentProfile'
import ParentSetup from './pages/parent/ParentSetup'
import ParentDashboard from './pages/parent/ParentDashboard'
import ParentProfile from './pages/parent/ParentProfile'
import TeacherProfile from './pages/teacher/TeacherProfile'
import DirectorSetup from './pages/director/DirectorSetup'
import DirectorDashboard from './pages/director/DirectorDashboard'
import DirectorProfile from './pages/director/DirectorProfile'
import ParentStudentSetup from './pages/parent_student/ParentStudentSetup'

function RoleGuard({ role, children }) {
  const savedRole = localStorage.getItem('userRole')
  // parent_student foydalanuvchisi student va parent sahifalariga kirishi mumkin
  if (savedRole === 'parent_student' && (role === 'student' || role === 'parent')) return children
  if (savedRole !== role) return <Navigate to="/" replace />
  return children
}

function AutoLogin() {
  const navigate = useNavigate()
  const [checked, setChecked] = useState(false)
  const [roles, setRoles] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      // Telegram WebApp dan telegram_id olish
      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
      const telegramId = tgUser?.id || localStorage.getItem('telegramId')

      if (telegramId && telegramId !== '0') {
        try {
          const res = await fetch(`/api/users/roles?telegram_id=${telegramId}`)
          if (res.ok) {
            const data = await res.json()
            if (data.roles && data.roles.length > 0) {
              setRoles(data.roles)

              if (data.roles.length === 1) {
                // Bitta rol — to'g'ridan-to'g'ri dashboardga
                const r = data.roles[0]
                localStorage.setItem('userRole', r.role)
                localStorage.setItem('userId', r.id)
                localStorage.setItem('telegramId', String(telegramId))
                if (r.full_name) localStorage.setItem(`${r.role}Name`, r.full_name)
                if (r.maktab) localStorage.setItem(`${r.role}Maktab`, r.maktab)
                navigate(`/${r.role}`, { replace: true })
                return
              }

              // Agar parent + student bo'lsa — parent_student sifatida kirsin
              const roleSet = new Set(data.roles.map(r => r.role))
              if (roleSet.has('parent') && roleSet.has('student') && data.roles.length === 2) {
                const studentRole = data.roles.find(r => r.role === 'student')
                const parentRole = data.roles.find(r => r.role === 'parent')
                localStorage.setItem('userRole', 'student')
                localStorage.setItem('hasParentRole', 'true')
                localStorage.setItem('userId', studentRole.id)
                localStorage.setItem('telegramId', String(telegramId))
                if (studentRole.full_name) localStorage.setItem('studentName', studentRole.full_name)
                if (parentRole.full_name) localStorage.setItem('parentName', parentRole.full_name)
                navigate('/student', { replace: true })
                return
              }

              // Ko'p rol — tanlash kerak (render da ko'rsatiladi)
              setChecked(true)
              return
            }
          }
        } catch (err) {
          console.error('Auto-login xatolik:', err)
        }
      }

      // Fallback: localStorage tekshirish
      const savedRole = localStorage.getItem('userRole')
      const userId = localStorage.getItem('userId')
      if (savedRole && userId) {
        navigate(`/${savedRole}`, { replace: true })
        return
      }

      setChecked(true)
    }

    checkAuth()
  }, [navigate])

  // Rol tanlash UI (ko'p rolli foydalanuvchilar uchun)
  if (roles && roles.length > 1) {
    const selectRole = (r) => {
      localStorage.setItem('userRole', r.role)
      localStorage.setItem('userId', r.id)
      if (r.full_name) localStorage.setItem(`${r.role}Name`, r.full_name)
      if (r.maktab) localStorage.setItem(`${r.role}Maktab`, r.maktab)
      navigate(`/${r.role}`, { replace: true })
    }

    const roleLabels = {
      student: "O'quvchi",
      teacher: "O'qituvchi",
      parent: 'Ota-ona',
      director: 'Maktab direktori',
    }

    const roleColors = {
      student: 'bg-success-100 text-success-700',
      teacher: 'bg-primary-100 text-primary-700',
      parent: 'bg-accent-100 text-accent-700',
      director: 'bg-purple-100 text-purple-700',
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Qaysi rolda kirasiz?</h1>
            <p className="text-primary-100 text-sm mt-1">Sizda bir nechta rol mavjud</p>
          </div>
          <div className="space-y-3">
            {roles.map((r, i) => (
              <button key={i} onClick={() => selectRole(r)}
                className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
                <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${roleColors[r.role] || 'bg-gray-100 text-gray-700'}`}>
                  {roleLabels[r.role] || r.role}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-gray-800">{r.full_name}</p>
                  <p className="text-xs text-gray-400">{r.maktab || ''}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => { setRoles(null); setChecked(true) }}
            className="w-full mt-4 text-white/70 text-sm hover:text-white">
            Yangi rol qo'shish
          </button>
        </div>
      </div>
    )
  }

  if (!checked) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-500"></div>
    </div>
  )

  return <RoleSelect />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AutoLogin />} />

      {/* O'qituvchi */}
      <Route path="/teacher/setup" element={<TeacherSetup />} />
      <Route path="/teacher" element={<RoleGuard role="teacher"><TeacherDashboard /></RoleGuard>} />
      <Route path="/teacher/profile" element={<RoleGuard role="teacher"><TeacherProfile /></RoleGuard>} />
      <Route path="/teacher/class/:id" element={<RoleGuard role="teacher"><TeacherClass /></RoleGuard>} />
      <Route path="/teacher/student/:id" element={<RoleGuard role="teacher"><TeacherStudent /></RoleGuard>} />

      {/* O'quvchi */}
      <Route path="/student/setup" element={<StudentSetup />} />
      <Route path="/student" element={<RoleGuard role="student"><StudentHome /></RoleGuard>} />
      <Route path="/student/profile" element={<RoleGuard role="student"><StudentProfile /></RoleGuard>} />

      {/* Ota-ona */}
      <Route path="/parent/setup" element={<ParentSetup />} />
      <Route path="/parent" element={<RoleGuard role="parent"><ParentDashboard /></RoleGuard>} />
      <Route path="/parent/profile" element={<RoleGuard role="parent"><ParentProfile /></RoleGuard>} />

      {/* Ota-ona + O'quvchi */}
      <Route path="/parent_student/setup" element={<ParentStudentSetup />} />

      {/* Maktab direktori */}
      <Route path="/director/setup" element={<DirectorSetup />} />
      <Route path="/director" element={<RoleGuard role="director"><DirectorDashboard /></RoleGuard>} />
      <Route path="/director/profile" element={<RoleGuard role="director"><DirectorProfile /></RoleGuard>} />
    </Routes>
  )
}
