import React, { Suspense, useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

const TARGET_SIZE = 1.975

function Lights() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[5, 8, 6]} intensity={2.0} />
      <directionalLight position={[-4, -3, 4]} intensity={0.8} color="#aabbff" />
      <directionalLight position={[0, 3, -5]} intensity={0.5} />
      <pointLight position={[0, 0, 6]} intensity={0.5} color="#00d4ff" />
    </>
  )
}

function SceneGroup({ rotation, scale, children }) {
  const ref = useRef()
  useFrame(() => {
    if (!ref.current) return
    ref.current.rotation.x += (rotation.x - ref.current.rotation.x) * 0.12
    ref.current.rotation.y += (rotation.y - ref.current.rotation.y) * 0.12
    const s = ref.current.scale.x
    ref.current.scale.setScalar(s + (scale - s) * 0.12)
  })
  return <group ref={ref}>{children}</group>
}

function Spinner() {
  const ref = useRef()
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.rotation.y = clock.getElapsedTime() * 1.2
    ref.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.7) * 0.4
  })
  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[0.45, 0.13, 80, 16]} />
      <meshStandardMaterial color="#00d4ff" wireframe emissive="#00d4ff" emissiveIntensity={0.4} />
    </mesh>
  )
}

function GLBScene({ modelCfg, explodeOpen, highlightPart, selectedMeshKey, onPartHover, onPartClick, pinchPoint }) {
  const { scene } = useGLTF(modelCfg.file)
  const { camera, raycaster } = useThree()
  const origPos = useRef([])

  const { obj, meshes, scl } = useMemo(() => {
    const c = scene.clone(true)
    const ms = []
    c.traverse(node => {
      if (!node.isMesh) return
      node.material = Array.isArray(node.material) ? node.material.map(m => m.clone()) : node.material.clone()
      const col = modelCfg.meshColors?.[ms.length]
      if (col != null) {
        const mat = Array.isArray(node.material) ? node.material[0] : node.material
        mat?.color?.setHex(col)
      }
      ms.push(node)
    })
    c.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(c)
    let scaleFactor = 1
    if (!box.isEmpty()) {
      const center = new THREE.Vector3()
      const size = new THREE.Vector3()
      box.getCenter(center); box.getSize(size)
      const maxDim = Math.max(size.x, size.y, size.z, 0.001)
      scaleFactor = TARGET_SIZE / maxDim
      c.position.sub(center)
      c.updateMatrixWorld(true)
    }
    return { obj: c, meshes: ms, scl: scaleFactor }
  }, [scene, modelCfg.id]) // eslint-disable-line

  const capturedRef = useRef(false)
  useEffect(() => {
    capturedRef.current = false
    origPos.current = meshes.map(m => ({ local: m.position.clone(), world: null }))
  }, [meshes])

  useEffect(() => {
    meshes.forEach((mesh, i) => {
      const active = `mesh_${i}` === highlightPart || `mesh_${i}` === selectedMeshKey
      const mat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material
      if (!mat) return
      if (!mat.emissive) mat.emissive = new THREE.Color(0)
      mat.emissive.setHex(active ? 0x00aaff : 0x000000)
      mat.emissiveIntensity = active ? 0.6 : 0
    })
  }, [highlightPart, selectedMeshKey, meshes])

  useFrame(() => {
    const origs = origPos.current
    if (!origs.length) return
    if (!capturedRef.current) {
      capturedRef.current = true
      meshes.forEach((mesh, i) => {
        const box = new THREE.Box3().setFromObject(mesh)
        const wp = new THREE.Vector3()
        box.isEmpty() ? mesh.getWorldPosition(wp) : box.getCenter(wp)
        if (origs[i]) origs[i].world = wp.clone()
      })
      return
    }
    meshes.forEach((mesh, i) => {
      const d = origs[i]
      if (!d) return
      if (!explodeOpen) { mesh.position.lerp(d.local, 0.12); return }
      if (!d.world) return
      const wp = d.world
      const len = new THREE.Vector2(wp.x, wp.y).length()
      const dir = len > 0.01
        ? new THREE.Vector3(wp.x, wp.y, -wp.z).normalize()
        : new THREE.Vector3(
            Math.cos((i / meshes.length) * Math.PI * 2),
            Math.sin((i / meshes.length) * Math.PI * 2) * 0.5, 0).normalize()
      const totalLen = wp.length()
      const spread = Math.max(totalLen * 2.0, 0.4) / (scl || 1)
      mesh.position.lerp(d.local.clone().addScaledVector(dir, spread), 0.08)
    })
  })

  useEffect(() => {
    if (!pinchPoint || !meshes.length) return
    const ndc = new THREE.Vector2(pinchPoint.normX * 2 - 1, -(pinchPoint.normY * 2 - 1))
    raycaster.setFromCamera(ndc, camera)
    const hits = raycaster.intersectObjects(meshes, true)
    if (!hits.length) return
    let hit = hits[0].object
    while (hit && !meshes.includes(hit)) hit = hit.parent
    if (!hit && meshes.length === 1) hit = meshes[0]
    if (!hit) return
    const idx = meshes.indexOf(hit)
    if (idx >= 0) doClick(idx, meshes[idx])
  }, [pinchPoint?.id]) // eslint-disable-line

  function doClick(idx, meshObj) {
    const geo = meshObj.geometry
    const rawData = {
      positions: geo.attributes.position ? Array.from(geo.attributes.position.array) : [],
      normals:   geo.attributes.normal   ? Array.from(geo.attributes.normal.array)   : null,
      indices:   geo.index               ? Array.from(geo.index.array)               : null,
      color:     modelCfg.meshColors?.[idx] ?? 0x4488cc,
      meshIndex: idx,
    }
    if (modelCfg.meshNames?.[idx]) {
      onPartClick?.(`mesh_${idx}`, modelCfg.meshNames[idx].name, rawData)
      return
    }
    onPartClick?.(`mesh_${idx}`, `Qism ${idx + 1}`, rawData)
  }

  const initRot = modelCfg.initialRotation ?? [0, 0, 0]

  return (
    <group scale={scl}>
      <group rotation={initRot}>
        <primitive
          object={obj}
          onPointerOver={e => {
            e.stopPropagation()
            let idx = meshes.indexOf(e.object)
            if (idx < 0) {
              let p = e.object.parent
              while (p && idx < 0) { idx = meshes.indexOf(p); p = p.parent }
            }
            if (idx < 0 && meshes.length === 1) idx = 0
            if (idx < 0) return
            onPartHover?.(`mesh_${idx}`, modelCfg.meshNames?.[idx]?.name ?? `Qism ${idx + 1}`)
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => { onPartHover?.(null, null); document.body.style.cursor = 'default' }}
          onClick={e => {
            e.stopPropagation()
            let idx = meshes.indexOf(e.object)
            if (idx < 0) {
              let p = e.object.parent
              while (p && idx < 0) { idx = meshes.indexOf(p); p = p.parent }
            }
            if (idx < 0 && meshes.length === 1) idx = 0
            if (idx >= 0) doClick(idx, meshes[idx])
          }}
        />
      </group>
    </group>
  )
}

export default function ModelScene({
  modelCfg, rotation, scale,
  highlightPart, onPartHover, onPartClick,
  explodeOpen, selectedMeshKey, pinchPoint,
}) {
  const [mouseRot, setMouseRot] = useState({ x: 0, y: 0 })
  const [wheelScale, setWheelScale] = useState(1.0)
  const drag = useRef(null)

  useEffect(() => { setMouseRot({ x: 0, y: 0 }); setWheelScale(1.0) }, [modelCfg.id])

  const onMouseDown = useCallback(e => {
    if (e.button !== 0) return
    drag.current = { x: e.clientX, y: e.clientY, rot: { ...mouseRot } }
  }, [mouseRot])

  const onMouseMove = useCallback(e => {
    if (!drag.current) return
    const dx = (e.clientX - drag.current.x) * 0.006
    const dy = (e.clientY - drag.current.y) * 0.005
    setMouseRot({ y: drag.current.rot.y + dx, x: drag.current.rot.x + dy })
  }, [])

  const onMouseUp = useCallback(() => { drag.current = null }, [])

  const containerRef = useRef(null)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handleWheel = e => {
      e.preventDefault()
      const factor = e.deltaY > 0 ? 0.92 : 1.09
      setWheelScale(s => Math.min(8.0, Math.max(0.1, s * factor)))
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [])

  const effectiveRot = { x: rotation.x + mouseRot.x, y: rotation.y + mouseRot.y }
  const effectiveScale = scale * wheelScale

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}
      onMouseDown={onMouseDown} onMouseMove={onMouseMove}
      onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 38, near: 0.01, far: 2000 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
        dpr={[1, 2]}>
        <Lights />
        <SceneGroup rotation={effectiveRot} scale={effectiveScale}>
          <Suspense fallback={<Spinner />}>
            {modelCfg.file ? (
              <GLBScene
                key={modelCfg.id}
                modelCfg={modelCfg}
                explodeOpen={explodeOpen}
                highlightPart={highlightPart}
                selectedMeshKey={selectedMeshKey}
                onPartHover={onPartHover}
                onPartClick={onPartClick}
                pinchPoint={pinchPoint}
              />
            ) : <Spinner />}
          </Suspense>
        </SceneGroup>
      </Canvas>
    </div>
  )
}
