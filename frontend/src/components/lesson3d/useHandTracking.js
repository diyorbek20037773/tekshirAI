import { useEffect, useRef, useState, useCallback } from 'react'
import { createLogger } from './logger'

const log = createLogger('HAND')

const clamp   = (v, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v))
const remap01 = (v, from, to) => clamp((v - from) / (to - from))
const expSmooth = (prev, next, alpha) => prev + (next - prev) * alpha
const dist2D = (a, b) => (!a || !b ? 0 : Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2))
const dist3D = (a, b) =>
  !a || !b ? 0 : Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + ((a.z || 0) - (b.z || 0)) ** 2)

const PINCH_CLOSED  = 0.02
const PINCH_OPEN    = 0.28
const PINCH_THRESH  = 0.28
const ALPHA_FAST    = 0.5
const ALPHA_SLOW    = 0.2
const CONFIRM       = 3
const CONFIRM_RESET = 10

function analyzeHand(lm) {
  if (!lm || lm.length < 21) return null
  const rawPinch  = dist3D(lm[4], lm[8])
  const pinchNorm = remap01(rawPinch, PINCH_CLOSED, PINCH_OPEN)
  const isPinch   = pinchNorm < PINCH_THRESH

  const ext = (tip, pip) => lm[tip] && lm[pip] && lm[tip].y < lm[pip].y - 0.03
  const idx = ext(8, 6), mid = ext(12, 10), ring = ext(16, 14), pink = ext(20, 18)
  const extCount = [idx, mid, ring, pink].filter(Boolean).length
  const isOpen      = extCount >= 4
  const isIndexOnly = idx && !mid && !ring && !pink && !isPinch

  const strictFist =
    lm[8]  && lm[6]  && lm[8].y  > lm[6].y  &&
    lm[12] && lm[10] && lm[12].y > lm[10].y &&
    lm[16] && lm[14] && lm[16].y > lm[14].y &&
    lm[20] && lm[18] && lm[20].y > lm[18].y
  const thumbUp = lm[4] && lm[0] && lm[4].y < lm[0].y - 0.13
  const isFist  = !!strictFist && !thumbUp

  const isThumbPinkyTouch  = lm[4] && lm[20] && dist2D(lm[4], lm[20]) < 0.12
  const isMiddleThumbTouch = lm[4] && lm[12] && dist2D(lm[4], lm[12]) < 0.10

  return {
    isPinch, pinchNorm, isOpen, isIndexOnly, isFist,
    isThumbPinkyTouch, isMiddleThumbTouch,
    idx, mid, ring, pink, extCount,
    wrist: lm[0],
    pinchMid: { x: (lm[4].x + lm[8].x) / 2, y: (lm[4].y + lm[8].y) / 2 },
    indexTip: lm[8],
    rawPinchDist: rawPinch,
  }
}

export default function useHandTracking(videoRef) {
  const handsRef   = useRef(null)
  const rafRef     = useRef(null)
  const mountedRef = useRef(true)
  const streamRef  = useRef(null)
  const sm         = useRef({ h1PalmX: 0.5, h1PalmY: 0.5, h1Pinch: 1.0, h2Pinch: 1.0 })
  const buf        = useRef({ name: 'IDLE', count: 0 })
  const resetCnt   = useRef(0)
  const fpsRef     = useRef({ n: 0, last: Date.now(), val: 0 })
  const prevH2Raw  = useRef(null)

  const [state, setState] = useState({
    hand1: null, hand2: null, gesture: 'IDLE',
    h1PalmCenter: { x: 0.5, y: 0.5 },
    h1PinchNorm: 1.0, h2PinchNorm: 1.0, h1PinchMid: null,
    zoomDelta: 0, landmarks: null, scalpelHand: null,
    isTracking: false, handsCount: 0, fps: 0, error: null, status: 'idle',
  })

  const onResults = useCallback((results) => {
    if (!mountedRef.current) return
    fpsRef.current.n++
    const now = Date.now()
    if (now - fpsRef.current.last >= 1000) {
      fpsRef.current.val = fpsRef.current.n; fpsRef.current.n = 0; fpsRef.current.last = now
    }

    const lms = results.multiHandLandmarks
    if (!lms || !lms.length) {
      buf.current = { name: 'IDLE', count: 0 }; resetCnt.current = 0; prevH2Raw.current = null
      setState(s => ({ ...s, landmarks: null, gesture: 'IDLE', hand1: null, hand2: null,
        isTracking: false, handsCount: 0, fps: fpsRef.current.val, zoomDelta: 0, h1PinchMid: null, scalpelHand: null }))
      return
    }

    const h1 = analyzeHand(lms[0])
    const h2 = lms.length >= 2 ? analyzeHand(lms[1]) : null

    sm.current.h1PalmX = expSmooth(sm.current.h1PalmX, h1.wrist.x, ALPHA_SLOW)
    sm.current.h1PalmY = expSmooth(sm.current.h1PalmY, h1.wrist.y, ALPHA_SLOW)
    sm.current.h1Pinch = expSmooth(sm.current.h1Pinch, h1.pinchNorm, ALPHA_FAST)

    let zoomDelta = 0
    if (h2) {
      sm.current.h2Pinch = expSmooth(sm.current.h2Pinch, h2.pinchNorm, ALPHA_FAST)
      const curRaw = h2.rawPinchDist
      if (prevH2Raw.current !== null) zoomDelta = -(curRaw - prevH2Raw.current) * 8
      prevH2Raw.current = curRaw
    } else {
      prevH2Raw.current = null; sm.current.h2Pinch = 1.0
    }

    let raw = 'IDLE'
    if (h2 && h1.isOpen && h2.isOpen) {
      resetCnt.current++
      if (resetCnt.current >= CONFIRM_RESET) raw = 'RESET'
    } else { resetCnt.current = 0 }
    if (raw === 'IDLE' && h2 && h1.isPinch) raw = 'ZOOM'
    if (raw === 'IDLE' && h1.isMiddleThumbTouch && !h2) raw = 'DESELECT'
    if (raw === 'IDLE' && h1.isFist && !h2) raw = 'EXPLODE_TOGGLE'
    if (raw === 'IDLE' && h1.isThumbPinkyTouch && !h2) raw = h1.wrist.x < 0.5 ? 'NEXT_MODEL' : 'PREV_MODEL'
    if (raw === 'IDLE' && h1.isPinch && !h2) raw = 'PINCH_SELECT'
    if (raw === 'IDLE' && h1.isOpen && !h2) raw = 'ROTATE'
    if (raw === 'IDLE' && h1.isIndexOnly && !h2) raw = 'SELECT'

    if (raw !== 'RESET') {
      if (raw === buf.current.name) buf.current.count = Math.min(buf.current.count + 1, CONFIRM + 10)
      else buf.current = { name: raw, count: 1 }
    }
    const confirmed = raw === 'RESET' ? 'RESET' : (buf.current.count >= CONFIRM ? buf.current.name : 'IDLE')

    setState({
      hand1: h1, hand2: h2, handsCount: lms.length, gesture: confirmed,
      h1PalmCenter: { x: sm.current.h1PalmX, y: sm.current.h1PalmY },
      h1PinchNorm: sm.current.h1Pinch, h2PinchNorm: sm.current.h2Pinch,
      h1PinchMid: h1.pinchMid, zoomDelta,
      landmarks: lms, scalpelHand: null,
      isTracking: true, fps: fpsRef.current.val, error: null, status: 'active',
    })
  }, [])

  useEffect(() => {
    mountedRef.current = true
    if (!videoRef?.current) return
    let cancelled = false
    setState(s => ({ ...s, status: 'loading' }))

    async function init() {
      let stream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user', frameRate: { ideal: 30 } },
          audio: false,
        })
        streamRef.current = stream
      } catch (e) {
        if (!cancelled) setState(s => ({ ...s, status: 'error', error: 'Camera: ' + e.message }))
        return
      }
      if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }

      const video = videoRef.current
      video.srcObject = stream; video.muted = true; video.playsInline = true
      try { await video.play() } catch (e) { log.warn(e.message) }
      await new Promise(r => {
        if (video.readyState >= 2) { r(); return }
        video.addEventListener('loadeddata', r, { once: true })
        setTimeout(r, 2000)
      })
      if (cancelled) return

      try { await loadMediaPipe() }
      catch (e) { if (!cancelled) setState(s => ({ ...s, status: 'error', error: 'MediaPipe: ' + e.message })); return }
      if (cancelled) return

      try {
        if (typeof window.Hands !== 'function') throw new Error('Hands not found')
        const hands = new window.Hands({ locateFile: f => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${f}` })
        hands.setOptions({ maxNumHands: 2, modelComplexity: 1, minDetectionConfidence: 0.65, minTrackingConfidence: 0.55 })
        hands.onResults(onResults)
        handsRef.current = hands
      } catch (e) {
        if (!cancelled) setState(s => ({ ...s, status: 'error', error: 'Hands: ' + e.message })); return
      }
      if (cancelled) return

      const loop = async () => {
        if (cancelled) return
        try {
          const v = videoRef.current
          if (v?.readyState >= 2 && v.videoWidth > 0) await handsRef.current.send({ image: v })
        } catch (e) { log.warn(e.message) }
        rafRef.current = requestAnimationFrame(loop)
      }
      rafRef.current = requestAnimationFrame(loop)
      log.info('HAND TRACKING ACTIVE')
    }
    init().catch(e => { if (!cancelled) setState(s => ({ ...s, status: 'error', error: e.message })) })

    return () => {
      cancelled = true; mountedRef.current = false
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      handsRef.current?.close?.().catch(() => {})
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [videoRef, onResults])

  return state
}

function loadMediaPipe() {
  return new Promise((resolve, reject) => {
    if (window.__mp_loaded && typeof window.Hands === 'function') { resolve(); return }
    const load = src => new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return }
      const s = document.createElement('script')
      s.src = src; s.async = false; s.crossOrigin = 'anonymous'
      s.onload = () => res(); s.onerror = () => rej(new Error('Failed: ' + src))
      document.head.appendChild(s)
    })
    const B = 'https://cdn.jsdelivr.net/npm/@mediapipe'
    load(`${B}/hands@0.4.1675469240/hands.js`)
      .then(() => load(`${B}/camera_utils@0.3.1675466862/camera_utils.js`))
      .then(() => { window.__mp_loaded = true; resolve() })
      .catch(reject)
  })
}
