import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { fetchSubjects } from './lessonsData'

const SUBJECT_VISUAL = {
  biologiya:   { color: 'bg-emerald-500', soft: 'bg-emerald-50', text: 'text-emerald-700', icon: '🌿' },
  kimyo:       { color: 'bg-rose-500',    soft: 'bg-rose-50',    text: 'text-rose-700',    icon: '🧪' },
  fizika:      { color: 'bg-orange-500',  soft: 'bg-orange-50',  text: 'text-orange-700',  icon: '⚡' },
  astronomiya: { color: 'bg-indigo-500',  soft: 'bg-indigo-50',  text: 'text-indigo-700',  icon: '🪐' },
}

export default function LessonsIndex() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetchSubjects()
      .then(d => { setSubjects(d.subjects || []); setLoading(false) })
      .catch(e => { setErr(e.message); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/teacher')} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-800">Interaktiv darslar</h1>
          <p className="text-xs text-gray-500">3D model bilan o'rganing</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {loading && <div className="text-center py-12 text-gray-400 text-sm">Yuklanmoqda…</div>}
        {err && <div className="text-center py-12 text-red-500 text-sm">Xato: {err}</div>}

        <div className="grid grid-cols-2 gap-3">
          {subjects.map(s => {
            const v = SUBJECT_VISUAL[s.slug] || { color: 'bg-gray-500', soft: 'bg-gray-50', text: 'text-gray-700', icon: '📚' }
            const enabled = s.is_active && s.topic_count > 0
            return (
              <button key={s.slug}
                disabled={!enabled}
                onClick={() => enabled && navigate(`/teacher/lessons/${s.slug}`)}
                className={`${v.soft} rounded-2xl p-4 text-left transition-all border-2 border-transparent ${enabled ? 'hover:border-current hover:scale-[1.02] cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}>
                <div className="text-3xl mb-2">{v.icon}</div>
                <div className={`text-sm font-bold ${v.text}`}>{s.name_uz}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {enabled ? `${s.topic_count} ta dars` : 'Tez orada'}
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}
