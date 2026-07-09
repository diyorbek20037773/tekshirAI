import { useState, useEffect } from 'react'

// Brauzerda "Bosh ekranga o'rnatish" taklifi. Telegram ichida va allaqachon
// o'rnatilgan (standalone) holatda ko'rsatilmaydi.
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const isTelegram = Boolean(window.Telegram?.WebApp?.initData)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
    if (isTelegram || isStandalone || localStorage.getItem('pwaInstallDismissed')) return

    const onPrompt = (e) => {
      e.preventDefault()
      setDeferred(e)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onPrompt)
  }, [])

  const install = async () => {
    if (!deferred) return
    deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setVisible(false)
  }

  const dismiss = () => {
    localStorage.setItem('pwaInstallDismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-3" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
      <div className="mx-auto max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-3 flex items-center gap-3">
        <img src="/pwa-192x192.png" alt="" className="w-11 h-11 rounded-xl flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800">TekshirAI ilovasini o'rnating</p>
          <p className="text-xs text-gray-400">Bosh ekrandan bir bosishda oching</p>
        </div>
        <button onClick={dismiss} className="text-gray-400 text-sm px-2 py-2">Keyinroq</button>
        <button
          onClick={install}
          className="bg-primary-600 text-white text-sm font-semibold px-4 py-2 rounded-xl active:scale-95 transition"
        >
          O'rnatish
        </button>
      </div>
    </div>
  )
}
