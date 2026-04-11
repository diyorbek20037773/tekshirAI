import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, Users, Building2, UserPlus, Shield } from 'lucide-react'

export default function RoleSelect() {
  const navigate = useNavigate()

  // Orqaga — Telegram ga qaytish
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg?.BackButton) {
      tg.BackButton.show()
      const handler = () => tg.close()
      tg.BackButton.onClick(handler)
      return () => { tg.BackButton.offClick(handler); tg.BackButton.hide() }
    }
  }, [])

  const selectRole = (role) => {
    sessionStorage.removeItem('loggedOut')
    if (role === 'admin') {
      window.open('/admin', '_blank')
      return
    }
    localStorage.setItem('userRole', role)
    navigate(`/${role}/setup`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">TekshirAI</h1>
          <p className="text-primary-100 mt-2">AI asosida uyga vazifa tekshiruvchi</p>
        </div>

        {/* Rol tanlash */}
        <div className="space-y-3">
          <p className="text-center text-white/80 text-sm mb-2">Kim sifatida kirmoqchisiz?</p>

          {/* O'qituvchi */}
          <button
            onClick={() => selectRole('teacher')}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-gray-800">O'qituvchi</h3>
              <p className="text-xs text-gray-500">Sinf va o'quvchilarni boshqarish</p>
            </div>
          </button>

          {/* O'quvchi */}
          <button
            onClick={() => selectRole('student')}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-6 h-6 text-success-600" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-gray-800">O'quvchi</h3>
              <p className="text-xs text-gray-500">Vazifani tekshirish, AI bilan suhbat</p>
            </div>
          </button>

          {/* Ota-ona */}
          <button
            onClick={() => selectRole('parent')}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-accent-600" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-gray-800">Ota-ona</h3>
              <p className="text-xs text-gray-500">Farzandingiz natijalarini kuzating</p>
            </div>
          </button>

          {/* Ota-ona va O'quvchi */}
          <button
            onClick={() => selectRole('parent_student')}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <UserPlus className="w-6 h-6 text-teal-600" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-gray-800">Ota-ona va O'quvchi</h3>
              <p className="text-xs text-gray-500">Bitta akkauntda ikki rol</p>
            </div>
          </button>

          {/* Maktab direktori */}
          <button
            onClick={() => selectRole('director')}
            className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-gray-800">Maktab direktori</h3>
              <p className="text-xs text-gray-500">Maktab statistikasi va monitoring</p>
            </div>
          </button>

          {/* Admin */}
          <button
            onClick={() => selectRole('admin')}
            className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h3 className="text-base font-semibold text-white">Admin panel</h3>
              <p className="text-xs text-white/60">Platformani boshqarish</p>
            </div>
          </button>
        </div>

        <p className="text-center text-white/50 text-xs mt-6">
          TekshirAI 2026
        </p>
      </div>
    </div>
  )
}
