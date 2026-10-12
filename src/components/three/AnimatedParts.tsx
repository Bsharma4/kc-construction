import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Part } from './parts'
import { constructionStore } from '../../lib/constructionStore'

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const phase = (p: number, t0: number, t1: number) => (t1 <= t0 ? (p >= t0 ? 1 : 0) : clamp01((p - t0) / (t1 - t0)))
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOutBack = (t: number) => {
  const c1 = 1.4
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

const _m = new THREE.Matrix4()
const _pos = new THREE.Vector3()
const _quat = new THREE.Quaternion()
const _scale = new THREE.Vector3()
const _euler = new THREE.Euler()
const HIDDEN = new THREE.Matrix4().makeScale(0, 0, 0)

/** Writes the instance matrix for a part at a given construction progress. */
export function partMatrix(part: Part, progress: number, out: THREE.Matrix4): boolean {
  let k = easeInOut(phase(progress, part.t0, part.t1))
  if (part.r0 !== undefined && part.r1 !== undefined) k *= 1 - easeInOut(phase(progress, part.r0, part.r1))
  if (k <= 0.0005) {
    out.copy(HIDDEN)
    return false
  }
  const [px, py, pz] = part.p
  const [sx, sy, sz] = part.s
  const r = part.rot
  _quat.setFromEuler(r ? _euler.set(r[0], r[1], r[2]) : _euler.set(0, 0, 0))
  switch (part.anim) {
    case 'growY': {
      const h = sy * k
      _pos.set(px, py - sy / 2 + h / 2, pz)
      _scale.set(sx, Math.max(h, 0.0001), sz)
      break
    }
    case 'drop': {
      const d = part.dist ?? 5
      _pos.set(px, py + (1 - k) * d, pz)
      const s = Math.min(1, k * 5)
      _scale.set(sx * s, sy * s, sz * s)
      break
    }
    case 'slide': {
      const d = part.dist ?? 2
      const [dx, dy, dz] = part.dir ?? [0, 0, 1]
      _pos.set(px + dx * (1 - k) * d, py + dy * (1 - k) * d, pz + dz * (1 - k) * d)
      const s = Math.min(1, k * 4)
      _scale.set(sx * s, sy * s, sz * s)
      break
    }
    case 'rise': {
      _pos.set(px, py - (1 - k) * sy, pz)
      _scale.set(sx, sy, sz)
      break
    }
    case 'scale':
    default: {
      const s = easeOutBack(Math.min(1, k))
      _pos.set(px, py, pz)
      _scale.set(sx * s, sy * s, sz * s)
    }
  }
  out.compose(_pos, _quat, _scale)
  return true
}

type Props = {
  parts: Part[]
  material: THREE.Material
  geometry?: THREE.BufferGeometry
  castShadow?: boolean
  receiveShadow?: boolean
  name?: string
}

const unitBox = new THREE.BoxGeometry(1, 1, 1)

/**
 * Renders a list of parts as one InstancedMesh and re-poses every instance whenever
 * the scroll progress changes. Scrolling backwards simply evaluates earlier progress
 * values, so the construction reverses naturally.
 */
export function AnimatedParts({ parts, material, geometry = unitBox, castShadow = true, receiveShadow = true, name }: Props) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const last = useRef(-1)
  const count = parts.length
  const args = useMemo(() => [geometry, material, count] as const, [geometry, material, count])

  const update = (p: number) => {
    const mesh = ref.current
    if (!mesh) return
    let visible = 0
    for (let i = 0; i < count; i++) {
      if (partMatrix(parts[i], p, _m)) visible++
      mesh.setMatrixAt(i, _m)
    }
    mesh.visible = visible > 0
    mesh.instanceMatrix.needsUpdate = true
  }

  useLayoutEffect(() => {
    last.current = -1
    update(constructionStore.progress)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parts])

  useFrame(() => {
    const p = constructionStore.progress
    if (Math.abs(p - last.current) < 1e-5) return
    last.current = p
    update(p)
  })

  if (count === 0) return null
  return (
    <instancedMesh
      ref={ref}
      name={name}
      args={args as unknown as [THREE.BufferGeometry, THREE.Material, number]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
      frustumCulled={false}
    />
  )
}
