import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, MapPin, UserPlus, X } from 'lucide-react'
import WheelPicker from '../../components/WheelPicker'

const GRADE_ITEMS = Array.from({ length: 11 }, (_, i) => ({ value: i + 1, label: `${i + 1}-sinf` }))

const CLASS_LETTER_ITEMS = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'F', label: 'F' },
]

export default function ParentSetup() {
  const navigate = useNavigate()
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  if (tgUser?.id) localStorage.setItem('telegramId', String(tgUser.id))
  const telegramId = tgUser?.id || Number(localStorage.getItem('telegramId')) || 0
  const parentUsername = tgUser?.username || ''

  const [firstName, setFirstName] = useState(tgUser?.first_name || '')
  const [lastName, setLastName] = useState(tgUser?.last_name || '')

  // Farzandlar ro'yxati
  const [children, setChildren] = useState([{ grade: 5, classLetter: 'A' }])

  // Geolokatsiya
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

  const addChild = () => {
    setChildren([...children, { grade: 5, classLetter: 'A' }])
  }

  const removeChild = (index) => {
    if (children.length <= 1) return
    setChildren(children.filter((_, i) => i !== index))
  }

  const updateChild = (index, field, value) => {
    const updated = [...children]
    updated[index] = { ...updated[index], [field]: value }
    setChildren(updated)
  }

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
          grade: children[0].grade,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.detail || 'Xatolik'); setLoading(false); return }

      localStorage.setItem('parentName', data.full_name)
      localStorage.setItem('parentMaktab', selectedMaktab)
      localStorage.setItem('parentViloyat', selectedViloyat)
      localStorage.setItem('parentTuman', selectedTuman)
      localStorage.setItem('parentChildren', JSON.stringify(children))
      localStorage.setItem('userId', data.id)
      localStorage.setItem('telegramId', data.telegram_id)
      navigate('/parent')
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
          {(geoLoading || geoStatus) && (
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-100">
              <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
              <p className="text-xs text-blue-600">{geoLoading ? <span className="animate-pulse">{geoStatus}</span> : geoStatus}</p>
            </div>
          )}

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
            <select value={selectedMaktab} onChange={e => setSelectedMaktab(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-accent-400 text-sm bg-white focus:outline-none focus:border-accent-400">
              <option value="">Maktab raqamini tanlang...</option>
              {Array.from({ length: 100 }, (_, i) => i + 1).map(n => (
                <option key={n} value={`${n}-sonli maktab`}>{n}-sonli maktab</option>
              ))}
            </select>
          </div>

          {/* Farzandlar — ixcham ro'yxat */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Farzandlaringiz</label>
            {/* Qo'shilgan farzandlar — ixcham chips */}
            {children.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {children.map((child, index) => (
                  <div key={index} className="inline-flex items-center gap-1.5 bg-accent-50 border border-accent-200 rounded-full px-3 py-1.5">
                    <span className="text-xs font-medium text-accent-700">{index + 1}-farzand: {child.grade}-sinf {child.classLetter}</span>
                    {children.length > 1 && (
                      <button onClick={() => removeChild(index)} className="text-accent-400 hover:text-danger-500">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* Farzand sinf/harf tanlash — faqat oxirgi qo'shilgan */}
            <div className="bg-white rounded-xl border border-gray-200 p-3">
              <p className="text-xs font-semibold text-gray-700 mb-2">{children.length}-farzand sinfi</p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Sinf</label>
                  <WheelPicker items={GRADE_ITEMS} selectedValue={children[children.length - 1].grade} onSelect={v => updateChild(children.length - 1, 'grade', v)} />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-500 mb-1">Harf</label>
                  <WheelPicker items={CLASS_LETTER_ITEMS} selectedValue={children[children.length - 1].classLetter} onSelect={v => updateChild(children.length - 1, 'classLetter', v)} />
                </div>
              </div>
            </div>
            <button onClick={addChild}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded-xl border-2 border-dashed border-accent-300 text-accent-600 text-xs font-medium hover:bg-accent-50 transition">
              <UserPlus className="w-3.5 h-3.5" /> Yana farzand qo'shish
            </button>
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
