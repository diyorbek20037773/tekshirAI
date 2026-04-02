import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function ParentSetup() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  const parentName = tgUser?.first_name || 'Ota-ona'
  const parentUsername = tgUser?.username || ''
  const telegramId = tgUser?.id || 0

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramId,
          username: parentUsername,
          full_name: parentName,
          role: 'parent',
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Xatolik yuz berdi')
        setLoading(false)
        return
      }

      localStorage.setItem('parentName', data.full_name)
      localStorage.setItem('userId', data.id)
      localStorage.setItem('telegramId', telegramId)
      navigate('/parent')
    } catch (err) {
      setError("Server bilan bog'lanib bo'lmadi")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => { localStorage.removeItem('userRole'); navigate('/') }}
          className="flex items-center gap-2 text-gray-500 mb-6 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" /> Orqaga
        </button>

        <div className="flex items-center gap-3 mb-8">
          <img src="/avatars/parent.jpg" alt="Avatar"
            className="w-14 h-14 rounded-full object-cover border-2 border-orange-200 shadow-sm" />
          <div>
            <h1 className="text-xl font-bold text-gray-800">Salom, {parentName}!</h1>
            <p className="text-sm text-gray-500">Ota-ona sifatida kiring</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm mb-5">
          <p className="text-sm text-gray-600 text-center">
            O'quvchilar uyga vazifa natijalarini real vaqtda ko'rasiz
          </p>
        </div>

        {error && (
          <p className="text-sm text-danger-500 text-center mb-4">{error}</p>
        )}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-accent-500 text-white py-4 rounded-xl font-semibold text-base hover:bg-accent-600 transition disabled:opacity-40 flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Yuklanmoqda...</> : 'Boshlash'}
        </button>
      </div>
    </div>
  )
}
