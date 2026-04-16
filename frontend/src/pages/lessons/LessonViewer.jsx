import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ModelScene from '../../components/lesson3d/ModelScene'
import CameraFeed from '../../components/lesson3d/CameraFeed'
import HandOverlay from '../../components/lesson3d/HandOverlay'
import ModelSwitcher from '../../components/lesson3d/ModelSwitcher'
import PartDetailView from '../../components/lesson3d/PartDetailView'
import GuideOverlay from '../../components/lesson3d/GuideOverlay'
import useHandTracking from '../../components/lesson3d/useHandTracking'
import { fetchTopics, fetchTopic } from './lessonsData'

const MAX_SCALE = 8.0
const MIN_SCALE = 0.1
const ROTATION_SIGN = -1
const PINCH_HOLD_MS = 400
const SWITCH_HOLD_MS = 600

export default function LessonViewer() {
  const navigate = useNavigate()
  const { subject, topicId } = useParams()
  const videoRef = useRef(null)

  const [topics, setTopics] = useState([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [loadErr, setLoadErr] = useState(null)
  const [showGuide, setShowGuide] = useState(true)

  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [scale, setScale] = useState(1.0)
  const [selectedPart, setSelectedPart] = useState(null)
  const [selectedMeshRawData, setSelectedMeshRawData] = useState(null)
  const [highlightPart, setHighlightPart] = useState(null)
  const [, setHoverLabel] = useState(null)
  const [explodeOpen, setExplodeOpen] = useState(false)
  const [pinchPoint, setPinchPoint] = useState(null)
  const [pinchHoldMs, setPinchHoldMs] = useState(0)
  const [thumbPinkyHoldMs, setThumbPinkyHoldMs] = useState(0)

  const hand = useHandTracking(videoRef)
  const handRef = useRef(hand)
  const selectedPartRef = useRef(selectedPart)
  useEffect(() => { handRef.current = hand }, [hand])
  useEffect(() => { selectedPartRef.current = selectedPart }, [selectedPart])

  const prevPalmRef = useRef(null)
  const explodeTogRef = useRef(false)
  const deselectRef = useRef(false)
  const pinchStartRef = useRef(null)
  const pinchFiredRef = useRef(false)
  const switchStartRef = useRef(null)
  const switchFiredRef = useRef(false)

  // Load topics for subject (so model switcher can navigate within subject)
  useEffect(() => {
    fetchTopics(subject)
      .then(d => {
        const list = d.topics || []
        setTopics(list)
        const idx = Math.max(0, list.findIndex(t => String(t.id) === String(topicId)))
        setActiveIdx(idx)
      })
      .catch(e => setLoadErr(e.message))
  }, [subject, topicId])

  // Load full topic detail (with parts)
  const [activeModel, setActiveModel] = useState(null)
  useEffect(() => {
    const t = topics[activeIdx]
    if (!t) return
    fetchTopic(t.id)
      .then(d => {
        setActiveModel({
          id: String(d.id),
          label: d.title_uz,
          icon: d.icon || '📦',
          file: d.model_file,
          initialRotation: d.initial_rotation || [0, 0, 0],
          meshNames: (d.parts || []).map(p => ({ name: p.label_uz, info: p.info_uz })),
          meshColors: (d.parts || []).map(p => parseInt((p.color_hex || '0x4488cc').replace('#', '0x'), 16) || 0x4488cc),
          isExplodable: (d.parts || []).length > 1,
        })
      })
      .catch(e => setLoadErr(e.message))
  }, [topics, activeIdx])

  const doDeselect = useCallback(() => {
    setSelectedPart(null)
    setSelectedMeshRawData(null)
    setHighlightPart(null)
  }, [])

  const switchTopic = useCallback((delta) => {
    setActiveIdx(i => {
      const next = (i + delta + topics.length) % topics.length
      return next
    })
    setRotation({ x: 0, y: 0 }); setScale(1.0)
    setHighlightPart(null); setSelectedPart(null); setSelectedMeshRawData(null)
    setExplodeOpen(false); prevPalmRef.current = null
  }, [topics.length])

  useEffect(() => {
    const onKey = e => {
      switch (e.key.toLowerCase()) {
        case 'e': setExplodeOpen(o => !o); break
        case 'r': setRotation({ x: 0, y: 0 }); setScale(1.0); prevPalmRef.current = null; break
        case 'escape': doDeselect(); break
        case 'arrowright': switchTopic(1); break
        case 'arrowleft':  switchTopic(-1); break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [switchTopic, doDeselect])

  useEffect(() => {
    let raf
    const loop = () => {
      const h = handRef.current
      const pinching = h.isTracking && h.h1PinchNorm < 0.33
      if (pinching) {
        if (!pinchStartRef.current) { pinchStartRef.current = Date.now(); pinchFiredRef.current = false }
        const held = Date.now() - pinchStartRef.current
        setPinchHoldMs(held)
        if (held >= PINCH_HOLD_MS && !pinchFiredRef.current && h.h1PinchMid) {
          pinchFiredRef.current = true
          setPinchPoint({ id: Date.now(), normX: 1 - h.h1PinchMid.x, normY: h.h1PinchMid.y })
        }
      } else if (pinchStartRef.current) {
        pinchStartRef.current = null; pinchFiredRef.current = false; setPinchHoldMs(0)
      }

      const switching = h.gesture === 'NEXT_MODEL' || h.gesture === 'PREV_MODEL'
      if (switching) {
        if (!switchStartRef.current) { switchStartRef.current = Date.now(); switchFiredRef.current = false }
        const held = Date.now() - switchStartRef.current
        setThumbPinkyHoldMs(held)
        if (held >= SWITCH_HOLD_MS && !switchFiredRef.current) {
          switchFiredRef.current = true
          switchTopic(h.gesture === 'NEXT_MODEL' ? 1 : -1)
        }
      } else if (switchStartRef.current) {
        switchStartRef.current = null; setThumbPinkyHoldMs(0)
      }

      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [switchTopic])

  useEffect(() => {
    if (!hand.isTracking) { prevPalmRef.current = null; return }
    const { gesture, h1PalmCenter, zoomDelta } = hand
    switch (gesture) {
      case 'EXPLODE_TOGGLE':
        prevPalmRef.current = null
        if (!explodeTogRef.current) { explodeTogRef.current = true; setExplodeOpen(o => !o) }
        break
      case 'ROTATE':
        if (selectedPartRef.current) { prevPalmRef.current = null; break }
        if (prevPalmRef.current) {
          const dx = h1PalmCenter.x - prevPalmRef.current.x
          const dy = h1PalmCenter.y - prevPalmRef.current.y
          if (Math.abs(dx) > 0.002 || Math.abs(dy) > 0.002)
            setRotation(r => ({ y: r.y + ROTATION_SIGN * dx * 8, x: r.x + ROTATION_SIGN * dy * 5 }))
        }
        prevPalmRef.current = { ...h1PalmCenter }
        break
      case 'ZOOM':
        prevPalmRef.current = null
        if (Math.abs(zoomDelta) > 0.001) setScale(s => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + zoomDelta)))
        break
      case 'DESELECT':
        prevPalmRef.current = null
        if (!deselectRef.current) { deselectRef.current = true; doDeselect() }
        break
      case 'NEXT_MODEL': case 'PREV_MODEL':
        prevPalmRef.current = null; break
      case 'RESET':
        setRotation({ x: 0, y: 0 }); setScale(1.0)
        setHighlightPart(null); setSelectedPart(null); setSelectedMeshRawData(null)
        prevPalmRef.current = null; break
      default:
        explodeTogRef.current = false; deselectRef.current = false; prevPalmRef.current = null
    }
  }, [hand.gesture, hand.h1PalmCenter, hand.zoomDelta, hand.isTracking]) // eslint-disable-line

  const handlePartHover = useCallback((key, label) => { setHoverLabel(label || null) }, [])

  const handlePartClick = useCallback((key, label, rawData) => {
    if (selectedPart?.key === key) { doDeselect(); return }
    setSelectedPart({ key, label })
    setHighlightPart(key)
    if (rawData) setSelectedMeshRawData(rawData)
    else setSelectedMeshRawData(null)
  }, [selectedPart, doDeselect])

  const handleModelSwitch = useCallback((id) => {
    const idx = topics.findIndex(t => String(t.id) === String(id))
    if (idx >= 0) {
      setActiveIdx(idx)
      setRotation({ x: 0, y: 0 }); setScale(1.0)
      setHighlightPart(null); setSelectedPart(null); setSelectedMeshRawData(null)
      setExplodeOpen(false); prevPalmRef.current = null
    }
  }, [topics])

  const getPartDetail = () => {
    if (!selectedPart || !activeModel) return { name: '', info: '' }
    if (activeModel.meshNames) {
      const idx = parseInt((selectedPart.key).replace(/\D/g, ''))
      const entry = activeModel.meshNames[isNaN(idx) ? -1 : idx]
      if (entry) return { name: entry.name, info: entry.info }
    }
    return { name: selectedPart.label, info: '' }
  }
  const partDetail = getPartDetail()
  const canExplode = activeModel?.isExplodable

  const switcherModels = topics.map(t => ({ id: String(t.id), label: t.title_uz, icon: t.icon || '📦' }))

  if (loadErr) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <p className="text-red-500 text-sm mb-4">Xato: {loadErr}</p>
        <button onClick={() => navigate(`/teacher/lessons/${subject}`)} className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm">Orqaga</button>
      </div>
    )
  }

  if (!activeModel) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-cyan-400 font-mono text-sm">
        Yuklanmoqda…
      </div>
    )
  }

  return (
    <div style={{ width: '100vw', height: '100vh', background: 'radial-gradient(ellipse at 30% 40%, #081828 0%, #050d1a 100%)', position: 'relative', overflow: 'hidden' }}>
      {showGuide && <GuideOverlay onDone={() => setShowGuide(false)} />}

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 72 }}>
        <ModelScene
          modelCfg={activeModel} rotation={rotation} scale={scale}
          highlightPart={highlightPart}
          onPartHover={handlePartHover} onPartClick={handlePartClick}
          explodeOpen={explodeOpen}
          selectedMeshKey={selectedPart?.key}
          pinchPoint={pinchPoint}
        />
      </div>

      <HandOverlay landmarks={hand.landmarks} gesture={hand.gesture} pinchHoldMs={pinchHoldMs} hand1PinchMid={hand.h1PinchMid} thumbPinkyHoldMs={thumbPinkyHoldMs} />

      <PartDetailView
        partName={selectedPart ? partDetail.name : null}
        partInfo={partDetail.info}
        onClose={doDeselect}
        meshRawData={selectedMeshRawData}
      />

      {/* Logo + back */}
      <div style={{ position: 'fixed', top: 18, left: 20, zIndex: 100, transition: 'opacity 0.3s', opacity: selectedPart ? 0 : 1, pointerEvents: selectedPart ? 'none' : 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => navigate(`/teacher/lessons/${subject}`)} style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.4)', borderRadius: 10, padding: '6px 12px', color: '#00d4ff', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer' }}>
          ← Orqaga
        </button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '0.18em', color: '#00d4ff', fontFamily: 'monospace', textShadow: '0 0 18px rgba(0,212,255,0.4)' }}>TEKSHIR<span style={{ color: '#fff' }}>AI</span></div>
          <div style={{ fontSize: 9, color: 'rgba(0,212,255,0.45)', letterSpacing: '0.14em', fontFamily: 'monospace' }}>3D INTERAKTIV DARS</div>
        </div>
      </div>

      <div style={{ position: 'fixed', top: 18, left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(0,212,255,0.07)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, padding: '5px 16px', fontSize: 12, color: 'rgba(0,212,255,0.75)', fontFamily: 'monospace' }}>
          {activeModel.icon} {activeModel.label.toUpperCase()}
          {selectedPart && <span style={{ color: '#ffd700', marginLeft: 8 }}>★ {partDetail.name || selectedPart.label}</span>}
        </div>
        <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '4px 10px', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>
          ×{scale.toFixed(2)}
        </div>
        {canExplode && (
          <button onClick={() => setExplodeOpen(o => !o)} style={{ background: explodeOpen ? 'rgba(255,165,0,0.18)' : 'rgba(0,212,255,0.07)', border: `1px solid ${explodeOpen ? '#ffa500' : 'rgba(0,212,255,0.3)'}`, borderRadius: 12, padding: '4px 14px', fontSize: 11, color: explodeOpen ? '#ffa500' : 'rgba(0,212,255,0.7)', fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.2s' }}>
            {explodeOpen ? '🔴 Yig' : '💥 Ajrat'} [E]
          </button>
        )}
        {selectedPart && (
          <button onClick={doDeselect} style={{ background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.4)', borderRadius: 12, padding: '4px 12px', fontSize: 11, color: '#ffd700', fontFamily: 'monospace', cursor: 'pointer' }}>
            ✕ [Esc]
          </button>
        )}
      </div>

      <div style={{ position: 'fixed', top: 18, right: 270, zIndex: 100, fontFamily: 'monospace', fontSize: 10, color: 'rgba(255,255,255,0.18)', textAlign: 'right', lineHeight: 2.0 }}>
        🖐 Kaft → aylantirish<br />
        🤏 Pinch 0.4s → tanlash<br />
        🤙 O'rta+bosh → bekor<br />
        ✊ Musht → ajrat/yig'<br />
        ⌨ E ajrat · R reset · Esc bekor
      </div>

      <CameraFeed videoRef={videoRef} landmarks={hand.landmarks} gesture={hand.gesture} pinchNorm={hand.h1PinchNorm} isTracking={hand.isTracking} handsCount={hand.handsCount} fps={hand.fps} error={hand.error} status={hand.status} />
      {topics.length > 1 && <ModelSwitcher models={switcherModels} activeId={String(topics[activeIdx]?.id)} onSwitch={handleModelSwitch} />}
    </div>
  )
}
