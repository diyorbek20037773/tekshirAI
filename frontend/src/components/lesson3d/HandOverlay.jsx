import { useRef, useEffect, useCallback } from 'react'

const HAND_CONN = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
]
const TIPS = new Set([4, 8, 12, 16, 20])

export default function HandOverlay({ landmarks, gesture, pinchHoldMs, hand1PinchMid, thumbPinkyHoldMs }) {
  const canvasRef = useRef(null)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    const mx = x => (1 - x) * W
    const my = y => y * H

    if (landmarks?.length) {
      landmarks.forEach((hand, hi) => {
        if (!hand?.length) return
        const color = hi === 0 ? 'rgba(0,212,255,0.65)' : 'rgba(0,255,136,0.65)'
        ctx.strokeStyle = color; ctx.lineWidth = 1.0
        HAND_CONN.forEach(([a, b]) => {
          if (!hand[a] || !hand[b]) return
          ctx.beginPath()
          ctx.moveTo(mx(hand[a].x), my(hand[a].y))
          ctx.lineTo(mx(hand[b].x), my(hand[b].y))
          ctx.stroke()
        })
        hand.forEach((pt, i) => {
          if (!pt) return
          const isTip = TIPS.has(i)
          ctx.beginPath()
          ctx.arc(mx(pt.x), my(pt.y), isTip ? 2.5 : 1.5, 0, Math.PI * 2)
          ctx.fillStyle = isTip ? '#ff4757' : (hi === 0 ? '#00d4ff' : '#00ff88')
          ctx.fill()
        })
      })
    }

    if (hand1PinchMid && pinchHoldMs > 0) {
      const px = mx(hand1PinchMid.x); const py = my(hand1PinchMid.y)
      const progress = Math.min(1, pinchHoldMs / 1000)
      const isComplete = progress >= 1
      ctx.beginPath(); ctx.arc(px, py, 20, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2.5; ctx.stroke()
      if (progress > 0) {
        ctx.beginPath()
        ctx.arc(px, py, 20, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2)
        ctx.strokeStyle = isComplete ? '#ff0000' : `rgba(255,${100 - Math.round(progress * 100)},${100 - Math.round(progress * 100)},0.95)`
        ctx.lineWidth = 2.5; ctx.stroke()
      }
      ctx.beginPath(); ctx.arc(px, py, isComplete ? 7 : 4, 0, Math.PI * 2)
      ctx.fillStyle = isComplete ? '#ff0000' : `rgba(255,70,70,${0.5 + progress * 0.5})`; ctx.fill()
    }

    if ((gesture === 'NEXT_MODEL' || gesture === 'PREV_MODEL') && thumbPinkyHoldMs > 0) {
      const progress = Math.min(1, thumbPinkyHoldMs / 1500)
      const label = gesture === 'NEXT_MODEL' ? '→ Keyingisi' : '← Oldingisi'
      const cx = W / 2, cy = H - 65, barW = 180
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.roundRect(cx - barW / 2 - 16, cy - 20, barW + 32, 46, 8); ctx.fill()
      ctx.font = 'bold 14px monospace'
      ctx.fillStyle = `rgba(0,212,255,${0.5 + progress * 0.5})`
      ctx.textAlign = 'center'; ctx.fillText(label, cx, cy + 1)
      ctx.fillStyle = 'rgba(255,255,255,0.1)'
      ctx.roundRect(cx - barW / 2, cy + 12, barW, 5, 2); ctx.fill()
      ctx.fillStyle = progress >= 1 ? '#00ff88' : '#00d4ff'
      ctx.roundRect(cx - barW / 2, cy + 12, barW * progress, 5, 2); ctx.fill()
    }
  }, [landmarks, gesture, pinchHoldMs, hand1PinchMid, thumbPinkyHoldMs])

  const drawRef = useRef(draw)
  useEffect(() => { drawRef.current = draw }, [draw])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      const ctx = canvas.getContext('2d')
      ctx.scale(dpr, dpr)
      drawRef.current?.()
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => { draw() }, [draw])

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 50 }} />
  )
}
