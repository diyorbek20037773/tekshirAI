import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, BookOpen, Trophy, Flame, Star, Target, Compass, RefreshCw, Lightbulb, GraduationCap, Shield, Crown } from 'lucide-react'

const LEVEL_INFO = [
  { level: 1, name: "Boshlang'ich", emoji: '🌱', xp: 0 },
  { level: 2, name: 'Harakat qiluvchi', emoji: '⭐', xp: 100 },
  { level: 3, name: 'Bilimdon', emoji: '📚', xp: 300 },
  { level: 4, name: "Ustoz yo'lida", emoji: '🎯', xp: 600 },
  { level: 5, name: 'Akademik', emoji: '🏅', xp: 1000 },
  { level: 6, name: 'Professor', emoji: '🎓', xp: 2000 },
  { level: 7, name: 'Olim', emoji: '🧪', xp: 5000 },
]

export default function StudentProfile() {
  const name = localStorage.getItem('studentName') || "O'quvchi"
  const username = localStorage.getItem('studentUsername') || ''
  const subject = localStorage.getItem('studentSubject') || 'Matematika'
  const grade = localStorage.getItem('studentGrade') || '7'
  const telegramId = localStorage.getItem('telegramId')
  const studentGender = localStorage.getItem('studentGender') || 'male'
  const avatarSrc = studentGender === 'female' ? '/avatars/girl.jpg' : '/avatars/boy.jpg'

  const [profile, setProfile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [careerPrediction, setCareerPrediction] = useState(null)
  const [careerLoading, setCareerLoading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!telegramId || telegramId === '0') {
      setLoading(false)
      return
    }
    Promise.all([
      fetch(`/api/users/me?telegram_id=${telegramId}`).then(r => r.json()).catch(() => null),
      fetch(`/api/analysis/student/${telegramId}`).then(r => r.json()).catch(() => null),
    ]).then(([profileData, analysisData]) => {
      if (profileData) setProfile(profileData)
      if (analysisData?.total_submissions > 0) setAnalysis(analysisData)
    }).finally(() => setLoading(false))
  }, [telegramId])

  const fetchCareer = async () => {
    if (!telegramId || telegramId === '0') return
    setCareerLoading(true)
    try {
      const r = await fetch(`/api/analysis/career-prediction/${telegramId}`)
      const data = await r.json()
      if (data.career_directions) setCareerPrediction(data)
    } catch (e) { /* ignore */ }
    finally { setCareerLoading(false) }
  }

  const levelInfo = LEVEL_INFO.find(l => l.level === (profile?.level || 1)) || LEVEL_INFO[0]
  const nextLevel = LEVEL_INFO.find(l => l.level === (profile?.level || 1) + 1)
  const xp = profile?.xp || 0
  const xpProgress = nextLevel ? Math.min(100, ((xp - levelInfo.xp) / (nextLevel.xp - levelInfo.xp)) * 100) : 100

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link to="/student" className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-bold text-gray-800">Mening profilim</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-200 border-t-primary-500 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Shaxsiy ma'lumotlar */}
            <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-5 text-white">
              <div className="flex items-center gap-4">
                <img src={avatarSrc} alt="Avatar" className="w-20 h-20 rounded-full object-cover border-3 border-white/30 shadow-lg" />
                <div>
                  <h2 className="text-xl font-bold">{name}</h2>
                  {username && <p className="text-primary-100 text-sm">@{username}</p>}
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{grade}-sinf</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">{subject}</span>
                  </div>
                </div>
              </div>
              {profile?.is_premium && (
                <div className="mt-3 flex items-center gap-1 bg-yellow-500/20 px-3 py-1.5 rounded-lg">
                  <Crown className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs text-yellow-100 font-medium">Premium obunachi</span>
                </div>
              )}
            </div>

            {/* Gamification */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" /> Yutuqlarim
              </h3>
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-purple-50 rounded-lg">
                  <p className="text-2xl">{levelInfo.emoji}</p>
                  <p className="text-xs font-bold text-purple-700">Level {profile?.level || 1}</p>
                  <p className="text-[10px] text-purple-500">{levelInfo.name}</p>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded-lg">
                  <Star className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-blue-700">{xp} XP</p>
                  <p className="text-[10px] text-blue-500">Tajriba</p>
                </div>
                <div className="text-center p-2 bg-orange-50 rounded-lg">
                  <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-orange-700">{profile?.streak_days || 0} kun</p>
                  <p className="text-[10px] text-orange-500">Streak</p>
                </div>
              </div>
              {/* XP progress */}
              {nextLevel && (
                <div>
                  <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                    <span>{levelInfo.emoji} {levelInfo.name}</span>
                    <span>{nextLevel.emoji} {nextLevel.name}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all"
                      style={{ width: `${xpProgress}%` }}></div>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 text-center">{nextLevel.xp - xp} XP kerak keyingi daraja uchun</p>
                </div>
              )}
              {/* Nishonlar */}
              {profile?.badges?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-600 mb-2">Nishonlar:</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.badges.map((b, i) => (
                      <span key={i} className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full border border-yellow-200">
                        {b.emoji || '🏅'} {b.name || b}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Statistika */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-green-500" /> Statistika
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">{profile?.total_submissions || analysis?.total_submissions || 0}</p>
                  <p className="text-[10px] text-gray-500">Jami tekshiruvlar</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">{analysis?.overall_score || 0}%</p>
                  <p className="text-[10px] text-gray-500">O'rtacha ball</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-green-600">{profile?.total_correct || 0}</p>
                  <p className="text-[10px] text-gray-500">To'g'ri javoblar</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-800">{analysis ? Object.keys(analysis.subjects || {}).length : 0}</p>
                  <p className="text-[10px] text-gray-500">Fanlar soni</p>
                </div>
              </div>
              {/* Kuchli va zaif tomonlar */}
              {analysis && (
                <div className="mt-3 space-y-2">
                  {analysis.strong_topics?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] text-green-600 font-medium">Kuchli:</span>
                      {analysis.strong_topics.map((t, i) => (
                        <span key={i} className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  )}
                  {analysis.weak_topics?.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] text-red-600 font-medium">Zaif:</span>
                      {analysis.weak_topics.map((t, i) => (
                        <span key={i} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Kasb yo'nalishi */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-purple-500" /> Kasb yo'nalishi
                </h3>
                {!careerLoading && (
                  <button onClick={fetchCareer}
                    className="flex items-center gap-1 text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg hover:bg-purple-100 transition">
                    <RefreshCw className="w-3 h-3" />
                    {careerPrediction ? 'Yangilash' : 'Aniqlash'}
                  </button>
                )}
              </div>
              {careerLoading ? (
                <div className="text-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-200 border-t-purple-500 mx-auto"></div>
                  <p className="text-xs text-gray-400 mt-2">AI tahlil qilmoqda...</p>
                </div>
              ) : careerPrediction?.career_directions?.length > 0 ? (
                <div className="space-y-3">
                  {careerPrediction.career_directions.map((c, i) => (
                    <div key={i} className="border border-gray-100 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{c.career_emoji}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{c.career_name}</p>
                            <p className="text-xs text-gray-500">{c.reason}</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">{c.match_score}%</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {c.key_subjects?.map((s, j) => (
                          <span key={j} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                      <div className="mt-2 flex items-start gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-gray-600">{c.advice}</p>
                      </div>
                      <div className="mt-2 w-full bg-gray-100 rounded-full h-1.5">
                        <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-1.5 rounded-full"
                          style={{ width: `${c.match_score}%` }}></div>
                      </div>
                    </div>
                  ))}
                  {careerPrediction.overall_summary && (
                    <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                      <div className="flex items-center gap-1 mb-1">
                        <GraduationCap className="w-4 h-4 text-purple-600" />
                        <p className="text-xs font-semibold text-purple-700">Xulosa</p>
                      </div>
                      <p className="text-xs text-purple-600">{careerPrediction.overall_summary}</p>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 text-center">Bu AI tavsiyasi — yakuniy baho emas.</p>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Compass className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-400">"Aniqlash" tugmasini bosing — AI kasb yo'nalishingizni tahlil qiladi</p>
                </div>
              )}
            </div>

            {/* Ota-ona bog'lanishi */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-500" /> Ota-ona bog'lanishi
              </h3>
              {profile?.parent_id ? (
                <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">Ota-ona bog'langan</p>
              ) : (
                <p className="text-xs text-gray-500">Hali bog'lanmagan. Ota-onangiz Telegram botda /connect buyrug'ini yuborishi kerak.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
