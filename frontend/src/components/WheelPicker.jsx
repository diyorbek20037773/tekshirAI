import { useRef, useEffect, useCallback, useState } from 'react'

export default function WheelPicker({
  items = [],
  selectedValue,
  onSelect,
  itemHeight = 44,
  visibleItems = 5,
}) {
  const containerRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const dragging = useRef(false)
  const startY = useRef(0)
  const startIndex = useRef(0)
  const velocity = useRef(0)
  const lastY = useRef(0)
  const lastTime = useRef(0)
  const animFrame = useRef(null)

  const padCount = Math.floor(visibleItems / 2)
  const containerHeight = visibleItems * itemHeight

  const clampIndex = useCallback((idx) => {
    return Math.max(0, Math.min(items.length - 1, Math.round(idx)))
  }, [items.length])

  useEffect(() => {
    const idx = items.findIndex(i => i.value === selectedValue)
    if (idx >= 0) setCurrentIndex(idx)
  }, [selectedValue, items])

  const selectIndex = useCallback((idx) => {
    const clamped = clampIndex(idx)
    setCurrentIndex(clamped)
    if (items[clamped] && items[clamped].value !== selectedValue) {
      onSelect(items[clamped].value)
    }
  }, [items, selectedValue, onSelect, clampIndex])

  const getY = (e) => {
    if (e.touches && e.touches.length > 0) return e.touches[0].clientY
    if (e.changedTouches && e.changedTouches.length > 0) return e.changedTouches[0].clientY
    return e.clientY
  }

  const handleStart = useCallback((e) => {
    dragging.current = true
    velocity.current = 0
    cancelAnimationFrame(animFrame.current)
    const y = getY(e)
    startY.current = y
    lastY.current = y
    lastTime.current = Date.now()
    startIndex.current = currentIndex
  }, [currentIndex])

  const handleMove = useCallback((e) => {
    if (!dragging.current) return
    e.preventDefault()
    const y = getY(e)
    const now = Date.now()
    const dt = now - lastTime.current
    if (dt > 0) {
      velocity.current = (lastY.current - y) / dt
    }
    lastY.current = y
    lastTime.current = now

    const diff = (startY.current - y) / itemHeight
    const newIndex = clampIndex(startIndex.current + diff)
    setCurrentIndex(newIndex)
  }, [itemHeight, clampIndex])

  const handleEnd = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false

    const v = velocity.current
    const momentum = v * 150
    const momentumItems = momentum / itemHeight
    const targetIndex = clampIndex(Math.round(currentIndex + momentumItems))

    const startIdx = currentIndex
    const startTime = Date.now()
    const duration = 300

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(1, elapsed / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const idx = startIdx + (targetIndex - startIdx) * eased

      setCurrentIndex(idx)
      if (progress < 1) {
        animFrame.current = requestAnimationFrame(animate)
      } else {
        setCurrentIndex(targetIndex)
        selectIndex(targetIndex)
      }
    }
    animFrame.current = requestAnimationFrame(animate)
  }, [currentIndex, itemHeight, clampIndex, selectIndex])

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    cancelAnimationFrame(animFrame.current)
    const direction = e.deltaY > 0 ? 1 : -1
    selectIndex(clampIndex(Math.round(currentIndex) + direction))
  }, [currentIndex, clampIndex, selectIndex])

  const handleItemClick = useCallback((index) => {
    if (Math.abs(currentIndex - Math.round(currentIndex)) > 0.1) return
    selectIndex(index)
  }, [currentIndex, selectIndex])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const opts = { passive: false }
    el.addEventListener('touchstart', handleStart, opts)
    el.addEventListener('touchmove', handleMove, opts)
    el.addEventListener('touchend', handleEnd, opts)
    el.addEventListener('mousedown', handleStart, opts)
    el.addEventListener('wheel', handleWheel, opts)

    const onMouseMove = (e) => handleMove(e)
    const onMouseUp = () => handleEnd()
    document.addEventListener('mousemove', onMouseMove, opts)
    document.addEventListener('mouseup', onMouseUp)

    return () => {
      el.removeEventListener('touchstart', handleStart)
      el.removeEventListener('touchmove', handleMove)
      el.removeEventListener('touchend', handleEnd)
      el.removeEventListener('mousedown', handleStart)
      el.removeEventListener('wheel', handleWheel)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      cancelAnimationFrame(animFrame.current)
    }
  }, [handleStart, handleMove, handleEnd, handleWheel])

  const getItemStyle = (index) => {
    const distance = Math.abs(index - currentIndex)
    const scale = Math.max(0.85, 1 - distance * 0.08)
    const opacity = Math.max(0.15, 1 - distance * 0.35)

    if (distance < 0.5) return {
      opacity: 1, transform: `scale(${scale})`,
      fontSize: '18px', fontWeight: 600, color: '#111827',
    }
    if (distance < 1.5) return {
      opacity, transform: `scale(${scale})`,
      fontSize: '15px', fontWeight: 400, color: '#6b7280',
    }
    return {
      opacity, transform: `scale(${scale})`,
      fontSize: '14px', fontWeight: 400, color: '#9ca3af',
    }
  }

  const offset = (padCount - currentIndex) * itemHeight

  return (
    <div
      ref={containerRef}
      className="relative rounded-xl overflow-hidden bg-white border border-gray-200 cursor-grab active:cursor-grabbing select-none touch-none"
      style={{ height: containerHeight }}
    >
      {/* Highlight bar - z-0, behind everything */}
      <div
        className="absolute left-0 right-0 border-t border-b border-success-500/30 pointer-events-none"
        style={{
          top: padCount * itemHeight,
          height: itemHeight,
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          zIndex: 0,
        }}
      />

      {/* Items container - z-10, above highlight */}
      <div
        className="absolute left-0 right-0"
        style={{
          transform: `translateY(${offset}px)`,
          willChange: 'transform',
          zIndex: 10,
        }}
      >
        {items.map((item, index) => (
          <div
            key={item.value}
            className="flex items-center justify-center"
            style={{ height: itemHeight, ...getItemStyle(index) }}
            onClick={() => handleItemClick(index)}
          >
            {item.label}
          </div>
        ))}
      </div>

      {/* Top fade - z-20, above items for fade effect */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: padCount * itemHeight,
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(255,255,255,0))',
          zIndex: 20,
        }}
      />

      {/* Bottom fade - z-20 */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: padCount * itemHeight,
          background: 'linear-gradient(to top, rgba(255,255,255,0.95), rgba(255,255,255,0))',
          zIndex: 20,
        }}
      />
    </div>
  )
}
