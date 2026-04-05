import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, MapPin, UserPlus } from 'lucide-react'
import WheelPicker from '../../components/WheelPicker'

const GRADE_ITEMS = Array.from({ length: 11 }, (_, i) => ({ value: i + 1, label: `${i + 1}-sinf` }))
const SUBJECT_ITEMS = [
  'Ona tili', 'Ingliz tili', 'Matematika', 'Algebra', 'Geometriya',
  'Fizika', 'Kimyo', 'Biologiya', 'Tabiatshunoslik', 'Informatika',
].map(s => ({ value: s, label: s }))

export default function ParentSetup() {
  const navigate = useNavigate()
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  const telegramId = tgUser?.id || 0
  const parentUsername = tgUser?.username || ''

  const [firstName, setFirstName] = useState(tgUser?.first_name || '')
  const [lastName, setLastName] = useState(tgUser?.last_name || '')

  // Geolokatsiya
  const [viloyatlar, setViloyatlar] = useState([])
  const [tumanlar, setTumanlar] = useState([])
  const [selectedViloyat, setSelectedViloyat] = useState('')
  const [selectedTuman, setSelectedTuman] = useState('')
  const [selectedMaktab, setSelectedMaktab] = useState('')
  const [grade, setGrade] = useState(5)
  const [subject, setSubject] = useState('')
  const [geoLoading, setGeoLoading] = useState(true)
  const [geoStatus, setGeoStatus] = useState('Joylashuv aniqlanmoqda...')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/geo/viloyatlar').then(r => r.json()).then(setViloyatlar).catch(() => {})
  }, [])

  useEffect(() => {
    if (!navigator.geolocation) { setGeoStatus("Qo'llab-quvvatlanmaydi"); setGeoLoading(false); return }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const r = await fetch(`/api/geo/detect?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`)
          const data = await r.json()
          if (data.found) {
            setSelectedViloyat(data.viloyat); setSelectedTuman(data.tuman)
            setGeoStatus(`${data.tuman}, ${data.viloyat}`)
          } else { setGeoStatus("Aniqlanmadi — qo'lda tanlang") }
        } catch { setGeoStatus("Xatolik — qo'lda tanlang") }
        setGeoLoading(false)
      },
      () => { setGeoStatus("Ruxsat berilmadi — qo'lda tanlang"); setGeoLoading(false) },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
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
          telegram_id: telegramId, username: parentUsername, full_name: fullName,
          role: 'parent',
          viloyat: selectedViloyat, tuman: selectedTuman, maktab: selectedMaktab,
          grade, subject,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail || 'Xatolik'); setLoading(false); return }

      localStorage.setItem('parentName', data.full_name)
      localStorage.setItem('parentMaktab', selectedMaktab)
      localStorage.setItem('parentViloyat', selectedViloyat)
      localStorage.setItem('parentTuman', selectedTuman)
      localStorage.setItem('userId', data.id)
      localStorage.setItem('telegramId', data.telegram_id)
      navigate('/parent')
    } catch (err) {
      setError("Server bilan bog'lanib bo'lmadi"); setLoading(false)
    }
  }

  const isReady = firstName.trim() && selectedMaktab && subject

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => { localStorage.removeItem('userRole'); navigate('/') }}
          className="flex items-center gap-2 text-gray-500 mb-4 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" /> Orqaga
        </button>

        <div className="flex items-center gap-3 mb-4">
          <img src="/avatars/parent.jpg" alt="Avatar"
            className="w-14 h-14 rounded-full object-cover border-2 border-orange-200 shadow-sm" />
          <div>
            <h1 className="text-lg font-bold text-gray-800">Ota-ona</h1>
            <p className="text-xs text-gray-500">{parentUsername ? `@${parentUsername}` : "Ro'yxatdan o'tish"}</p>
          </div>
        </div>

        <div className="space-y-3">
          {/* Ism va Familya */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ismingiz</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Ism" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Familiyangiz</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Familiya" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400" />
            </div>
          </div>

          {/* Geolokatsiya */}
          <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
            <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
            <p className="text-xs text-blue-600">{geoLoading ? <span className="animate-pulse">{geoStatus}</span> : geoStatus}</p>
          </div>

          {/* Viloyat */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Viloyat</label>
            <select value={selectedViloyat} onChange={e => { setSelectedViloyat(e.target.value); setSelectedTuman(''); setSelectedMaktab('') }}
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-accent-400">
              <option value="">Tanlang...</option>
              {viloyatlar.map(v => <option key={v.kod} value={v.nom}>{v.nom}</option>)}
            </select>
          </div>

          {selectedViloyat && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tuman</label>
              <select value={selectedTuman} onChange={e => { setSelectedTuman(e.target.value); setSelectedMaktab('') }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-accent-400">
                <option value="">Tanlang...</option>
                {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          {/* Maktab */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Farzandingiz maktabi</label>
            <input type="text" value={selectedMaktab} onChange={e => setSelectedMaktab(e.target.value)}
              placeholder="Farzandingiz maktabini kiriting"
              className="w-full px-3 py-2.5 rounded-xl border border-accent-400 text-sm focus:outline-none focus:border-accent-400 focus:ring-1 focus:ring-accent-400" />
          </div>

          {/* Sinf va Fan */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sinf</label>
              <WheelPicker items={GRADE_ITEMS} selectedValue={grade} onSelect={setGrade} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fan</label>
              <WheelPicker items={SUBJECT_ITEMS} selectedValue={subject} onSelect={setSubject} />
            </div>
          </div>

          {error && <p className="text-sm text-danger-500 text-center">{error}</p>}

          <button onClick={handleSubmit} disabled={!isReady || loading}
            className="w-full bg-accent-500 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-accent-600 transition disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Yuklanmoqda...</> : 'Boshlash'}
          </button>
        </div>
      </div>
    </div>
  )
}
