import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut } from 'lucide-react'

export default function DirectorProfile() {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.clear()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => navigate('/director')}
          className="flex items-center gap-2 text-gray-500 mb-4 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" /> Dashboard
        </button>

        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl">🏫</span>
          </div>
          <h2 className="text-lg font-bold text-gray-800">{localStorage.getItem('directorName') || 'Direktor'}</h2>
          <p className="text-sm text-gray-500">{localStorage.getItem('directorMaktab') || ''}</p>
          <p className="text-xs text-gray-400 mt-1">Maktab direktori</p>
        </div>

        <button onClick={logout}
          className="w-full mt-4 bg-red-50 text-red-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-100">
          <LogOut className="w-5 h-5" /> Chiqish
        </button>
      </div>
    </div>
  )
}
