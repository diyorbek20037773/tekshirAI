import { useEffect, useRef } from 'react'

const CONN = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
]
const TIP = new Set([4, 8, 12, 16, 20])
const GESTURE_ICON = { ROTATE: '✋', ZOOM: '↔️', PINCH_SELECT: '🤏', EXPLODE_TOGGLE: '✊', DESELECT: '🤙', IDLE: '' }

export default function CameraFeed({ videoRef, landmarks, gesture, pinchNorm, isTracking, handsCount, fps, error, status }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)
    if (!landmarks?.length) return

    ctx.save(); ctx.scale(-1, 1); ctx.translate(-W, 0)

    landmarks.forEach((hand, hi) => {
      if (!hand?.length) return
      const color = hi === 0 ? 'rgba(0,212,255,0.8)' : 'rgba(0,255,136,0.8)'
      ctx.strokeStyle = color; ctx.lineWidth = 1.8
      CONN.forEach(([a, b]) => {
        if (!hand[a] || !hand[b]) return
        ctx.beginPath()
        ctx.moveTo(hand[a].x * W, hand[a].y * H)
        ctx.lineTo(hand[b].x * W, hand[b].y * H)
        ctx.stroke()
      })
      hand.forEach((pt, i) => {
        if (!pt) return
        ctx.beginPath()
        ctx.arc(pt.x * W, pt.y * H, TIP.has(i) ? 5 : 3, 0, Math.PI * 2)
        ctx.fillStyle = TIP.has(i) ? '#ff4757' : (hi === 0 ? '#00d4ff' : '#00ff88')
        ctx.fill()
      })
    })

    if (landmarks[0]?.length >= 9) {
      const h = landmarks[0]
      const isPinching = pinchNorm < 0.4
      ctx.strokeStyle = isPinching ? '#ff4444' : 'rgba(255,255,255,0.25)'
      ctx.lineWidth = isPinching ? 2 : 1
      ctx.setLineDash([3, 3])
      ctx.beginPath()
      ctx.moveTo(h[4].x * W, h[4].y * H)
      ctx.lineTo(h[8].x * W, h[8].y * H)
      ctx.stroke()
      ctx.setLineDash([])
    }
    ctx.restore()
  }, [landmarks, pinchNorm])

  const statusColors = { idle: '#444', loading: '#ffd700', active: '#00ff88', error: '#ff4444' }
  const statusLabels = { idle: 'TAYYOR', loading: 'YUKLANMOQDA', active: 'AKTIV', error: 'XATO' }
  const sc = statusColors[status] || '#444'
  const sl = statusLabels[status] || status

  return (
    <div style={{
      position: 'fixed', top: 16, right: 16,
      width: 240, height: 190, borderRadius: 12, overflow: 'hidden',
      border: `1px solid ${error ? '#ff4444' : 'rgba(0,212,255,0.5)'}`,
      boxShadow: `0 0 16px ${error ? 'rgba(255,68,68,0.15)' : 'rgba(0,212,255,0.1)'}`,
      background: '#000', zIndex: 100,
    }}>
      <div style={{ position: 'absolute', top: 8, left: 8, zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '2px 8px', borderRadius: 5, fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em', color: '#00d4ff', fontWeight: 700 }}>
        QO'L KUZATUVI
      </div>
      {fps > 0 && (
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, background: 'rgba(0,0,0,0.7)', padding: '2px 7px', borderRadius: 5, fontSize: 9, fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>
          {fps} FPS
        </div>
      )}
      {handsCount > 0 && (
        <div style={{ position: 'absolute', top: 30, left: 8, zIndex: 10, background: 'rgba(0,212,255,0.12)', border: '1px solid rgba(0,212,255,0.35)', padding: '2px 7px', borderRadius: 5, fontSize: 9, fontFamily: 'monospace', color: '#00d4ff' }}>
          ✋×{handsCount}
        </div>
      )}
      {isTracking && (
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: 60 }}>
          <div style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: 2 }}>PINCH</div>
          <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
            <div style={{ width: `${(1 - pinchNorm) * 100}%`, height: '100%', background: pinchNorm < 0.3 ? '#ff4444' : '#00d4ff', borderRadius: 2, transition: 'width 0.1s' }} />
          </div>
        </div>
      )}
      <video ref={videoRef} autoPlay muted playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
      <canvas ref={canvasRef} width={240} height={190}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.82)', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontFamily: 'monospace' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', flexShrink: 0, background: sc, boxShadow: status === 'active' ? `0 0 6px ${sc}` : 'none' }} />
        <span style={{ color: sc, fontWeight: 600 }}>{sl}</span>
        {gesture && gesture !== 'IDLE' && <span style={{ color: '#ffd700', marginLeft: 4 }}>{GESTURE_ICON[gesture] || gesture}</span>}
        {error && <span style={{ color: '#ff8888', fontSize: 9 }} title={error}>⚠ {error.slice(0, 20)}</span>}
      </div>
    </div>
  )
}
