import { useState } from 'react'
import { Star, X } from 'lucide-react'

export default function RatingModal({ onClose }) {
  const [stars, setStars] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (stars === 0) return
    setLoading(true)
    const telegramId = localStorage.getItem('telegramId') || '0'
    try {
      await fetch('/api/admin/rating', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegram_id: Number(telegramId), stars, comment }),
      })
    } catch {}
    localStorage.setItem('ratingGiven', 'true')
    setSubmitted(true)
    setLoading(false)
    setTimeout(onClose, 2000)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-lg font-bold text-gray-800">Rahmat!</p>
          <p className="text-sm text-gray-500 mt-1">Bahoyingiz qabul qilindi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800">Ilovani baholang</h3>
          <button onClick={() => { localStorage.setItem('ratingGiven', 'true'); onClose() }}
            className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <p className="text-sm text-gray-500 mb-4">TekshirAI sizga yoqdimi? Baholang!</p>

        {/* 5 yulduz */}
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <button key={i} onClick={() => setStars(i)}
              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(0)}
              className="transition-transform hover:scale-110">
              <Star className={`w-10 h-10 ${
                i <= (hovered || stars) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
              }`} />
            </button>
          ))}
        </div>

        {stars > 0 && (
          <p className="text-center text-sm text-gray-600 mb-3">
            {stars === 1 ? 'Yomon' : stars === 2 ? "O'rtacha" : stars === 3 ? 'Yaxshi' : stars === 4 ? "Juda yaxshi" : "Ajoyib! 🎉"}
          </p>
        )}

        {/* Izoh */}
        <textarea value={comment} onChange={e => setComment(e.target.value)}
          placeholder="Izoh qoldiring (ixtiyoriy)..."
          className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none h-20 focus:outline-none focus:border-primary-400 mb-4" />

        <div className="flex gap-2">
          <button onClick={() => { localStorage.setItem('ratingGiven', 'true'); onClose() }}
            className="flex-1 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 border border-gray-200">
            Keyinroq
          </button>
          <button onClick={handleSubmit} disabled={stars === 0 || loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 disabled:opacity-40">
            {loading ? 'Yuborilmoqda...' : 'Yuborish'}
          </button>
        </div>
      </div>
    </div>
  )
}
