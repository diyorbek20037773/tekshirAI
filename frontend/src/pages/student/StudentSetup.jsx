import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Loader2 } from 'lucide-react'
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

export default function StudentSetup() {
  const navigate = useNavigate()
  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  const telegramId = tgUser?.id || 0
  const userUsername = tgUser?.username || ''

  const [firstName, setFirstName] = useState(tgUser?.first_name || '')
  const [lastName, setLastName] = useState(tgUser?.last_name || '')
  const [gender, setGender] = useState('male')
  const [grade, setGrade] = useState(5)
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const subjectItems = useMemo(() => {
    return (GRADE_SUBJECTS[grade] || []).map(s => ({ value: s, label: s }))
  }, [grade])

  const handleGradeChange = (g) => {
    setGrade(g)
    setSubject('')
  }

  const handleSubmit = async () => {
    if (!firstName.trim()) { setError('Ismingizni kiriting'); return }
    if (!subject || !grade) return
    setLoading(true)
    setError('')

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim()

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramId,
          username: userUsername,
          full_name: fullName,
          role: 'student',
          gender,
          grade,
          subject,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Xatolik yuz berdi')
        setLoading(false)
        return
      }

      localStorage.setItem('studentName', data.full_name)
      localStorage.setItem('studentUsername', data.username || userUsername)
      localStorage.setItem('studentSubject', subject)
      localStorage.setItem('studentGrade', grade)
      localStorage.setItem('studentGender', gender)
      localStorage.setItem('userId', data.id)
      localStorage.setItem('telegramId', telegramId)
      navigate('/student')
    } catch (err) {
      setError("Server bilan bog'lanib bo'lmadi")
      setLoading(false)
    }
  }

  const avatarSrc = gender === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <button onClick={() => { localStorage.removeItem('userRole'); navigate('/') }}
          className="flex items-center gap-2 text-gray-500 mb-4 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" /> Orqaga
        </button>

        {/* Header with avatar */}
        <div className="flex items-center gap-3 mb-5">
          <img src={avatarSrc} alt="Avatar"
            className="w-14 h-14 rounded-full object-cover border-2 border-success-200 shadow-sm" />
          <div>
            <h1 className="text-lg font-bold text-gray-800">Ro'yxatdan o'tish</h1>
            <p className="text-xs text-gray-500">{userUsername ? `@${userUsername}` : 'Telegram Mini App'}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Ism va Familya */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ismingiz</label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                placeholder="Ism"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-success-400 focus:ring-1 focus:ring-success-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Familiyangiz</label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Familiya"
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-success-400 focus:ring-1 focus:ring-success-400"
              />
            </div>
          </div>

          {/* Jins */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Jinsingiz</label>
            <WheelPicker
              items={GENDER_ITEMS}
              selectedValue={gender}
              onSelect={setGender}
              visibleItems={3}
              itemHeight={40}
            />
          </div>

          {/* Sinf va Fan yonma-yon */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Sinf</label>
              <WheelPicker
                items={GRADE_ITEMS}
                selectedValue={grade}
                onSelect={handleGradeChange}
                visibleItems={3}
                itemHeight={40}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fan</label>
              <WheelPicker
                items={subjectItems}
                selectedValue={subject}
                onSelect={setSubject}
                visibleItems={3}
                itemHeight={40}
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger-500 text-center">{error}</p>
          )}

          <button onClick={handleSubmit}
            disabled={!firstName.trim() || !subject || !grade || loading}
            className="w-full bg-success-500 text-white py-3.5 rounded-xl font-semibold text-base hover:bg-success-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Yuklanmoqda...</> : 'Boshlash'}
          </button>
        </div>
      </div>
    </div>
  )
}
