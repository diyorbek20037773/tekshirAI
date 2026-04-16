import { useRef, useEffect } from 'react'
import * as THREE from 'three'

const PALETTE = [
  0x4a90d9, 0xe8634a, 0x5cb85c, 0xf0ad4e,
  0x9b59b6, 0x1abc9c, 0xe74c3c, 0x3498db,
  0xff6b6b, 0x48c774, 0xffdd57, 0x7c4dff,
  0x00bcd4, 0xff9800, 0x8bc34a, 0xe91e63,
  0x00e5ff, 0xffd600, 0x76ff03, 0xff6d00,
  0xd500f9, 0x00e676, 0xff1744, 0x2979ff,
]

function getDisplayColor(rawData) {
  if (!rawData) return 0x4488cc
  const c = rawData.color ?? 0xffffff
  const r = (c >> 16) & 0xff, g = (c >> 8) & 0xff, b = c & 0xff
  if (!(r > 200 && g > 200 && b > 200)) return c
  const idx = rawData.meshIndex ?? 0
  return PALETTE[idx % PALETTE.length]
}

function MiniRenderer({ meshRawData }) {
  const mountRef = useRef(null)
  const stateRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return
    const W = 210, H = 221
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%', display: 'block' })

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, W / H, 0.001, 500)
    camera.position.set(0, 0, 3.5)
    scene.add(new THREE.AmbientLight(0xffffff, 1.0))
    const dl1 = new THREE.DirectionalLight(0xffffff, 1.6); dl1.position.set(3, 5, 4); scene.add(dl1)
    const dl2 = new THREE.DirectionalLight(0xaabbff, 0.5); dl2.position.set(-2, -2, 3); scene.add(dl2)

    let mesh = null, angle = 0

    function setMesh(raw) {
      if (mesh) { scene.remove(mesh); mesh.geometry.dispose(); mesh.material.dispose(); mesh = null }
      if (!raw || !raw.positions || raw.positions.length < 9) return
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(raw.positions), 3))
      if (raw.normals?.length === raw.positions.length) {
        geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(raw.normals), 3))
      }
      if (raw.indices?.length > 0) {
        const idxArr = raw.indices.length > 65535 ? new Uint32Array(raw.indices) : new Uint16Array(raw.indices)
        geo.setIndex(new THREE.BufferAttribute(idxArr, 1))
      }
      if (!geo.attributes.normal) geo.computeVertexNormals()
      const box = new THREE.Box3().setFromBufferAttribute(geo.attributes.position)
      const center = new THREE.Vector3(); box.getCenter(center)
      const size = new THREE.Vector3(); box.getSize(size)
      const maxDim = Math.max(size.x, size.y, size.z, 0.01)
      geo.translate(-center.x, -center.y, -center.z)
      geo.scale(2.4 / maxDim, 2.4 / maxDim, 2.4 / maxDim)
      const displayColor = getDisplayColor(raw)
      const mat = new THREE.MeshStandardMaterial({
        color: displayColor, roughness: 0.5, metalness: 0.15,
        side: THREE.DoubleSide,
        emissive: new THREE.Color(displayColor), emissiveIntensity: 0.12,
      })
      mesh = new THREE.Mesh(geo, mat)
      scene.add(mesh)
    }

    setMesh(meshRawData)
    let animId
    const animate = () => {
      animId = requestAnimationFrame(animate)
      angle += 0.009
      if (mesh) { mesh.rotation.y = angle; mesh.rotation.x = angle * 0.38 }
      renderer.render(scene, camera)
    }
    animate()
    stateRef.current = { setMesh }
    return () => {
      cancelAnimationFrame(animId)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, []) // eslint-disable-line

  useEffect(() => { stateRef.current?.setMesh(meshRawData) }, [meshRawData])

  return <div ref={mountRef} style={{ width: '100%', height: 221, overflow: 'hidden' }} />
}

export default function PartDetailView({ partName, partInfo, onClose, meshRawData }) {
  if (!partName) return null
  const cs = (pos) => ({ position: 'absolute', width: 12, height: 12, border: '2px solid rgba(0,212,255,0.65)', ...pos })
  return (
    <div style={{ position: 'fixed', top: 80, left: 18, width: 228, zIndex: 300, animation: 'pdvIn 0.22s ease', pointerEvents: 'auto' }}>
      <style>{`@keyframes pdvIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}`}</style>
      <div style={{ background: 'rgba(0,3,14,0.98)', border: '1px solid rgba(0,212,255,0.4)', borderRadius: 10, overflow: 'hidden', boxShadow: '0 0 24px rgba(0,212,255,0.1)', position: 'relative' }}>
        <div style={{ height: 2, background: 'linear-gradient(90deg,transparent,#00d4ff,transparent)' }} />
        <div style={{ ...cs({ top: 0, left: 0 }), borderRight: 'none', borderBottom: 'none' }} />
        <div style={{ ...cs({ top: 0, right: 0 }), borderLeft: 'none', borderBottom: 'none' }} />
        <div style={{ ...cs({ bottom: 0, left: 0 }), borderRight: 'none', borderTop: 'none' }} />
        <div style={{ ...cs({ bottom: 0, right: 0 }), borderLeft: 'none', borderTop: 'none' }} />

        <div style={{ padding: '8px 12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ffd700', boxShadow: '0 0 6px #ffd700' }} />
            <span style={{ fontSize: 8, fontFamily: 'monospace', color: 'rgba(255,215,0,0.6)', letterSpacing: '2px' }}>TANLANGAN QISM</span>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: 18, height: 18, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ margin: '0 8px', border: '1px solid rgba(0,212,255,0.18)', borderRadius: 6, overflow: 'hidden', background: 'rgba(0,6,22,0.95)', position: 'relative' }}>
          <MiniRenderer meshRawData={meshRawData} />
          {!meshRawData && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(0,212,255,0.3)', fontSize: 10, fontFamily: 'monospace' }}>
              yuklanmoqda...
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 4, left: 0, right: 0, textAlign: 'center', fontSize: 8, fontFamily: 'monospace', color: 'rgba(0,212,255,0.3)', pointerEvents: 'none', letterSpacing: '1px' }}>
            3D · AYLANMOQDA
          </div>
        </div>

        <div style={{ padding: '8px 12px 3px' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#ffd700', fontFamily: 'monospace', lineHeight: 1.3, textShadow: '0 0 10px rgba(255,215,0,0.28)' }}>
            {partName}
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(0,212,255,0.1)', margin: '5px 12px' }} />

        <div style={{ padding: '0 12px 12px' }}>
          {partInfo ? (
            <div style={{ fontSize: 11, color: 'rgba(188,215,255,0.85)', lineHeight: 1.6, fontFamily: "'Segoe UI',sans-serif" }}>
              {partInfo}
            </div>
          ) : (
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.18)', fontFamily: 'monospace', fontStyle: 'italic' }}>
              Ma'lumot yo'q
            </div>
          )}
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.2),transparent)' }} />
      </div>
    </div>
  )
}
