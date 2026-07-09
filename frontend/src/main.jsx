import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './index.css'

// Telegram webview ichida faqat initData bo'sh bo'lmaydi.
const isTelegram = Boolean(window.Telegram?.WebApp?.initData)

// Telegram WebApp SDK — ilovani tayyor ekanligini xabar berish
if (window.Telegram?.WebApp) {
  window.Telegram.WebApp.ready()
  window.Telegram.WebApp.expand()
}

// Service worker'ni FAQAT oddiy brauzerda ro'yxatga olamiz — Telegram ichida umuman emas,
// shunda mini app oqimi (kamera, MediaPipe, GLB) hech qanday o'zgarmaydi.
if (!isTelegram && 'serviceWorker' in navigator) {
  const updateSW = registerSW({
    onNeedRefresh() {
      // Yangi versiya tayyor — foydalanuvchi xohlasa yangilaydi.
      window.dispatchEvent(new CustomEvent('pwa:need-refresh'))
    },
    onOfflineReady() {},
  })
  window.__updateSW = updateSW
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
