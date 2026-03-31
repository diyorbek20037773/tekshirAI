import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, LogOut, AlertCircle, RotateCcw, UserCheck } from 'lucide-react'
import { getQuoteByScore, getDailyQuote, getRandomErrorMotivation, POINTS } from '../../data/quotes'

export default function StudentHome() {
  const navigate = useNavigate()
  const name = localStorage.getItem('studentName') || "O'quvchi"
  const subject = localStorage.getItem('studentSubject') || 'Matematika'
  const grade = localStorage.getItem('studentGrade') || 7
  const telegramId = localStorage.getItem('telegramId')

  const fileInputRef = useRef()
  const dailyQuote = getDailyQuote()

  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [processingTime, setProcessingTime] = useState(0)

  // Ota-ona tasdiqlash so'rovi
  const [parentRequest, setParentRequest] = useState(null)
  const [confirmingParent, setConfirmingParent] = useState(false)

  useEffect(() => {
    if (!telegramId || telegramId === '0') return
    fetch(`/api/users/pending-parent?telegram_id=${telegramId}`)
      .then(r => r.json())
      .then(data => {
        if (data.has_pending) setParentRequest(data)
      })
      .catch(() => {})
  }, [telegramId])

  const handleParentConfirm = async (confirm) => {
    setConfirmingParent(true)
    try {
      await fetch('/api/users/confirm-parent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_telegram_id: Number(telegramId), confirm }),
      })
      setParentRequest(null)
    } catch (err) {}
    setConfirmingParent(false)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setChecking(true)
    setResult(null)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('subject', subject.toLowerCase())
      formData.append('grade', grade)
      formData.append('telegram_id', telegramId || '0')

      const response = await fetch('/api/check/homework', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setProcessingTime(data.processing_ms || 0)

      if (data.success) {
        setResult(data.result)
      } else if (data.ocr_error) {
        setError('Rasmdagi yozuvni o\'qib bo\'lmadi. Iltimos yaxshiroq sifatda qayta yuboring.')
      } else {
        setError(data.message || 'Xatolik yuz berdi')
      }
    } catch (err) {
      setError('Server bilan aloqa yo\'q. Qayta urinib ko\'ring.')
    } finally {
      setChecking(false)
    }
  }

  const resetUpload = () => {
    setResult(null)
    setError(null)
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/')
  }

  const scorePercent = result?.score_percentage || 0
  const totalProblems = result?.total_problems || 0
  const correctCount = result?.correct_count || 0

  const getEmoji = (score) => {
    if (score >= 90) return '🏆'
    if (score >= 70) return '👍'
    if (score >= 50) return '💪'
    return '📚'
  }

  const getStatus = (score) => {
    if (score >= 90) return 'Ajoyib!'
    if (score >= 70) return 'Yaxshi!'
    if (score >= 50) return "O'rtacha"
    return "Ko'proq mashq kerak"
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-success-500 to-success-600 px-4 py-5 text-white">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold">{name}</h1>
              <p className="text-xs text-success-100">{grade}-sinf | {subject}</p>
            </div>
            <button onClick={handleLogout} className="p-2 text-white/70 hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
          {dailyQuote && (
            <div className="bg-white/15 rounded-lg px-3 py-2 mt-2">
              <p className="text-xs text-white/90 italic">"{dailyQuote.text}"</p>
              {dailyQuote.author && <p className="text-[10px] text-white/60 mt-0.5">— {dailyQuote.author}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">

        {/* Ota-ona tasdiqlash so'rovi */}
        {parentRequest && (
          <div className="bg-accent-50 border border-accent-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <UserCheck className="w-5 h-5 text-accent-600" />
              <p className="font-medium text-gray-800">Ota-ona so'rovi</p>
            </div>
            <p className="text-sm text-gray-600 mb-3">
              <strong>{parentRequest.parent_name}</strong> (@{parentRequest.parent_username}) sizning ota-onangiz sifatida bog'lanmoqchi. Tasdiqlaysizmi?
            </p>
            <div className="flex gap-2">
              <button onClick={() => handleParentConfirm(true)} disabled={confirmingParent}
                className="flex-1 bg-success-500 text-white py-2.5 rounded-lg font-medium text-sm hover:bg-success-600 disabled:opacity-50">
                Ha, tasdiqlash
              </button>
              <button onClick={() => handleParentConfirm(false)} disabled={confirmingParent}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm hover:bg-gray-300 disabled:opacity-50">
                Yo'q
              </button>
            </div>
          </div>
        )}

        {/* === RASM YUKLASH === */}
        {!result && !error && !checking && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Camera className="w-10 h-10 text-success-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Vazifani tekshirish</h2>
            <p className="text-sm text-gray-500 mb-5">Daftaringizni suratga olib yuboring</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
            />
            <button
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.value = ''
                  fileInputRef.current.click()
                }
              }}
              className="inline-flex items-center gap-2 bg-success-500 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-success-600 transition active:scale-95"
            >
              <Camera className="w-5 h-5" />
              Suratga olish
            </button>
          </div>
        )}

        {/* === TEKSHIRILMOQDA === */}
        {checking && (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-success-200 border-t-success-500 mx-auto mb-4"></div>
            <p className="text-lg font-semibold text-gray-700">AI tekshirmoqda...</p>
            <p className="text-sm text-gray-400 mt-2">5-10 soniya kuting</p>
          </div>
        )}

        {/* === XATO === */}
        {error && (() => {
          const motivation = getRandomErrorMotivation()
          return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-danger-200">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-8 h-8 text-danger-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-800">Tekshirib bo'lmadi</p>
                  <p className="text-sm text-gray-600 mt-1">{error}</p>
                </div>
              </div>
              <div className="bg-accent-50 rounded-lg p-3 mb-3">
                <p className="text-xs text-accent-700 italic">"{motivation.text}"</p>
                {motivation.author && <p className="text-[10px] text-accent-500 mt-0.5">— {motivation.author}</p>}
              </div>
              <button onClick={resetUpload}
                className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition">
                <RotateCcw className="w-4 h-4" /> Qayta urinish
              </button>
            </div>
          )
        })()}

        {/* === NATIJA === */}
        {result && (() => {
          const quote = getQuoteByScore(scorePercent)
          const xpEarned = correctCount * POINTS.correctProblem + (scorePercent >= 100 ? POINTS.perfectScore : 0)
          return (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="text-center mb-4">
              <span className="text-5xl">{getEmoji(scorePercent)}</span>
              <h2 className="text-xl font-bold text-gray-800 mt-2">{getStatus(scorePercent)}</h2>
              <p className="text-sm text-success-600 font-medium mt-1">+{xpEarned} ball</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-success-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-success-600">{scorePercent}%</p>
                <p className="text-[10px] text-gray-500">Ball</p>
              </div>
              <div className="bg-primary-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-primary-600">{correctCount}/{totalProblems}</p>
                <p className="text-[10px] text-gray-500">To'g'ri</p>
              </div>
              <div className="bg-accent-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-accent-600">{(processingTime / 1000).toFixed(1)}s</p>
                <p className="text-[10px] text-gray-500">Vaqt</p>
              </div>
            </div>

            {/* Har bir masala */}
            <div className="space-y-2 mb-4">
              {(result.problems || []).map((p, i) => (
                <div key={i} className={`p-3 rounded-xl ${
                  p.is_correct
                    ? 'bg-success-50 border border-success-100'
                    : p.score === 0.5
                    ? 'bg-accent-50 border border-accent-100'
                    : 'bg-danger-50 border border-danger-100'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5">{p.is_correct ? '✅' : p.score === 0.5 ? '⚠️' : '❌'}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">
                        {p.number}-masala: {p.problem_text}
                      </p>
                      {p.student_solution && (
                        <p className="text-xs text-gray-500 mt-0.5">Sizning yechim: {p.student_solution}</p>
                      )}
                      {!p.is_correct && (
                        <div className="mt-2 space-y-1">
                          {p.error_explanation && (
                            <p className="text-xs text-danger-600">💡 {p.error_explanation}</p>
                          )}
                          {p.correct_answer && (
                            <p className="text-xs text-success-600">✏️ To'g'ri javob: {p.correct_answer}</p>
                          )}
                          {p.steps && p.steps.length > 0 && (
                            <div className="mt-2 bg-white/60 rounded-lg p-2">
                              <p className="text-[10px] font-semibold text-gray-500 mb-1">QADAMLAR:</p>
                              {p.steps.map((step, si) => (
                                <p key={si} className={`text-[11px] ${step.is_correct ? 'text-gray-600' : 'text-danger-600 font-medium'}`}>
                                  {step.is_correct ? '✓' : '✗'} {step.step_number}-qadam: {step.student_step}
                                  {step.explanation && <span className="text-gray-500"> — {step.explanation}</span>}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {result.weak_topics && result.weak_topics.length > 0 && (
              <div className="bg-accent-50 rounded-xl p-3 mb-3">
                <p className="text-xs font-medium text-accent-700">
                  ⚠️ Mashq qilish kerak: {result.weak_topics.join(', ')}
                </p>
              </div>
            )}

            {result.recommendation && (
              <div className="bg-primary-50 rounded-xl p-3 mb-3">
                <p className="text-xs text-primary-700">📌 {result.recommendation}</p>
              </div>
            )}

            {/* Hikmatli so'z */}
            <div className="bg-success-50 rounded-xl p-3 mb-3 text-center">
              <p className="text-xs text-success-700 italic">"{quote.text}"</p>
              {quote.author && <p className="text-[10px] text-success-500 mt-0.5">— {quote.author}</p>}
            </div>

            <button onClick={resetUpload}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition">
              <RotateCcw className="w-4 h-4" /> Yangi vazifa tekshirish
            </button>
          </div>
          )
        })()}
      </div>
    </div>
  )
}
