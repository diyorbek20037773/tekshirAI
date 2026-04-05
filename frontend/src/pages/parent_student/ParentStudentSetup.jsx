import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2, MapPin } from 'lucide-react'
import WheelPicker from '../../components/WheelPicker'
import { GRADE_SUBJECTS } from '../../data/gradeSubjects'

const GRADE_ITEMS = Array.from({ length: 11 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}-sinf`,
}))

const GENDER_ITEMS = [
  { value: 'male', label: "O'g'il bola" },
  { value: 'female', label: 'Qiz bola' },
]

export default function ParentStudentSetup() {
  const navigate = useNavigate()
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  const telegramId = tgUser?.id || 0
  const userUsername = tgUser?.username || ''

  const [firstName, setFirstName] = useState(tgUser?.first_name || '')
  const [lastName, setLastName] = useState(tgUser?.last_name || '')
  const [gender, setGender] = useState('male')
  const [grade, setGrade] = useState(5)
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

  const subjectItems = useMemo(() => {
    return (GRADE_SUBJECTS[grade] || []).map(s => ({ value: s, label: s }))
  }, [grade])

  const handleSubmit = async () => {
    if (!firstName.trim() || !subject || !grade || !selectedMaktab) return
    setLoading(true); setError('')
    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

    try {
      // 1) Parent ro'yxatdan o'tish
      const parentRes = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramId, username: userUsername, full_name: fullName,
          role: 'parent', gender, grade, subject,
          viloyat: selectedViloyat, tuman: selectedTuman, maktab: selectedMaktab,
        }),
      })
      if (!parentRes.ok) {
        const d = await parentRes.json()
        setError(d.detail || 'Xatolik'); setLoading(false); return
      }

      // 2) Student ro'yxatdan o'tish
      const studentRes = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramId, username: userUsername, full_name: fullName,
          role: 'student', gender, grade, subject,
          viloyat: selectedViloyat, tuman: selectedTuman, maktab: selectedMaktab,
        }),
      })
      const studentData = await studentRes.json()
      if (!studentRes.ok) { setError(studentData.detail || 'Xatolik'); setLoading(false); return }

      localStorage.setItem('studentName', studentData.full_name)
      localStorage.setItem('studentGrade', grade)
      localStorage.setItem('studentSubject', subject)
      localStorage.setItem('studentGender', gender)
      localStorage.setItem('studentMaktab', selectedMaktab)
      localStorage.setItem('userId', studentData.id)
      localStorage.setItem('telegramId', studentData.telegram_id)
      localStorage.setItem('userRole', 'student')  // Default to student view
      localStorage.setItem('hasParentRole', 'true')
      navigate('/student')
    } catch (err) {
      setError("Server bilan bog'lanib bo'lmadi"); setLoading(false)
    }
  }

  const isReady = firstName.trim() && subject && grade && selectedMaktab

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => { localStorage.removeItem('userRole'); navigate('/') }}
          className="flex items-center gap-2 text-gray-500 mb-4 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" /> Orqaga
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center border-2 border-teal-200">
            <span className="text-2xl">👨‍👧</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Ota-ona + O'quvchi</h1>
            <p className="text-xs text-gray-500">Bitta akkauntda ikki rol</p>
          </div>
        </div>

        <div className="bg-teal-50 rounded-xl p-3 mb-3 border border-teal-100">
          <p className="text-xs text-teal-700">Siz ham ota-ona, ham o'quvchi sifatida ro'yxatdan o'tasiz. Keyinchalik rollar o'rtasida almashishingiz mumkin.</p>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ismingiz</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                placeholder="Ism" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Familiyangiz</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                placeholder="Familiya" className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Jinsingiz</label>
            <WheelPicker items={GENDER_ITEMS} selectedValue={gender} onSelect={setGender} visibleItems={3} itemHeight={40} />
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
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-teal-400">
              <option value="">Tanlang...</option>
              {viloyatlar.map(v => <option key={v.kod} value={v.nom}>{v.nom}</option>)}
            </select>
          </div>

          {selectedViloyat && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tuman</label>
              <select value={selectedTuman} onChange={e => { setSelectedTuman(e.target.value); setSelectedMaktab('') }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-teal-400">
                <option value="">Tanlang...</option>
                {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          )}

          {selectedTuman && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Maktab</label>
              <input type="text" value={selectedMaktab} onChange={e => setSelectedMaktab(e.target.value)}
                placeholder="Maktab nomini kiriting"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sinf</label>
              <WheelPicker items={GRADE_ITEMS} selectedValue={grade} onSelect={g => { setGrade(g); setSubject('') }} visibleItems={3} itemHeight={40} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fan</label>
              <WheelPicker items={subjectItems} selectedValue={subject} onSelect={setSubject} visibleItems={3} itemHeight={40} />
            </div>
          </div>

          {error && <p className="text-sm text-danger-500 text-center">{error}</p>}

          <button onClick={handleSubmit} disabled={!isReady || loading}
            className="w-full bg-teal-500 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-teal-600 transition disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Yuklanmoqda...</> : 'Boshlash'}
          </button>
        </div>
      </div>
    </div>
  )
}
