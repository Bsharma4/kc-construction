import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { AnimatedParts, easeInOut, partMatrix, phase } from './AnimatedParts'
import { buildParts, T, type Part } from './parts'
import { constructionStore } from '../../lib/constructionStore'

const icosa = new THREE.IcosahedronGeometry(0.5, 1)
const cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 7)

/** Unit triangular prism (base at y = -0.5, apex at y = +0.5, ridge along x) for gable ends. */
const prism = (() => {
  const shape = new THREE.Shape([new THREE.Vector2(-0.5, -0.5), new THREE.Vector2(0.5, -0.5), new THREE.Vector2(0, 0.5)])
  const g = new THREE.ExtrudeGeometry(shape, { depth: 1, bevelEnabled: false })
  g.translate(0, 0, -0.5)
  g.rotateY(Math.PI / 2)
  return g
})()

const GLASS = new THREE.Color('#2a3846')
const WARM = [new THREE.Color('#ffd08a'), new THREE.Color('#ffe2b5'), new THREE.Color('#ffc06b')]

/** Window panes: unlit, so they read as glass by day and glow warmly once the lights come on. */
function WindowPanes({ parts }: { parts: Part[] }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const last = useRef(-1)
  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#ffffff' }), [])
  const box = useMemo(() => new THREE.BoxGeometry(1, 1, 1), [])
  const tmp = useMemo(() => new THREE.Color(), [])
  const m = useMemo(() => new THREE.Matrix4(), [])

  const update = (p: number) => {
    const mesh = ref.current
    if (!mesh) return
    parts.forEach((part, i) => {
      partMatrix(part, p, m)
      mesh.setMatrixAt(i, m)
      const lt = part.lt ?? 0.95
      const on = easeInOut(phase(p, lt, lt + 0.03))
      tmp.copy(GLASS).lerp(WARM[i % 3], on * (0.8 + ((i * 37) % 10) / 50))
      mesh.setColorAt(i, tmp)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }

  useLayoutEffect(() => update(constructionStore.progress))
  useFrame(() => {
    const p = constructionStore.progress
    if (Math.abs(p - last.current) < 1e-5) return
    last.current = p
    update(p)
  })
  return <instancedMesh ref={ref} args={[box, material, parts.length]} frustumCulled={false} />
}

export function Building({ quality }: { quality: 'high' | 'low' }) {
  const parts = useMemo(() => buildParts(), [])
  const hi = quality === 'high'

  const mats = useMemo(() => {
    const std = (o: THREE.MeshStandardMaterialParameters) => new THREE.MeshStandardMaterial(o)
    return {
      line: new THREE.MeshBasicMaterial({ color: '#ff5a1f' }),
      ground: std({ color: '#3b3029', roughness: 1 }),
      dirt: std({ color: '#5a4636', roughness: 1, flatShading: true }),
      concrete: std({ color: '#a8a39b', roughness: 0.92 }),
      rebar: std({ color: '#9c4a27', roughness: 0.7, metalness: 0.4 }),
      lumber: std({ color: '#cfa36a', roughness: 0.85 }),
      osb: std({ color: '#b98f57', roughness: 0.95 }),
      roof: std({ color: '#2a2d32', roughness: 0.45, metalness: 0.55 }),
      trimDark: std({ color: '#1b1d21', roughness: 0.5, metalness: 0.3 }),
      siding: std({ color: '#ece6db', roughness: 0.8 }),
      batten: std({ color: '#e2dbcd', roughness: 0.8 }),
      stone: std({ color: '#8b8075', roughness: 0.95 }),
      wood: std({ color: '#8a6040', roughness: 0.75 }),
      deck: std({ color: '#6e4d33', roughness: 0.85 }),
      fence: std({ color: '#9a7350', roughness: 0.9 }),
      paving: std({ color: '#c3bdb1', roughness: 0.9 }),
      mulch: std({ color: '#3a2a20', roughness: 1 }),
      bark: std({ color: '#4a3726', roughness: 1 }),
      leaves: std({ color: '#4c7a3a', roughness: 0.9, flatShading: true }),
      shrubs: std({ color: '#3d6631', roughness: 0.9, flatShading: true }),
      lampHead: new THREE.MeshBasicMaterial({ color: '#2a2a2a' }),
      machine: std({ color: '#e6a019', roughness: 0.5, metalness: 0.3 }),
      machineDark: std({ color: '#1f2125', roughness: 0.6 }),
      cabin: std({ color: '#5f7d93', roughness: 0.6 }),
    }
  }, [])

  const lampOff = useMemo(() => new THREE.Color('#2a2a2a'), [])
  const lampOn = useMemo(() => new THREE.Color('#ffe2b0'), [])
  useFrame(() => {
    const k = easeInOut(phase(constructionStore.progress, T.lights[0] + 0.02, T.lights[1]))
    mats.lampHead.color.copy(lampOff).lerp(lampOn, k)
  })

  return (
    <group>
      <AnimatedParts parts={parts.outline} material={mats.line} castShadow={false} receiveShadow={false} />
      <AnimatedParts parts={parts.ground} material={mats.ground} castShadow={false} />
      <AnimatedParts parts={parts.dirt} material={mats.dirt} geometry={icosa} />
      <AnimatedParts parts={parts.concrete} material={mats.concrete} />
      <AnimatedParts parts={parts.rebar} material={mats.rebar} castShadow={false} />
      <AnimatedParts parts={parts.lumber} material={mats.lumber} castShadow={hi} />
      <AnimatedParts parts={parts.osb} material={mats.osb} />
      <AnimatedParts parts={parts.osbGable} material={mats.osb} geometry={prism} />
      <AnimatedParts parts={parts.roof} material={mats.roof} />
      <AnimatedParts parts={parts.trimDark} material={mats.trimDark} castShadow={false} />
      <WindowPanes parts={parts.panes} />
      <AnimatedParts parts={parts.siding} material={mats.siding} />
      <AnimatedParts parts={parts.sidingGable} material={mats.siding} geometry={prism} />
      <AnimatedParts parts={parts.batten} material={mats.batten} castShadow={false} />
      <AnimatedParts parts={parts.stone} material={mats.stone} />
      <AnimatedParts parts={parts.wood} material={mats.wood} />
      <AnimatedParts parts={parts.deck} material={mats.deck} />
      <AnimatedParts parts={parts.fence} material={mats.fence} />
      <AnimatedParts parts={parts.paving} material={mats.paving} castShadow={false} />
      <AnimatedParts parts={parts.mulch} material={mats.mulch} castShadow={false} />
      <AnimatedParts parts={parts.trunks} material={mats.bark} geometry={cyl} />
      <AnimatedParts parts={parts.crowns} material={mats.leaves} geometry={icosa} />
      <AnimatedParts parts={parts.shrubs} material={mats.shrubs} geometry={icosa} />
      <AnimatedParts parts={parts.lampHeads} material={mats.lampHead} castShadow={false} />
      <AnimatedParts parts={parts.machine} material={mats.machine} />
      <AnimatedParts parts={parts.machineDark} material={mats.machineDark} />
      <AnimatedParts parts={parts.siteTemp} material={mats.cabin} />
    </group>
  )
}
