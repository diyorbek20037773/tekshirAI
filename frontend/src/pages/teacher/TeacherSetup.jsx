import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GraduationCap, ArrowLeft, Loader2 } from 'lucide-react'
import WheelPicker from '../../components/WheelPicker'

const SUBJECT_ITEMS = [
  'Ona tili', 'Ingliz tili', 'Matematika', 'Algebra', 'Geometriya',
  'Fizika', 'Kimyo', 'Biologiya', 'Tabiatshunoslik', 'Informatika',
].map(s => ({ value: s, label: s }))

const CLASS_GRADES = Array.from({ length: 11 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}-sinf`,
}))

const CLASS_SECTIONS = ['A', 'B', 'C', 'D'].map(s => ({ value: s, label: s }))

export default function TeacherSetup() {
  const navigate = useNavigate()
  const [subject, setSubject] = useState('')
  const [classGrade, setClassGrade] = useState(5)
  const [classSection, setClassSection] = useState('A')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user
  const userName = tgUser?.first_name || ''
  const userUsername = tgUser?.username || ''
  const telegramId = tgUser?.id || 0

  const selectedClass = `${classGrade}-${classSection}`

  const handleSubmit = async () => {
    if (!subject) return
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
          role: 'teacher',
          subject,
          teacher_class: selectedClass,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.detail || 'Xatolik yuz berdi')
        setLoading(false)
        return
      }

      localStorage.setItem('teacherName', data.full_name)
      localStorage.setItem('teacherSubject', subject)
      localStorage.setItem('teacherClass', selectedClass)
      localStorage.setItem('userId', data.id)
      localStorage.setItem('telegramId', telegramId)
      navigate('/teacher')
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

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">O'qituvchi</h1>
            <p className="text-sm text-gray-500">
              {userName ? `Salom, ${userName}!` : 'Ma\'lumotlaringizni kiriting'}
            </p>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fan</label>
            <WheelPicker
              items={SUBJECT_ITEMS}
              selectedValue={subject}
              onSelect={setSubject}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sinf</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <WheelPicker
                  items={CLASS_GRADES}
                  selectedValue={classGrade}
                  onSelect={setClassGrade}
                />
              </div>
              <div className="w-24">
                <WheelPicker
                  items={CLASS_SECTIONS}
                  selectedValue={classSection}
                  onSelect={setClassSection}
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="text-sm text-danger-500 text-center">{error}</p>
          )}

          <button onClick={handleSubmit}
            disabled={!subject || loading}
            className="w-full bg-primary-500 text-white py-4 rounded-xl font-semibold text-base hover:bg-primary-600 transition disabled:opacity-40 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Yuklanmoqda...</> : 'Davom etish'}
          </button>
        </div>
      </div>
    </div>
  )
}
