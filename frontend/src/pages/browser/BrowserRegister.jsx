import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Loader2, Eye, EyeOff, GraduationCap, BookUser, Users, Building2 } from 'lucide-react'
import api from '../../api/client'
import { saveSession } from '../../utils/session'

const ROLE_CONFIG = {
  student: { label: "O'quvchi", icon: GraduationCap, geo: true, grade: true, gender: true, subject: false },
  teacher: { label: "O'qituvchi", icon: BookUser, geo: true, grade: false, gender: false, subject: true },
  parent: { label: 'Ota-ona', icon: Users, geo: false, grade: false, gender: false, subject: false },
  director: { label: 'Direktor', icon: Building2, geo: true, grade: false, gender: false, subject: true },
}

export default function BrowserRegister() {
  const navigate = useNavigate()
  const [role, setRole] = useState('')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [gender, setGender] = useState('male')
  const [grade, setGrade] = useState(5)
  const [classLetter, setClassLetter] = useState('A')
  const [subject, setSubject] = useState('')

  // Geolokatsiya
  const [viloyatlar, setViloyatlar] = useState([])
  const [tumanlar, setTumanlar] = useState([])
  const [selectedViloyat, setSelectedViloyat] = useState('')
  const [selectedTuman, setSelectedTuman] = useState('')
  const [selectedMaktab, setSelectedMaktab] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cfg = ROLE_CONFIG[role]

  useEffect(() => {
    if (!cfg?.geo) return
    fetch('/api/geo/viloyatlar').then(r => r.json()).then(setViloyatlar).catch(() => {})
  }, [cfg?.geo])

  useEffect(() => {
    if (!selectedViloyat) { setTumanlar([]); return }
    fetch(`/api/geo/tumanlar?viloyat=${encodeURIComponent(selectedViloyat)}`)
      .then(r => r.json()).then(setTumanlar).catch(() => setTumanlar([]))
  }, [selectedViloyat])

  // Rol tanlash ekrani
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg mb-3">
              <svg viewBox="0 0 512 512" className="w-9 h-9">
                <path d="M140 268 L226 352 L378 168" fill="none" stroke="#fff" strokeWidth="54"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Ro'yxatdan o'tish</h1>
            <p className="text-sm text-gray-500">Rolingizni tanlang</p>
          </div>

          <div className="space-y-3">
            {Object.entries(ROLE_CONFIG).map(([key, c]) => {
              const Icon = c.icon
              return (
                <button key={key} onClick={() => setRole(key)}
                  className="w-full bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <span className="font-semibold text-gray-800">{c.label}</span>
                </button>
              )
            })}
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Hisobingiz bormi?{' '}
            <Link to="/login" className="text-primary-600 font-semibold">Kirish</Link>
          </p>
        </div>
      </div>
    )
  }

  const isReady =
    firstName.trim() &&
    username.trim().length >= 3 &&
    password.length >= 6 &&
    (!cfg.subject || subject.trim()) &&
    (!cfg.geo || selectedMaktab)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isReady) return
    setLoading(true)
    setError('')

    const payload = {
      username: username.trim(),
      password,
      full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
      role,
    }
    if (cfg.gender) payload.gender = gender
    if (cfg.grade) { payload.grade = grade; payload.class_letter = classLetter }
    if (cfg.subject) payload.subject = subject.trim()
    if (cfg.geo) {
      payload.viloyat = selectedViloyat
      payload.tuman = selectedTuman
      payload.maktab = selectedMaktab
    }

    try {
      const { data } = await api.post('/auth/browser-register', payload)
      saveSession(data.user, data.access_token)
      window.location.replace(`/${data.user.role}`)
    } catch (err) {
      setError(err.response?.data?.detail || "Ro'yxatdan o'tishda xatolik")
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400'

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => setRole('')} className="flex items-center gap-2 text-gray-500 mb-4 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" /> Orqaga
        </button>

        <h1 className="text-lg font-bold text-gray-800 mb-1">{cfg.label} — ro'yxatdan o'tish</h1>
        <p className="text-xs text-gray-500 mb-4">Ma'lumotlaringizni to'ldiring</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ism</label>
              <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Ism" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Familiya</label>
              <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Familiya" className={inputCls} />
            </div>
          </div>

          {cfg.gender && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Jinsi</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className={inputCls}>
                <option value="male">O'g'il bola</option>
                <option value="female">Qiz bola</option>
              </select>
            </div>
          )}

          {cfg.grade && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Sinf</label>
                <select value={grade} onChange={e => setGrade(Number(e.target.value))} className={inputCls}>
                  {Array.from({ length: 11 }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n}-sinf</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Harf</label>
                <select value={classLetter} onChange={e => setClassLetter(e.target.value)} className={inputCls}>
                  {['A', 'B', 'C', 'D', 'F'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
          )}

          {cfg.subject && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fan</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Masalan: Matematika" className={inputCls} />
            </div>
          )}

          {cfg.geo && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Viloyat</label>
                <select value={selectedViloyat} onChange={e => { setSelectedViloyat(e.target.value); setSelectedTuman(''); setSelectedMaktab('') }} className={inputCls}>
                  <option value="">Tanlang...</option>
                  {viloyatlar.map(v => <option key={v.kod} value={v.nom}>{v.nom}</option>)}
                </select>
              </div>
              {selectedViloyat && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Tuman</label>
                  <select value={selectedTuman} onChange={e => { setSelectedTuman(e.target.value); setSelectedMaktab('') }} className={inputCls}>
                    <option value="">Tanlang...</option>
                    {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}
              {selectedTuman && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Maktab</label>
                  <select value={selectedMaktab} onChange={e => setSelectedMaktab(e.target.value)} className={inputCls}>
                    <option value="">Maktab raqamini tanlang...</option>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={`${n}-sonli maktab`}>{n}-sonli maktab</option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="pt-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">Foydalanuvchi nomi</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)}
              autoCapitalize="none" autoCorrect="off" placeholder="username" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Parol (kamida 6 belgi)</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••" className={inputCls + ' pr-10'} />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {role === 'director' && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg p-2">
              Direktor hisobi admin tomonidan tasdiqlanadi.
            </p>
          )}

          {error && <p className="text-sm text-danger-500 text-center">{error}</p>}

          <button type="submit" disabled={!isReady || loading}
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-semibold hover:bg-primary-700 transition disabled:opacity-40 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Yuklanmoqda...</> : "Ro'yxatdan o'tish"}
          </button>
        </form>
      </div>
    </div>
  )
}
