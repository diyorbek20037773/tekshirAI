import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import api from '../../api/client'
import { saveSession } from '../../utils/session'
import BiometricLogin from '../../components/BiometricLogin'

// Brauzer (PWA) uchun kirish sahifasi — username + parol.
export default function BrowserLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!username.trim() || !password) return
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/browser-login', {
        username: username.trim(),
        password,
      })
      saveSession(data.user, data.access_token)
      window.location.replace(`/${data.user.role}`)
    } catch (err) {
      setError(err.response?.data?.detail || "Kirishda xatolik yuz berdi")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Brend */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg mb-3">
            <svg viewBox="0 0 512 512" className="w-9 h-9">
              <path d="M140 268 L226 352 L378 168" fill="none" stroke="#fff" strokeWidth="54"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800">TekshirAI</h1>
          <p className="text-sm text-gray-500">Hisobingizga kiring</p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Foydalanuvchi nomi</label>
            <input
              type="text" value={username} onChange={e => setUsername(e.target.value)}
              autoCapitalize="none" autoCorrect="off" placeholder="username"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Parol</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••" className="w-full px-3 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-danger-500 text-center">{error}</p>}

          <button type="submit" disabled={!username.trim() || !password || loading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Kirilmoqda...</> : 'Kirish'}
          </button>
        </form>

        {/* Biometrika bilan kirish (qo'llab-quvvatlansa ko'rinadi) */}
        <BiometricLogin username={username} onSuccess={(data) => {
          saveSession(data.user, data.access_token)
          window.location.replace(`/${data.user.role}`)
        }} />

        <p className="text-center text-sm text-gray-500 mt-6">
          Hisobingiz yo'qmi?{' '}
          <Link to="/register" className="text-primary-600 font-semibold">Ro'yxatdan o'tish</Link>
        </p>
      </div>
    </div>
  )
}
