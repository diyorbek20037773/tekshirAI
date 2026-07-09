import { useState, useEffect } from 'react'
import { Fingerprint, Loader2 } from 'lucide-react'
import { startAuthentication } from '@simplewebauthn/browser'
import api from '../api/client'

// /login sahifasidagi "Face ID / barmoq bilan kirish" tugmasi.
// Faqat platform authenticator (Touch ID / Face ID / Windows Hello) bor va
// Telegram tashqarisida bo'lsa ko'rinadi. Parol doim asosiy yo'l.
export default function BiometricLogin({ username, onSuccess }) {
  const [supported, setSupported] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const isTelegram = Boolean(window.Telegram?.WebApp?.initData)
    if (isTelegram || typeof window.PublicKeyCredential === 'undefined') return
    window.PublicKeyCredential
      .isUserVerifyingPlatformAuthenticatorAvailable()
      .then((ok) => setSupported(Boolean(ok)))
      .catch(() => setSupported(false))
  }, [])

  if (!supported) return null

  const login = async () => {
    const uname = (username || '').trim()
    if (!uname) {
      setError('Avval foydalanuvchi nomini kiriting')
      return
    }
    setError('')
    setLoading(true)
    try {
      const { data: begin } = await api.post('/auth/webauthn/auth/begin', { username: uname })
      const asseResp = await startAuthentication({ optionsJSON: begin.options })
      const { data } = await api.post('/auth/webauthn/auth/finish', {
        handle: begin.handle,
        credential: asseResp,
      })
      onSuccess(data)
    } catch (err) {
      setError(err.response?.data?.detail || "Biometrika bilan kirib bo'lmadi")
      setLoading(false)
    }
  }

  return (
    <div className="mt-4">
      <div className="flex items-center gap-3 my-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400">yoki</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>
      <button type="button" onClick={login} disabled={loading}
        className="w-full border border-primary-200 text-primary-700 py-3 rounded-xl font-semibold hover:bg-primary-50 transition disabled:opacity-40 flex items-center justify-center gap-2">
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Fingerprint className="w-5 h-5" />}
        Face ID / barmoq bilan kirish
      </button>
      {error && <p className="text-xs text-danger-500 text-center mt-2">{error}</p>}
    </div>
  )
}
