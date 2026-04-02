import { Routes, Route, Navigate } from 'react-router-dom'
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

function RoleGuard({ role, children }) {
  const savedRole = localStorage.getItem('userRole')
  if (savedRole !== role) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />

      {/* O'qituvchi */}
      <Route path="/teacher/setup" element={<RoleGuard role="teacher"><TeacherSetup /></RoleGuard>} />
      <Route path="/teacher" element={<RoleGuard role="teacher"><TeacherDashboard /></RoleGuard>} />
      <Route path="/teacher/profile" element={<RoleGuard role="teacher"><TeacherProfile /></RoleGuard>} />
      <Route path="/teacher/class/:id" element={<RoleGuard role="teacher"><TeacherClass /></RoleGuard>} />
      <Route path="/teacher/student/:id" element={<RoleGuard role="teacher"><TeacherStudent /></RoleGuard>} />

      {/* O'quvchi */}
      <Route path="/student/setup" element={<RoleGuard role="student"><StudentSetup /></RoleGuard>} />
      <Route path="/student" element={<RoleGuard role="student"><StudentHome /></RoleGuard>} />
      <Route path="/student/profile" element={<RoleGuard role="student"><StudentProfile /></RoleGuard>} />

      {/* Ota-ona */}
      <Route path="/parent/setup" element={<RoleGuard role="parent"><ParentSetup /></RoleGuard>} />
      <Route path="/parent" element={<RoleGuard role="parent"><ParentDashboard /></RoleGuard>} />
      <Route path="/parent/profile" element={<RoleGuard role="parent"><ParentProfile /></RoleGuard>} />
    </Routes>
  )
}
