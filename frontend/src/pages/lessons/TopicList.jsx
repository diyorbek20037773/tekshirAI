import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Box } from 'lucide-react'
import { fetchTopics } from './lessonsData'

export default function TopicList() {
  const navigate = useNavigate()
  const { subject } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetchTopics(subject)
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setErr(e.message); setLoading(false) })
  }, [subject])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
        <button onClick={() => navigate('/teacher/lessons')} className="p-1.5 rounded-lg hover:bg-gray-100">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-800">{data?.subject?.name_uz || subject}</h1>
          <p className="text-xs text-gray-500">Mavzuni tanlang</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4">
        {loading && <div className="text-center py-12 text-gray-400 text-sm">Yuklanmoqda…</div>}
        {err && <div className="text-center py-12 text-red-500 text-sm">Xato: {err}</div>}

        {data?.topics?.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">Bu fan uchun darslar hali qo'shilmagan</div>
        )}

        <div className="space-y-2">
          {data?.topics?.map(t => (
            <button key={t.id} onClick={() => navigate(`/teacher/lessons/${subject}/${t.id}`)}
              className="w-full bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all text-left">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
                <Box className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-800">{t.title_uz}</div>
                {t.description_uz && <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{t.description_uz}</div>}
              </div>
              <div className="text-xs text-gray-400">{t.parts_count} qism</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
