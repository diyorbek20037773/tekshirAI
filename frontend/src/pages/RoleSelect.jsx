import { useNavigate } from 'react-router-dom'
import { GraduationCap, BookOpen, Users, Building2 } from 'lucide-react'

export default function RoleSelect() {
  const navigate = useNavigate()

  const selectRole = (role) => {
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
        <div className="space-y-4">
          <p className="text-center text-white/80 text-sm mb-2">Kim sifatida kirmoqchisiz?</p>

          {/* O'qituvchi */}
          <button
            onClick={() => selectRole('teacher')}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-7 h-7 text-primary-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800">O'qituvchi</h3>
              <p className="text-sm text-gray-500">Sinf va o'quvchilarni boshqarish, statistika</p>
            </div>
          </button>

          {/* O'quvchi */}
          <button
            onClick={() => selectRole('student')}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-14 h-14 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-7 h-7 text-success-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800">O'quvchi</h3>
              <p className="text-sm text-gray-500">Vazifani suratga olib tekshirish, AI bilan suhbat</p>
            </div>
          </button>

          {/* Ota-ona */}
          <button
            onClick={() => selectRole('parent')}
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="w-14 h-14 bg-accent-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7 text-accent-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800">Ota-ona</h3>
              <p className="text-sm text-gray-500">Farzandingiz natijalarini kuzating</p>
            </div>
          </button>

          {/* Xalq ta'limi vazirligi */}
          <a
            href="https://tekshiraixalqtalimistatusi-production.up.railway.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-white rounded-2xl p-5 flex items-center gap-4 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] block"
          >
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-800">Xalq ta'limi vazirligi</h3>
              <p className="text-sm text-gray-500">Umumiy ta'lim tizimi monitoringi</p>
            </div>
          </a>
        </div>

        <p className="text-center text-white/50 text-xs mt-8">
          Termiz Milliy AI Hackathon 2026
        </p>
      </div>
    </div>
  )
}
