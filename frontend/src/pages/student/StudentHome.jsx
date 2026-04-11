import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Camera, LogOut, AlertCircle, RotateCcw, UserCheck, X, ClipboardList, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { getQuoteByScore, getDailyQuote, getRandomErrorMotivation, POINTS } from '../../data/quotes'
import { GRADE_SUBJECTS } from '../../data/gradeSubjects'
import RiskDashboard from '../../components/RiskDashboard'
import AiChat from '../../components/AiChat'
import RatingModal from '../../components/RatingModal'

// Fan ranglari va ikonkalari
const SUBJECT_STYLES = {
  'Matematika':      { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '🔢', badge: 'bg-blue-500' },
  'Algebra':         { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: '📐', badge: 'bg-blue-500' },
  'Geometriya':      { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: '📏', badge: 'bg-indigo-500' },
  'Ona tili':        { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: '📖', badge: 'bg-green-500' },
  'Ingliz tili':     { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: '🇬🇧', badge: 'bg-purple-500' },
  'Fizika':          { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: '⚡', badge: 'bg-orange-500' },
  'Kimyo':           { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: '🧪', badge: 'bg-rose-500' },
  'Biologiya':       { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: '🌿', badge: 'bg-emerald-500' },
  'Informatika':     { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: '💻', badge: 'bg-cyan-500' },
  'Tabiatshunoslik': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', icon: '🌍', badge: 'bg-teal-500' },
}

const getSubjectStyle = (subject) => SUBJECT_STYLES[subject] || { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', icon: '📚', badge: 'bg-gray-500' }

export default function StudentHome() {
  const navigate = useNavigate()
  const name = localStorage.getItem('studentName') || "O'quvchi"
  const grade = Number(localStorage.getItem('studentGrade')) || 7
  const telegramId = localStorage.getItem('telegramId')

  const dailyQuote = getDailyQuote()

  // Fan tanlash
  const [selectedSubject, setSelectedSubject] = useState(null)
  const subjects = GRADE_SUBJECTS[grade] || []

  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [processingTime, setProcessingTime] = useState(0)
  const [analysis, setAnalysis] = useState(null)
  const [lastSubmissionId, setLastSubmissionId] = useState(null)
  const [showRating, setShowRating] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [showDetails, setShowDetails] = useState(false)

  // Abort controller for fetch cleanup
  const abortControllerRef = useRef(null)

  // Fan o'zgarganda state tozalash
  useEffect(() => {
    setResult(null)
    setError(null)
    setChecking(false)
    setShowDetails(false)
  }, [selectedSubject])

  // Topshiriqlarni yuklash
  useEffect(() => {
    if (!telegramId || telegramId === '0') return
    fetch(`/api/assignments/student?telegram_id=${telegramId}`)
      .then(r => r.json()).then(data => { if (Array.isArray(data)) setAssignments(data) }).catch(() => {})
  }, [telegramId])

  // Bilim tahlilini yuklash
  useEffect(() => {
    if (!telegramId || telegramId === '0') return
    fetch(`/api/analysis/student/${telegramId}`)
      .then(r => r.json())
      .then(data => { if (data.total_submissions > 0) setAnalysis(data) })
      .catch(() => {})
  }, [telegramId, result])

  // Kamera state
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Ota-ona tasdiqlash
  const [parentRequest, setParentRequest] = useState(null)
  const [confirmingParent, setConfirmingParent] = useState(false)

  useEffect(() => {
    if (!telegramId || telegramId === '0') return
    fetch(`/api/users/pending-parent?telegram_id=${telegramId}`)
      .then(r => r.json())
      .then(data => { if (data.has_pending) setParentRequest(data) })
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

  // Ortga qaytish — browser back button
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      if (selectedSubject) {
        setSelectedSubject(null)
        window.history.pushState(null, '', window.location.href)
      } else {
        // Fan gridda — rol menyusiga qaytish
        sessionStorage.setItem('showRoleMenu', 'true')
        window.location.href = '/'
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [selectedSubject])

  // Telegram BackButton
  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg?.BackButton) {
      tg.BackButton.show()
      const handler = () => {
        if (selectedSubject) {
          setSelectedSubject(null)
        } else {
          sessionStorage.setItem('showRoleMenu', 'true')
          window.location.href = '/'
        }
      }
      tg.BackButton.onClick(handler)
      return () => { tg.BackButton.offClick(handler) }
    }
  }, [selectedSubject])

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop())
      }
    }
  }, [])

  // Kamera ochish
  const openCamera = useCallback(async () => {
    setCameraError('')
    try {
      if (navigator.permissions) {
        try {
          const perm = await navigator.permissions.query({ name: 'camera' })
          if (perm.state === 'denied') {
            setCameraError('Kamera ruxsati berilmagan. Brauzer sozlamalaridan ruxsat bering.')
            return
          }
        } catch {}
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      setCameraOpen(true)
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }, 100)
    } catch (err) {
      setCameraError('Kameraga ruxsat berilmadi. Sozlamalardan ruxsat bering.')
    }
  }, [])

  // Kamera yopish
  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraOpen(false)
  }, [])

  // Suratga olish
  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0)
    closeCamera()

    canvas.toBlob(async (blob) => {
      if (!blob) return
      setChecking(true)
      setResult(null)
      setError(null)

      abortControllerRef.current = new AbortController()

      try {
        const formData = new FormData()
        formData.append('image', blob, 'photo.jpg')
        formData.append('subject', (selectedSubject || 'matematika').toLowerCase())
        formData.append('grade', grade)
        formData.append('telegram_id', telegramId || localStorage.getItem('telegramId') || '0')

        const response = await fetch('/api/check/homework', {
          method: 'POST',
          body: formData,
          signal: abortControllerRef.current.signal,
        })

        const data = await response.json()
        setProcessingTime(data.processing_ms || 0)

        if (data.success) {
          setResult(data.result)
          if (!localStorage.getItem('ratingGiven')) {
            setTimeout(() => setShowRating(true), 3000)
          }
        } else if (data.ocr_error) {
          setError('Rasmdagi yozuvni o\'qib bo\'lmadi. Yaxshiroq sifatda qayta suratga oling.')
        } else {
          setError(data.message || 'Xatolik yuz berdi')
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Server bilan aloqa yo\'q. Qayta urinib ko\'ring.')
        }
      } finally {
        setChecking(false)
      }
    }, 'image/jpeg', 0.85)
  }, [selectedSubject, grade, telegramId, closeCamera])

  const resetUpload = () => {
    setResult(null)
    setError(null)
    setShowDetails(false)
  }

  const handleLogout = () => {
    sessionStorage.setItem('showRoleMenu', 'true')
    window.location.href = '/'
  }

  const handleBackToSubjects = () => {
    resetUpload()
    setSelectedSubject(null)
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

  // Kamera fullscreen
  if (cameraOpen) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <video ref={videoRef} autoPlay playsInline muted className="flex-1 object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute top-4 right-4">
          <button onClick={closeCamera} className="bg-black/50 text-white p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 flex justify-center bg-gradient-to-t from-black/80 to-transparent">
          <button onClick={takePhoto}
            className="w-20 h-20 rounded-full border-4 border-white bg-white/20 active:bg-white/40 transition flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white" />
          </button>
        </div>
        <p className="absolute bottom-2 left-0 right-0 text-center text-white/60 text-xs">Daftarni kameraga to'g'rilang</p>
      </div>
    )
  }

  // === FAN TANLANGAN — TEKSHIRISH KO'RINISHI ===
  if (selectedSubject) {
    const style = getSubjectStyle(selectedSubject)
    const xpEarned = result ? (correctCount * POINTS.correctProblem + (scorePercent >= 100 ? POINTS.perfectScore : 0)) : 0

    // Shu fanga tegishli topshiriqlar
    const subjectAssignments = assignments.filter(a =>
      a.subject?.toLowerCase() === selectedSubject.toLowerCase()
    )

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className={`bg-gradient-to-r from-success-500 to-success-600 px-4 py-4 text-white`}>
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={handleBackToSubjects} className="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-lg font-bold">{name}</h1>
                  <p className="text-xs text-success-100">{grade}-sinf | {selectedSubject}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/student/profile">
                  <img src={localStorage.getItem('studentGender') === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'}
                    alt="Profil" className="w-9 h-9 rounded-full object-cover border-2 border-white/30" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-lg mx-auto p-4 space-y-4">

          {/* Topshiriqlar shu fan uchun */}
          {subjectAssignments.length > 0 && (
            <div className="bg-white rounded-2xl p-4 shadow-sm border-2 border-amber-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="relative">
                  <ClipboardList className="w-5 h-5 text-amber-500" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                </div>
                <h2 className="text-base font-semibold text-gray-800">Topshiriqlar</h2>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">{subjectAssignments.length} yangi</span>
              </div>
              <div className="space-y-2">
                {subjectAssignments.map(a => {
                  const isDone = localStorage.getItem(`done_${a.id}`)
                  return (
                    <div key={a.id} className={`p-3 rounded-xl border ${isDone ? 'bg-success-50 border-success-200' : 'bg-amber-50 border-amber-200'}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {!isDone && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                            {isDone && <span className="text-sm">✅</span>}
                            <p className={`text-sm font-medium ${isDone ? 'text-success-700 line-through' : 'text-gray-800'}`}>{a.title}</p>
                          </div>
                          {a.description && <p className="text-xs text-gray-500 mt-1 ml-6">{a.description}</p>}
                          {a.image_url && (
                            <img src={a.image_url} alt="Topshiriq" className="mt-2 ml-6 rounded-lg max-h-40 object-contain border border-gray-200" />
                          )}
                          <div className="flex items-center gap-3 mt-2 ml-6 text-[10px] text-gray-400">
                            <span>{a.teacher_name}</span>
                            <span>{new Date(a.created_at).toLocaleDateString('uz')}</span>
                          </div>
                          {a.due_date && (
                            <p className="text-xs text-red-500 mt-1 ml-6 font-medium">Muddat: {new Date(a.due_date).toLocaleDateString('uz')}</p>
                          )}
                        </div>
                        {!isDone && (
                          <button onClick={() => { localStorage.setItem(`done_${a.id}`, '1'); setAssignments([...assignments]) }}
                            className="text-[10px] bg-success-500 text-white px-2 py-1 rounded-lg font-medium flex-shrink-0">
                            Bajarildi
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* KAMERA OCHISH */}
          {!result && !error && !checking && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-20 h-20 bg-success-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-success-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">Vazifani tekshirish</h2>
              <p className="text-sm text-gray-500 mb-5">Daftaringizni suratga olib yuboring</p>
              {cameraError && (
                <p className="text-xs text-danger-500 mb-3">{cameraError}</p>
              )}
              <button onClick={openCamera}
                className="inline-flex items-center gap-2 bg-success-500 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-success-600 transition active:scale-95">
                <Camera className="w-5 h-5" />
                Suratga olish
              </button>
            </div>
          )}

          {/* TEKSHIRILMOQDA */}
          {checking && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-success-200 border-t-success-500 mx-auto mb-4"></div>
              <p className="text-lg font-semibold text-gray-700">AI tekshirmoqda...</p>
              <p className="text-sm text-gray-400 mt-2">5-10 soniya kuting</p>
            </div>
          )}

          {/* XATO */}
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

          {/* NATIJA */}
          {result && (() => {
            const quote = getQuoteByScore(scorePercent)
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

              {/* Batafsil ko'rish tugmasi */}
              <button onClick={() => setShowDetails(!showDetails)}
                className="w-full flex items-center justify-center gap-2 text-sm text-primary-600 font-medium py-2 mb-2 hover:bg-primary-50 rounded-xl transition">
                {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                {showDetails ? 'Yashirish' : `Batafsil ko'rish (${totalProblems} masala)`}
              </button>

              {showDetails && (
                <div className="space-y-2 mb-4">
                  {(result.problems || []).map((p, i) => (
                    <div key={i} className={`p-3 rounded-xl ${
                      p.is_correct ? 'bg-success-50 border border-success-100'
                        : p.score === 0.5 ? 'bg-accent-50 border border-accent-100'
                        : 'bg-danger-50 border border-danger-100'
                    }`}>
                      <div className="flex items-start gap-2">
                        <span className="mt-0.5">{p.is_correct ? '✅' : p.score === 0.5 ? '⚠️' : '❌'}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-700">{p.number}-masala: {p.problem_text}</p>
                          {p.student_solution && <p className="text-xs text-gray-500 mt-0.5">Sizning yechim: {p.student_solution}</p>}
                          {!p.is_correct && (
                            <div className="mt-2 space-y-1">
                              {p.error_explanation && <p className="text-xs text-danger-600">💡 {p.error_explanation}</p>}
                              {p.correct_answer && <p className="text-xs text-success-600">✏️ To'g'ri javob: {p.correct_answer}</p>}
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
              )}

              {result.weak_topics && result.weak_topics.length > 0 && (
                <div className="bg-accent-50 rounded-xl p-3 mb-3">
                  <p className="text-xs font-medium text-accent-700">⚠️ Mashq qilish kerak: {result.weak_topics.join(', ')}</p>
                </div>
              )}

              {result.recommendation && (
                <div className="bg-primary-50 rounded-xl p-3 mb-3">
                  <p className="text-xs text-primary-700">📌 {result.recommendation}</p>
                </div>
              )}

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

          {/* AI CHAT */}
          <AiChat
            telegramId={telegramId}
            submissionId={lastSubmissionId}
            topic={selectedSubject}
          />
        </div>

        {showRating && <RatingModal onClose={() => setShowRating(false)} />}
      </div>
    )
  }

  // === ASOSIY KO'RINISH — FANLAR GRID ===
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-success-500 to-success-600 px-4 py-5 text-white">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-lg font-bold">{name}</h1>
              <p className="text-xs text-success-100">{grade}-sinf</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/student/profile">
                <img src={localStorage.getItem('studentGender') === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'}
                  alt="Profil" className="w-9 h-9 rounded-full object-cover border-2 border-white/30" />
              </Link>
              <button onClick={handleLogout} className="p-2 text-white/70 hover:text-white">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
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

        {/* Ota-ona tasdiqlash */}
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
                className="flex-1 bg-success-500 text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50">
                Ha, tasdiqlash
              </button>
              <button onClick={() => handleParentConfirm(false)} disabled={confirmingParent}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50">
                Yo'q
              </button>
            </div>
          </div>
        )}

        {/* TOPSHIRIQLAR (barcha fanlar) */}
        {assignments.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-5 h-5 text-primary-500" />
              <h2 className="text-base font-semibold text-gray-800">Topshiriqlar</h2>
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">{assignments.length}</span>
            </div>
            <div className="space-y-2">
              {assignments.map(a => (
                <div key={a.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                  <p className="text-sm font-medium text-gray-800">{a.title}</p>
                  {a.description && <p className="text-xs text-gray-500 mt-1">{a.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                    <span className="bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded">{a.subject}</span>
                    <span>{a.grade}-sinf</span>
                    <span>{a.teacher_name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FANLAR GRID */}
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Fanni tanlang</h2>
          <div className="grid grid-cols-2 gap-3">
            {subjects.map(subj => {
              const style = getSubjectStyle(subj)
              // Shu fandagi topshiriqlar soni (bajarilmaganlar)
              const subjectTasks = assignments.filter(a => a.subject?.toLowerCase() === subj.toLowerCase())
              const newCount = subjectTasks.filter(a => !localStorage.getItem(`done_${a.id}`)).length
              return (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`${style.bg} ${style.border} border rounded-2xl p-4 text-left hover:shadow-md transition-all active:scale-[0.97] relative`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{style.icon}</span>
                    {newCount > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full animate-pulse">{newCount}</span>
                    )}
                  </div>
                  <p className={`text-sm font-semibold ${style.text}`}>{subj}</p>
                  {newCount > 0 && <p className="text-[10px] text-red-500 font-medium mt-0.5">Yangi topshiriq!</p>}
                </button>
              )
            })}
          </div>
        </div>

        {/* BILIM TAHLILI */}
        {analysis && (
          <RiskDashboard
            analysis={analysis}
            title="Mening bilimlarim"
          />
        )}

        {/* AI CHAT (umumiy) */}
        <AiChat
          telegramId={telegramId}
          submissionId={null}
          topic={null}
        />
      </div>

      {showRating && <RatingModal onClose={() => setShowRating(false)} />}
    </div>
  )
}
