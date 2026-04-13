import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Users, BookCheck, TrendingUp, Clock, LogOut, Camera, X, Send, Loader2, Image, Compass, ClipboardList, Plus, Trash2 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getRandomTeacherQuote } from '../../data/quotes'
import RatingModal from '../../components/RatingModal'

function StatCard({ icon: Icon, title, value, color }) {
  const colors = {
    blue: 'bg-primary-50 text-primary-500',
    green: 'bg-success-50 text-success-500',
    yellow: 'bg-accent-50 text-accent-600',
    purple: 'bg-purple-50 text-purple-500',
  }
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function TeacherDashboard() {
  const navigate = useNavigate()
  const teacherName = localStorage.getItem('teacherName') || "O'qituvchi"
  const teacherMaktab = localStorage.getItem('teacherMaktab') || ''
  const teacherSubject = localStorage.getItem('teacherSubject') || ''
  const telegramId = localStorage.getItem('telegramId')

  const [students, setStudents] = useState([])
  const [riskData, setRiskData] = useState(null)
  const [recentSubs, setRecentSubs] = useState([])
  const [topicErrors, setTopicErrors] = useState([])
  const [globalStats, setGlobalStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const lastSubIdRef = React.useRef(null)
  const [teacherQuote] = useState(() => getRandomTeacherQuote())

  // Vazifa yuborish
  const [showAssignment, setShowAssignment] = useState(false)
  const [assignmentMode, setAssignmentMode] = useState(null) // 'camera' | 'check'
  const [cameraOpen, setCameraOpen] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [checking, setChecking] = useState(false)
  const [checkResult, setCheckResult] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)

  // Topshiriqlar
  const [showNewAssignment, setShowNewAssignment] = useState(false)
  const [assignments, setAssignments] = useState([])
  const [assignTitle, setAssignTitle] = useState('')
  const [assignDesc, setAssignDesc] = useState('')
  const [assignGrade, setAssignGrade] = useState(7)
  const [assignSubject, setAssignSubject] = useState(teacherSubject || 'Matematika')
  const [assignSaving, setAssignSaving] = useState(false)
  const [assignImage, setAssignImage] = useState(null)
  const assignImageRef = useRef(null)

  const fetchAssignments = () => {
    if (!telegramId) return
    fetch(`/api/assignments/teacher?telegram_id=${telegramId}`)
      .then(r => r.json()).then(setAssignments).catch(() => {})
  }
  useEffect(() => { fetchAssignments() }, [telegramId])

  const handleCreateAssignment = async () => {
    if (!assignTitle.trim()) {
      alert('Iltimos, topshiriq nomini kiriting')
      return
    }
    setAssignSaving(true)
    try {
      const res = await fetch('/api/assignments/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher_telegram_id: Number(telegramId),
          title: assignTitle.trim(),
          description: assignDesc.trim() || null,
          subject: assignSubject,
          grade: assignGrade,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        // Rasm yuklash (agar tanlangan bo'lsa)
        if (assignImage && data.id) {
          const formData = new FormData()
          formData.append('file', assignImage)
          await fetch(`/api/assignments/${data.id}/image`, { method: 'POST', body: formData }).catch(() => {})
        }
        setAssignTitle('')
        setAssignDesc('')
        setAssignImage(null)
        if (assignImageRef.current) assignImageRef.current.value = ''
        setShowNewAssignment(false)
        fetchAssignments()
      }
    } catch {}
    setAssignSaving(false)
  }

  const handleDeleteAssignment = async (id) => {
    if (!confirm("O'chirishni xohlaysizmi?")) return
    await fetch(`/api/assignments/${id}?telegram_id=${telegramId}`, { method: 'DELETE' }).catch(() => {})
    fetchAssignments()
  }

  const fetchData = () => {
    Promise.all([
      fetch(`/api/users/students${teacherMaktab ? `?maktab=${encodeURIComponent(teacherMaktab)}` : ''}`).then(r => r.json()).catch(() => ({ students: [] })),
      fetch('/api/analysis/classroom-risks').then(r => r.json()).catch(() => null),
      fetch('/api/dashboard/recent-all?limit=10').then(r => r.json()).catch(() => []),
      fetch('/api/dashboard/topic-errors-all').then(r => r.json()).catch(() => []),
      fetch('/api/dashboard/stats-all').then(r => r.json()).catch(() => null),
    ]).then(([studentsData, risksData, recent, errors, stats]) => {
      setStudents(studentsData.students || [])
      setRiskData(risksData)
      setTopicErrors(errors)
      setGlobalStats(stats)

      if (recent.length > 0 && lastSubIdRef.current && recent[0].id !== lastSubIdRef.current) {
        const newSub = recent[0]
        setNotification({
          name: newSub.student_name,
          gender: newSub.student_gender,
          subject: newSub.subject,
          score: newSub.score,
          correct: newSub.correct_count,
          total: newSub.total_problems,
        })
        setTimeout(() => setNotification(null), 8000)
      }
      if (recent.length > 0) lastSubIdRef.current = recent[0].id
      setRecentSubs(recent)
    }).finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  // Kamera funksiyalari
  const openCamera = useCallback(async () => {
    try {
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
      alert('Kameraga ruxsat berilmadi')
    }
  }, [])

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setCameraOpen(false)
  }, [])

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    closeCamera()
    canvas.toBlob(blob => {
      if (blob) setCapturedImage(blob)
    }, 'image/jpeg', 0.85)
  }, [closeCamera])

  // O'qituvchi o'zi tekshirish (dars paytida)
  const handleTeacherCheck = async () => {
    if (!capturedImage) return
    setChecking(true)
    setCheckResult(null)
    try {
      const formData = new FormData()
      formData.append('image', capturedImage, 'teacher_check.jpg')
      formData.append('subject', teacherSubject.toLowerCase() || 'matematika')
      formData.append('grade', '7')
      formData.append('telegram_id', telegramId || '0')

      const res = await fetch('/api/check/homework', { method: 'POST', body: formData })
      const data = await res.json()
      if (data.success) {
        setCheckResult(data.result)
      } else {
        setCheckResult({ error: data.message || "Tekshirib bo'lmadi" })
      }
    } catch {
      setCheckResult({ error: "Server bilan aloqa yo'q" })
    }
    setChecking(false)
  }

  const totalStudents = students.length
  const avgScore = globalStats?.avg_score || 0

  // Orqaga — rol menyusiga qaytish
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)
    const handlePopState = () => {
      sessionStorage.setItem('showRoleMenu', 'true')
      window.location.href = '/'
    }
    window.addEventListener('popstate', handlePopState)
    // Telegram BackButton
    const tg = window.Telegram?.WebApp
    if (tg?.BackButton) {
      tg.BackButton.show()
      tg.BackButton.onClick(handlePopState)
    }
    return () => {
      window.removeEventListener('popstate', handlePopState)
      if (tg?.BackButton) { tg.BackButton.offClick(handlePopState); tg.BackButton.hide() }
    }
  }, [])

  const [showExitRating, setShowExitRating] = useState(false)
  const doExit = () => {
    sessionStorage.setItem('showRoleMenu', 'true')
    window.location.href = '/'
  }
  const handleLogout = () => {
    setShowExitRating(true)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-800">Salom, {teacherName.split(' ')[0]}!</h1>
            <p className="text-xs text-gray-500">{teacherMaktab || "O'qituvchi paneli"}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/teacher/profile">
              <img src="/avatars/teacher.jpg" alt="Profil" className="w-9 h-9 rounded-full object-cover border-2 border-gray-200" />
            </Link>
            <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-5">
        {/* Notification */}
        {notification && (
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg animate-pulse">
            <div className="flex items-center gap-3">
              <img src={notification.gender === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'}
                alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white/40" />
              <div className="flex-1">
                <p className="text-sm font-bold">Yangi natija!</p>
                <p className="text-xs text-blue-100">
                  <span className="font-semibold text-white">{notification.name}</span> {notification.subject} fanidan vazifa tekshirdi
                </p>
                <p className="text-xs text-blue-100 mt-0.5">
                  Natija: <span className="font-bold text-white">{notification.score}%</span> ({notification.correct}/{notification.total})
                </p>
              </div>
              <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white text-lg">x</button>
            </div>
          </div>
        )}

        {/* Hikmatli so'z */}
        <div className="bg-primary-50 rounded-xl px-4 py-3 border border-primary-100">
          <p className="text-xs text-primary-700 italic">"{teacherQuote.text}"</p>
          {teacherQuote.author && <p className="text-[10px] text-primary-400 mt-0.5">— {teacherQuote.author}</p>}
        </div>

        {/* === VAZIFA TEKSHIRISH / YUBORISH === */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Dars vaqtida tekshirish</h2>
          <p className="text-xs text-gray-500 mb-3">O'quvchi daftarini suratga olib, AI orqali tekshiring</p>

          {!capturedImage && !checkResult && (
            <button onClick={openCamera}
              className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white py-3 rounded-xl font-semibold hover:bg-primary-600 transition active:scale-95">
              <Camera className="w-5 h-5" /> Suratga olish
            </button>
          )}

          {capturedImage && !checkResult && (
            <div className="space-y-3">
              <div className="relative">
                <img src={URL.createObjectURL(capturedImage)} alt="Captured"
                  className="w-full rounded-xl border border-gray-200" />
                <button onClick={() => setCapturedImage(null)}
                  className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <button onClick={handleTeacherCheck} disabled={checking}
                className="w-full flex items-center justify-center gap-2 bg-success-500 text-white py-3 rounded-xl font-semibold hover:bg-success-600 transition disabled:opacity-50">
                {checking ? <><Loader2 className="w-5 h-5 animate-spin" /> Tekshirilmoqda...</> : <><BookCheck className="w-5 h-5" /> AI bilan tekshirish</>}
              </button>
            </div>
          )}

          {checkResult && (
            <div className="space-y-3">
              {checkResult.error ? (
                <div className="bg-danger-50 border border-danger-200 rounded-xl p-4">
                  <p className="text-sm text-danger-700">{checkResult.error}</p>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <span className="text-4xl">{checkResult.score_percentage >= 80 ? '🏆' : checkResult.score_percentage >= 60 ? '👍' : '📚'}</span>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{checkResult.score_percentage}%</p>
                    <p className="text-sm text-gray-500">{checkResult.correct_count}/{checkResult.total_problems} to'g'ri</p>
                  </div>

                  <div className="space-y-2">
                    {(checkResult.problems || []).map((p, i) => (
                      <div key={i} className={`p-3 rounded-xl ${p.is_correct ? 'bg-success-50 border border-success-100' : 'bg-danger-50 border border-danger-100'}`}>
                        <div className="flex items-start gap-2">
                          <span>{p.is_correct ? '✅' : '❌'}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">{p.number}-masala: {p.problem_text}</p>
                            {!p.is_correct && p.correct_answer && (
                              <p className="text-xs text-success-600 mt-1">To'g'ri javob: {p.correct_answer}</p>
                            )}
                            {!p.is_correct && p.error_explanation && (
                              <p className="text-xs text-danger-600 mt-1">{p.error_explanation}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {checkResult.weak_topics?.length > 0 && (
                    <div className="bg-accent-50 rounded-xl p-3">
                      <p className="text-xs font-medium text-accent-700">Mashq kerak: {checkResult.weak_topics.join(', ')}</p>
                    </div>
                  )}
                </>
              )}
              <button onClick={() => { setCheckResult(null); setCapturedImage(null) }}
                className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-medium hover:bg-gray-200 transition">
                Yangi tekshirish
              </button>
            </div>
          )}
        </div>

        {/* === TOPSHIRIQ YUBORISH === */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary-500" /> Topshiriqlar
            </h2>
            <button onClick={() => setShowNewAssignment(!showNewAssignment)}
              className="flex items-center gap-1 text-xs font-medium text-primary-600 bg-primary-50 px-3 py-1.5 rounded-lg hover:bg-primary-100">
              <Plus className="w-4 h-4" /> Yangi
            </button>
          </div>

          {showNewAssignment && (
            <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
              <div>
                <input type="text" value={assignTitle} onChange={e => setAssignTitle(e.target.value)}
                  placeholder="Topshiriq nomi (masalan: 5-bob, 3-mashq) *"
                  className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 ${!assignTitle.trim() ? 'border-red-300 bg-red-50/30' : 'border-gray-200'}`} />
                {!assignTitle.trim() && (
                  <p className="text-[10px] text-red-500 mt-0.5">Topshiriq nomi majburiy</p>
                )}
              </div>
              <textarea value={assignDesc} onChange={e => setAssignDesc(e.target.value)}
                placeholder="Topshiriq matni (ixtiyoriy)"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Sinf</label>
                  <select value={assignGrade} onChange={e => setAssignGrade(Number(e.target.value))}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm bg-white">
                    {Array.from({ length: 11 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}-sinf</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Fan</label>
                  <input type="text" value={assignSubject} onChange={e => setAssignSubject(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm" />
                </div>
              </div>
              {/* Rasm/fayl yuklash */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Rasm yoki fayl (ixtiyoriy)</label>
                <input ref={assignImageRef} type="file" accept="image/*,application/pdf"
                  onChange={e => setAssignImage(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100" />
                {assignImage && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{assignImage.name}</span>
                    <button onClick={() => { setAssignImage(null); if (assignImageRef.current) assignImageRef.current.value = '' }}
                      className="text-xs text-red-500">O'chirish</button>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setShowNewAssignment(false); setAssignImage(null) }}
                  className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100">Bekor</button>
                <button onClick={handleCreateAssignment} disabled={assignSaving || !assignTitle.trim()}
                  className="flex-1 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-40 flex items-center justify-center gap-1">
                  {assignSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Yuborish
                </button>
              </div>
            </div>
          )}

          {assignments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-3">Hali topshiriq yo'q</p>
          ) : (
            <div className="space-y-2">
              {assignments.slice(0, 5).map(a => (
                <div key={a.id} className="flex items-start justify-between p-2.5 rounded-lg border border-gray-100 bg-gray-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">{a.title}</p>
                    {a.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{a.description}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">{a.grade}-sinf | {a.subject} | {new Date(a.created_at).toLocaleDateString('uz')}</p>
                  </div>
                  <button onClick={() => handleDeleteAssignment(a.id)} className="p-1 text-gray-400 hover:text-red-500 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Users} title="O'quvchilar" value={totalStudents} color="blue" />
          <StatCard icon={BookCheck} title="Bugun" value={`${globalStats?.today_submissions || 0} ta`} color="green" />
          <StatCard icon={TrendingUp} title="O'rtacha ball" value={`${avgScore}%`} color="yellow" />
          <StatCard icon={Clock} title="Jami tekshiruv" value={globalStats?.total_submissions || 0} color="purple" />
        </div>

        {/* Risk tahlili */}
        {riskData && (riskData.green?.length > 0 || riskData.yellow?.length > 0 || riskData.red?.length > 0) && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-gray-800">O'quvchilar tahlili</h2>
            {riskData.green?.length > 0 && (
              <div className="bg-success-50 rounded-xl p-4 border border-success-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-success-500 rounded-full" />
                  <p className="text-sm font-semibold text-success-800">A'lochi ({riskData.green.length})</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {riskData.green.map(s => (
                    <Link key={s.telegram_id} to={`/teacher/student/${s.telegram_id}`}
                      className="bg-white px-3 py-1.5 rounded-lg text-xs hover:shadow transition">
                      <span className="font-medium text-gray-700">{s.name}</span>
                      <span className="text-success-600 ml-1 font-bold">{s.avg_score}%</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {riskData.yellow?.length > 0 && (
              <div className="bg-accent-50 rounded-xl p-4 border border-accent-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-accent-500 rounded-full" />
                  <p className="text-sm font-semibold text-accent-800">O'rtacha ({riskData.yellow.length})</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {riskData.yellow.map(s => (
                    <Link key={s.telegram_id} to={`/teacher/student/${s.telegram_id}`}
                      className="bg-white px-3 py-1.5 rounded-lg text-xs hover:shadow transition">
                      <span className="font-medium text-gray-700">{s.name}</span>
                      <span className="text-accent-600 ml-1 font-bold">{s.avg_score}%</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {riskData.red?.length > 0 && (
              <div className="bg-danger-50 rounded-xl p-4 border border-danger-200">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-danger-500 rounded-full" />
                  <p className="text-sm font-semibold text-danger-800">Yordam kerak ({riskData.red.length})</p>
                </div>
                <div className="space-y-2">
                  {riskData.red.map(s => (
                    <Link key={s.telegram_id} to={`/teacher/student/${s.telegram_id}`}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-lg hover:shadow transition">
                      <span className="text-sm font-medium text-gray-700">{s.name}</span>
                      <span className="text-sm font-bold text-danger-500">{s.avg_score}%</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* O'quvchilar ro'yxati (faqat real) */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-800 mb-3">O'quvchilar ({totalStudents})</h2>
          {students.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Hali o'quvchi ro'yxatdan o'tmagan</p>
          ) : (
            <div className="space-y-2">
              {students.sort((a, b) => (b.avg_score || 0) - (a.avg_score || 0)).map(s => (
                <Link key={s.id} to={`/teacher/student/${s.telegram_id}`}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-blue-50/30 transition block">
                  <div className="flex items-center gap-2">
                    <img src={s.gender === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'}
                      alt="" className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{s.full_name}</p>
                      <p className="text-[10px] text-gray-400">{s.grade}-sinf | {s.subject} | {s.submission_count || 0} tekshiruv</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold ${
                    (s.avg_score || 0) >= 80 ? 'text-success-500' : (s.avg_score || 0) >= 60 ? 'text-accent-500' : 'text-danger-500'
                  }`}>{s.avg_score || 0}%</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Oxirgi tekshiruvlar */}
        {recentSubs.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Oxirgi tekshiruvlar</h2>
            <div className="space-y-2">
              {recentSubs.map(sub => (
                <div key={sub.id} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <img src={sub.student_gender === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'}
                      alt="" className="w-7 h-7 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">{sub.student_name}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(sub.created_at).toLocaleString('uz')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-bold ${
                      sub.score >= 80 ? 'text-success-500' : sub.score >= 60 ? 'text-accent-500' : 'text-danger-500'
                    }`}>{sub.score}%</span>
                    <p className="text-xs text-gray-400">{sub.correct_count}/{sub.total_problems}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mavzu xatolari */}
        {topicErrors.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-800 mb-3">Mavzu bo'yicha xatolar</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topicErrors}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="topic" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Xatolar" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      {showExitRating && <RatingModal onClose={() => { setShowExitRating(false); doExit() }} />}
    </div>
  )
}
