import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, MapPin } from 'lucide-react'
import WheelPicker from '../../components/WheelPicker'

const SUBJECT_ITEMS = [
  'Ona tili', 'Ingliz tili', 'Matematika', 'Algebra', 'Geometriya',
  'Fizika', 'Kimyo', 'Biologiya', 'Tabiatshunoslik', 'Informatika',
].map(s => ({ value: s, label: s }))

export default function DirectorSetup() {
  const navigate = useNavigate()
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  if (tgUser?.id) localStorage.setItem('telegramId', String(tgUser.id))
  const telegramId = tgUser?.id || Number(localStorage.getItem('telegramId')) || 0
  const userUsername = tgUser?.username || ''

  const [firstName, setFirstName] = useState(tgUser?.first_name || '')
  const [lastName, setLastName] = useState(tgUser?.last_name || '')
  const [subject, setSubject] = useState('')

  const [viloyatlar, setViloyatlar] = useState([])
  const [tumanlar, setTumanlar] = useState([])
  const [selectedViloyat, setSelectedViloyat] = useState('')
  const [selectedTuman, setSelectedTuman] = useState('')
  const [selectedMaktab, setSelectedMaktab] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoStatus, setGeoStatus] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/geo/viloyatlar').then(r => r.json()).then(setViloyatlar).catch(() => {})
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) return
    setGeoLoading(true); setGeoStatus('Joylashuv aniqlanmoqda...')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords
          if (accuracy > 1000) { setGeoStatus("GPS aniqlik past — qo'lda tanlang"); setGeoLoading(false); return }
          const r = await fetch(`/api/geo/detect?lat=${latitude}&lng=${longitude}`)
          const data = await r.json()
          if (data.found) {
            setSelectedViloyat(data.viloyat); setSelectedTuman(data.tuman)
            setGeoStatus(`${data.tuman}, ${data.viloyat}`)
          } else { setGeoStatus("Aniqlanmadi — qo'lda tanlang") }
        } catch { setGeoStatus("Xatolik — qo'lda tanlang") }
        setGeoLoading(false)
      },
      () => { setGeoStatus(''); setGeoLoading(false) },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }, [])

  useEffect(() => {
    if (!selectedViloyat) { setTumanlar([]); return }
    fetch(`/api/geo/tumanlar?viloyat=${encodeURIComponent(selectedViloyat)}`)
      .then(r => r.json()).then(setTumanlar).catch(() => setTumanlar([]))
  }, [selectedViloyat])

  const handleSubmit = async () => {
    if (!firstName.trim() || !selectedMaktab) return
    setLoading(true); setError('')
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramId, username: userUsername, full_name: fullName,
          role: 'director', subject,
          viloyat: selectedViloyat, tuman: selectedTuman, maktab: selectedMaktab,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail || 'Xatolik'); setLoading(false); return }

      localStorage.setItem('directorName', data.full_name)
      localStorage.setItem('directorMaktab', selectedMaktab)
      localStorage.setItem('userId', data.id)
      localStorage.setItem('telegramId', data.telegram_id)
      navigate('/director')
    } catch (err) {
      setError("Server bilan bog'lanib bo'lmadi"); setLoading(false)
    }
  }

  const isReady = firstName.trim() && selectedMaktab

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => { localStorage.removeItem('userRole'); navigate('/') }}
          className="flex items-center gap-2 text-gray-500 mb-4 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" /> Orqaga
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center border-2 border-purple-200">
            <span className="text-2xl">🏫</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Maktab direktori</h1>
            <p className="text-xs text-gray-500">{userUsername ? `@${userUsername}` : "Ro'yxatdan o'tish"}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ismingiz</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Ism" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Familiyangiz</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Familiya" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400" />
            </div>
          </div>

          {(geoLoading || geoStatus) && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-600">{geoLoading ? <span className="animate-pulse">{geoStatus}</span> : geoStatus}</p>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Viloyat</label>
            <select value={selectedViloyat} onChange={e => { setSelectedViloyat(e.target.value); setSelectedTuman(''); setSelectedMaktab('') }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-purple-400">
              <option value="">Tanlang...</option>
              {viloyatlar.map(v => <option key={v.kod} value={v.nom}>{v.nom}</option>)}
            </select>
          </div>

          {selectedViloyat && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tuman</label>
              <select value={selectedTuman} onChange={e => { setSelectedTuman(e.target.value); setSelectedMaktab('') }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-purple-400">
                <option value="">Tanlang...</option>
                {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Maktab</label>
            {selectedTuman ? (
              <select value={selectedMaktab} onChange={e => setSelectedMaktab(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-purple-400">
                <option value="">Maktab raqamini tanlang...</option>
                {Array.from({ length: 100 }, (_, i) => i + 1).map(n => (
                  <option key={n} value={`${n}-sonli maktab`}>{n}-sonli maktab</option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-gray-400 italic px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200">
                Avval Viloyat va Tumanni tanlang
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Mutaxassislik</label>
            <WheelPicker items={SUBJECT_ITEMS} selectedValue={subject} onSelect={setSubject} visibleItems={3} itemHeight={40} />
          </div>

          {error && <p className="text-sm text-danger-500 text-center">{error}</p>}

          <button onClick={handleSubmit} disabled={!isReady || loading}
            className="w-full bg-purple-500 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-purple-600 transition disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Yuklanmoqda...</> : 'Boshlash'}
          </button>
        </div>
      </div>
    </div>
  )
}
