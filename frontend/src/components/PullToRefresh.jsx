import { useEffect, useRef, useState } from 'react'
import { RefreshCw } from 'lucide-react'

/**
 * Pull-to-refresh komponenti — foydalanuvchi tepadan pastga tortganda sahifani yangilaydi.
 * Telegram WebApp va barcha mobil brauzerlarda ishlaydi.
 */
export default function PullToRefresh({ children, onRefresh }) {
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startYRef = useRef(0)
  const isPullingRef = useRef(false)

  const THRESHOLD = 80 // Yangilash uchun kerakli masofa

  useEffect(() => {
    const handleTouchStart = (e) => {
      // Faqat sahifa tepasida bo'lsak
      if (window.scrollY > 0) return
      startYRef.current = e.touches[0].clientY
      isPullingRef.current = true
    }

    const handleTouchMove = (e) => {
      if (!isPullingRef.current || isRefreshing) return
      const currentY = e.touches[0].clientY
      const diff = currentY - startYRef.current

      if (diff > 0 && window.scrollY === 0) {
        // Kamaytirib chiqarish (resistance) — 2.5x sekin
        const dist = Math.min(diff / 2.5, 150)
        setPullDistance(dist)
      }
    }

    const handleTouchEnd = async () => {
      if (!isPullingRef.current) return
      isPullingRef.current = false

      if (pullDistance >= THRESHOLD && !isRefreshing) {
        setIsRefreshing(true)
        try {
          if (onRefresh) {
            await onRefresh()
          } else {
            // Default: sahifani qayta yuklash
            window.location.reload()
          }
        } catch {}
        // Qisqa delay — yangilangan flash ko'rsatish uchun
        setTimeout(() => {
          setIsRefreshing(false)
          setPullDistance(0)
        }, 500)
      } else {
        setPullDistance(0)
      }
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [pullDistance, isRefreshing, onRefresh])

  return (
    <>
      {/* Yangilash indikatori */}
      {(pullDistance > 0 || isRefreshing) && (
        <div
          className="fixed top-0 left-0 right-0 flex items-center justify-center z-50 pointer-events-none transition-all"
          style={{
            height: `${Math.max(pullDistance, isRefreshing ? 60 : 0)}px`,
            opacity: Math.min(pullDistance / THRESHOLD, 1),
          }}
        >
          <div className="bg-white rounded-full shadow-lg p-3">
            <RefreshCw
              className={`w-5 h-5 text-primary-500 ${isRefreshing ? 'animate-spin' : ''}`}
              style={{
                transform: isRefreshing ? undefined : `rotate(${pullDistance * 3}deg)`,
              }}
            />
          </div>
        </div>
      )}

      {/* Kontent — tortilganda pastga surilishi */}
      <div
        style={{
          transform: `translateY(${isRefreshing ? 50 : pullDistance}px)`,
          transition: isPullingRef.current ? 'none' : 'transform 0.3s ease',
        }}
      >
        {children}
      </div>
    </>
  )
}
