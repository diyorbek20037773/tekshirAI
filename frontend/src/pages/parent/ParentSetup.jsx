import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ArrowLeft, CheckCircle, Search, Loader2 } from 'lucide-react'
import WheelPicker from '../../components/WheelPicker'

const GRADE_ITEMS = Array.from({ length: 11 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}-sinf`,
}))

export default function ParentSetup() {
  const navigate = useNavigate()
  const [childGrade, setChildGrade] = useState(5)
  const [childUsername, setChildUsername] = useState('')
  const [foundChild, setFoundChild] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [searching, setSearching] = useState(false)
  const [linking, setLinking] = useState(false)
  const [linked, setLinked] = useState(false)
  const [error, setError] = useState('')

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  const parentName = tgUser?.first_name || 'Ota-ona'
  const parentUsername = tgUser?.username || ''
  const telegramId = tgUser?.id || 0

  const searchChild = async () => {
    if (!childUsername.trim()) return
    setSearching(true)
    setFoundChild(null)
    setNotFound(false)
    setError('')

    try {
      const cleaned = childUsername.replace('@', '').trim()
      const res = await fetch(`/api/users/search?username=${encodeURIComponent(cleaned)}`)
      const data = await res.json()

      if (res.ok) {
        setFoundChild(data)
      } else {
        setNotFound(true)
      }
    } catch (err) {
      setError('Server bilan bog\'lanib bo\'lmadi')
    }
    setSearching(false)
  }

  const confirmChild = async () => {
    setLinking(true)
    setError('')

    try {
      // Avval ota-onani ro'yxatdan o'tkazish
      const regRes = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramId,
          username: parentUsername,
          full_name: parentName,
          role: 'parent',
        }),
      })
      const regData = await regRes.json()

      if (!regRes.ok) {
        setError(regData.detail || 'Ro\'yxatdan o\'tishda xatolik')
        setLinking(false)
        return
      }

      // Farzandga bog'lanish so'rovi
      const linkRes = await fetch('/api/users/link-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_telegram_id: telegramId,
          child_username: childUsername.replace('@', '').trim(),
        }),
      })
      const linkData = await linkRes.json()

      if (!linkRes.ok) {
        setError(linkData.detail || 'Bog\'lashda xatolik')
        setLinking(false)
        return
      }

      setLinked(true)
      localStorage.setItem('parentName', parentName)
      localStorage.setItem('childName', foundChild.full_name)
      localStorage.setItem('childUsername', foundChild.username)
      localStorage.setItem('childGrade', foundChild.grade || childGrade)
      localStorage.setItem('userId', regData.id)
      localStorage.setItem('telegramId', telegramId)

      setTimeout(() => navigate('/parent'), 2000)
    } catch (err) {
      setError('Server bilan bog\'lanib bo\'lmadi')
      setLinking(false)
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
          <div className="w-12 h-12 bg-accent-500 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Ota-ona paneli</h1>
            <p className="text-sm text-gray-500">Farzandingizni bog'lang</p>
          </div>
        </div>

        {!linked ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Farzandingiz nechanchi sinfda?</label>
              <WheelPicker
                items={GRADE_ITEMS}
                selectedValue={childGrade}
                onSelect={setChildGrade}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farzandingizning Telegram username'ini kiriting
              </label>
              <div className="flex gap-2">
                <input
                  type="text" value={childUsername} onChange={e => setChildUsername(e.target.value)}
                  placeholder="@username"
                  className="flex-1 px-4 py-3.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-accent-500 focus:border-transparent outline-none"
                  onKeyDown={e => e.key === 'Enter' && searchChild()}
                />
                <button onClick={searchChild} disabled={!childUsername.trim() || searching}
                  className="px-5 bg-accent-500 text-white rounded-xl font-medium hover:bg-accent-600 transition disabled:opacity-50">
                  {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Farzandingiz avval o'quvchi sifatida ro'yxatdan o'tishi kerak
              </p>
            </div>

            {foundChild && (
              <div className="bg-white rounded-xl p-5 border-2 border-accent-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-xl font-bold text-primary-600">
                    {foundChild.full_name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{foundChild.full_name}</p>
                    <p className="text-sm text-gray-500">@{foundChild.username} {foundChild.grade ? `| ${foundChild.grade}-sinf` : ''}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 text-center mb-3">
                  Bu sizning farzandingizmi?
                </p>
                <button onClick={confirmChild} disabled={linking}
                  className="w-full bg-accent-500 text-white py-3.5 rounded-xl font-semibold hover:bg-accent-600 transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {linking ? <><Loader2 className="w-5 h-5 animate-spin" /> Bog'lanmoqda...</>
                    : <><CheckCircle className="w-5 h-5" /> Ha, tasdiqlash</>}
                </button>
              </div>
            )}

            {notFound && (
              <div className="bg-danger-50 rounded-xl p-4 text-center">
                <p className="text-sm text-danger-600">Bu username bilan o'quvchi topilmadi</p>
                <p className="text-xs text-gray-500 mt-1">Farzandingiz avval o'quvchi sifatida ro'yxatdan o'tishi kerak</p>
              </div>
            )}

            {error && (
              <p className="text-sm text-danger-500 text-center">{error}</p>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">So'rov yuborildi!</h2>
            <p className="text-sm text-gray-500">
              {foundChild.full_name} ga tasdiqlash so'rovi yuborildi.
              Farzandingiz tasdiqlashi kerak.
            </p>
            <p className="text-xs text-gray-400 mt-4">Yo'naltirilmoqda...</p>
          </div>
        )}
      </div>
    </div>
  )
}
