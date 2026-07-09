import { useState, useEffect } from 'react'
import { Fingerprint, Check, Loader2 } from 'lucide-react'
import { startRegistration } from '@simplewebauthn/browser'
import api from '../api/client'

// Profil sahifasidagi "Biometrikani yoqish" — parol bilan kirgan brauzer foydalanuvchisi
// qurilmasini (Face ID / Touch ID / barmoq izi) bog'laydi. Telegram/qo'llab-quvvatlamaydigan
// qurilmada ko'rinmaydi.
export default function BiometricEnroll() {
  const [supported, setSupported] = useState(false)
  const [enrolled, setEnrolled] = useState(Boolean(localStorage.getItem('hasPasskey')))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const isTelegram = Boolean(window.Telegram?.WebApp?.initData)
    const hasToken = Boolean(localStorage.getItem('token'))
    if (isTelegram || !hasToken || typeof window.PublicKeyCredential === 'undefined') return
    window.PublicKeyCredential
      .isUserVerifyingPlatformAuthenticatorAvailable()
      .then((ok) => setSupported(Boolean(ok)))
      .catch(() => setSupported(false))
  }, [])

  if (!supported) return null

  const enroll = async () => {
    setError('')
    setLoading(true)
    try {
      const { data: options } = await api.post('/auth/webauthn/register/begin')
      const attResp = await startRegistration({ optionsJSON: options })
      await api.post('/auth/webauthn/register/finish', attResp)
      localStorage.setItem('hasPasskey', '1')
      setEnrolled(true)
    } catch (err) {
      setError(err.response?.data?.detail || "Yoqib bo'lmadi, qayta urinib ko'ring")
    }
    setLoading(false)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
          <Fingerprint className="w-5 h-5 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">Biometrika bilan kirish</p>
          <p className="text-xs text-gray-400">Face ID / barmoq izi bilan tez kiring</p>
        </div>
        {enrolled ? (
          <span className="flex items-center gap-1 text-success-600 text-sm font-medium">
            <Check className="w-4 h-4" /> Yoqilgan
          </span>
        ) : (
          <button onClick={enroll} disabled={loading}
            className="bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 transition disabled:opacity-40 flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />} Yoqish
          </button>
        )}
      </div>
      {error && <p className="text-xs text-danger-500 mt-2">{error}</p>}
    </div>
  )
}
