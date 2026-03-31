import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, ArrowLeft, Loader2 } from 'lucide-react'
import WheelPicker from '../../components/WheelPicker'
import { GRADE_SUBJECTS } from '../../data/gradeSubjects'

const GRADE_ITEMS = Array.from({ length: 11 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}-sinf`,
}))

export default function StudentSetup() {
  const navigate = useNavigate()
  const [grade, setGrade] = useState(5)
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  const userName = tgUser?.first_name || 'O\'quvchi'
  const userUsername = tgUser?.username || ''
  const telegramId = tgUser?.id || 0

  const subjectItems = useMemo(() => {
    return (GRADE_SUBJECTS[grade] || []).map(s => ({ value: s, label: s }))
  }, [grade])

  const handleGradeChange = (g) => {
    setGrade(g)
    setSubject('')
  }

  const handleSubmit = async () => {
    if (!subject || !grade) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_id: telegramId,
          username: userUsername,
          full_name: userName,
          role: 'student',
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

      // Saqlash
      localStorage.setItem('studentName', data.full_name)
      localStorage.setItem('studentUsername', data.username || userUsername)
      localStorage.setItem('studentSubject', subject)
      localStorage.setItem('studentGrade', grade)
      localStorage.setItem('userId', data.id)
      localStorage.setItem('telegramId', telegramId)
      navigate('/student')
    } catch (err) {
      setError('Server bilan bog\'lanib bo\'lmadi')
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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-success-500 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Salom, {userName}!</h1>
            <p className="text-sm text-gray-500">{userUsername ? `@${userUsername}` : 'Telegram Mini App'}</p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nechanchi sinfda o'qiysiz?</label>
            <WheelPicker
              items={GRADE_ITEMS}
              selectedValue={grade}
              onSelect={handleGradeChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Qaysi fanni tekshirmoqchisiz?</label>
            <WheelPicker
              items={subjectItems}
              selectedValue={subject}
              onSelect={setSubject}
            />
          </div>

          {error && (
            <p className="text-sm text-danger-500 text-center">{error}</p>
          )}

          <button onClick={handleSubmit}
            disabled={!subject || !grade || loading}
            className="w-full bg-success-500 text-white py-4 rounded-xl font-semibold text-base hover:bg-success-600 transition disabled:opacity-40 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Yuklanmoqda...</> : 'Boshlash'}
          </button>
        </div>
      </div>
    </div>
  )
}
