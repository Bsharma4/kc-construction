import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import { Building } from './Building'
import { easeInOut, phase } from './AnimatedParts'
import { constructionStore } from '../../lib/constructionStore'
import { gsap } from '../../lib/gsap'

/* ------------------------------------------------------------------ */
/* Camera choreography: keyframes sampled along Catmull-Rom splines.  */
/* ------------------------------------------------------------------ */
const CAM_POS = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(19, 15, 22), // 0.00 wide aerial over the staked-out lot
    new THREE.Vector3(13, 7.5, 15), // foundation
    new THREE.Vector3(-4, 8, 17), // framing
    new THREE.Vector3(-15, 10, 11), // roofing, from above the deck side
    new THREE.Vector3(-5, 4.5, 17), // windows & finishes, front
    new THREE.Vector3(-14, 4.5, 12), // deck & landscaping
    new THREE.Vector3(17, 4.2, 21), // reveal, low over the driveway
  ],
  false,
  'centripetal',
)
const CAM_TARGET = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(1.5, 0, 0.5),
    new THREE.Vector3(1.5, 0.4, 0),
    new THREE.Vector3(1, 2, 0),
    new THREE.Vector3(0.5, 3, 0),
    new THREE.Vector3(0.5, 2.4, 1),
    new THREE.Vector3(-2, 1.8, 1),
    new THREE.Vector3(1.5, 4.1, 1.5),
  ],
  false,
  'centripetal',
)

function CameraRig({ interactive }: { interactive: boolean }) {
  const { camera, size } = useThree()
  const look = useRef(new THREE.Vector3())
  const pos = useMemo(() => new THREE.Vector3(), [])
  const tgt = useMemo(() => new THREE.Vector3(), [])
  const ptr = useRef({ x: 0, y: 0 })

  useFrame((_, dt) => {
    const p = constructionStore.progress
    CAM_POS.getPoint(p, pos)
    CAM_TARGET.getPoint(p, tgt)
    // frame the building on narrow / portrait viewports
    const aspect = size.width / Math.max(1, size.height)
    const m = aspect < 0.8 ? 2.35 : aspect < 1.2 ? 1.6 : aspect < 1.5 ? 1.15 : 1
    pos.sub(tgt).multiplyScalar(m).add(tgt)
    if (aspect < 1.2) tgt.y += 0.4
    // subtle mouse-driven orbit
    if (interactive) {
      ptr.current.x = THREE.MathUtils.damp(ptr.current.x, constructionStore.pointer.x, 3, dt)
      ptr.current.y = THREE.MathUtils.damp(ptr.current.y, constructionStore.pointer.y, 3, dt)
      const ang = ptr.current.x * 0.18
      const ox = pos.x - tgt.x
      const oz = pos.z - tgt.z
      pos.x = tgt.x + ox * Math.cos(ang) - oz * Math.sin(ang)
      pos.z = tgt.z + ox * Math.sin(ang) + oz * Math.cos(ang)
      pos.y += ptr.current.y * 1.6
    }
    camera.position.lerp(pos, 1 - Math.exp(-8 * dt))
    look.current.lerp(tgt, 1 - Math.exp(-8 * dt))
    camera.lookAt(look.current)
  })
  return null
}

/* ------------------------------------------------------------------ */
/* Sky dome with a scroll-driven dawn → dusk gradient                  */
/* ------------------------------------------------------------------ */
const skyVert = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`
const skyFrag = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uHorizon;
  uniform vec3 uBottom;
  varying vec3 vWorld;
  void main() {
    float h = normalize(vWorld).y;
    vec3 col = h > 0.0 ? mix(uHorizon, uTop, pow(smoothstep(0.0, 0.6, h), 0.7)) : mix(uHorizon, uBottom, smoothstep(0.0, 0.15, -h));
    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`

const SKY = {
  dawn: { top: new THREE.Color('#1a2030'), horizon: new THREE.Color('#6b7480'), bottom: new THREE.Color('#2b2a28') },
  dusk: { top: new THREE.Color('#0d0f16'), horizon: new THREE.Color('#b9503a'), bottom: new THREE.Color('#1a1312') },
}

function Atmosphere({ shadows }: { shadows: boolean }) {
  const sun = useRef<THREE.DirectionalLight>(null)
  const hemi = useRef<THREE.HemisphereLight>(null)
  const ground = useRef<THREE.MeshStandardMaterial>(null)
  const uniforms = useMemo(
    () => ({
      uTop: { value: SKY.dawn.top.clone() },
      uHorizon: { value: SKY.dawn.horizon.clone() },
      uBottom: { value: SKY.dawn.bottom.clone() },
    }),
    [],
  )
  const fog = useMemo(() => new THREE.Fog('#4a4f57', 45, 140), [])
  const sunWarm = useMemo(() => new THREE.Color('#ffb48a'), [])
  const sunCool = useMemo(() => new THREE.Color('#fff4e6'), [])
  const dirt = useMemo(() => new THREE.Color('#4a4038'), [])
  const lawn = useMemo(() => new THREE.Color('#33452a'), [])

  useFrame(() => {
    const p = constructionStore.progress
    const k = easeInOut(phase(p, 0.55, 1))
    uniforms.uTop.value.copy(SKY.dawn.top).lerp(SKY.dusk.top, k)
    uniforms.uHorizon.value.copy(SKY.dawn.horizon).lerp(SKY.dusk.horizon, k)
    uniforms.uBottom.value.copy(SKY.dawn.bottom).lerp(SKY.dusk.bottom, k)
    fog.color.copy(uniforms.uHorizon.value).multiplyScalar(0.7)
    if (sun.current) {
      sun.current.color.copy(sunCool).lerp(sunWarm, k)
      sun.current.intensity = 2.6 - k * 0.9
      sun.current.position.set(18 + k * 6, 26 - k * 14, 14 - k * 4)
    }
    if (hemi.current) hemi.current.intensity = 0.9 - k * 0.35
    if (ground.current) ground.current.color.copy(dirt).lerp(lawn, easeInOut(phase(p, 0.8, 0.88)))
  })

  return (
    <>
      <primitive attach="fog" object={fog} />
      <mesh scale={300} frustumCulled={false} renderOrder={-1}>
        <sphereGeometry args={[1, 32, 16]} />
        <shaderMaterial vertexShader={skyVert} fragmentShader={skyFrag} uniforms={uniforms} side={THREE.BackSide} depthWrite={false} fog={false} />
      </mesh>
      <hemisphereLight ref={hemi} args={['#c9d4e0', '#3a3026', 0.9]} />
      <directionalLight
        ref={sun}
        position={[18, 26, 14]}
        intensity={2.6}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-camera-near={1}
        shadow-camera-far={70}
      />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[140, 48]} />
        <meshStandardMaterial ref={ground} color="#4a4038" roughness={1} />
      </mesh>
      <Environment resolution={128} frames={1}>
        <Lightformer intensity={2} position={[0, 10, -20]} scale={[40, 8, 1]} color="#ffffff" />
        <Lightformer intensity={1.2} position={[-20, 6, 0]} rotation-y={Math.PI / 2} scale={[30, 6, 1]} color="#ffd2b0" />
        <Lightformer intensity={0.8} position={[20, 4, 10]} rotation-y={-Math.PI / 2} scale={[30, 4, 1]} color="#bcd4ff" />
        <Lightformer intensity={0.6} position={[0, 30, 0]} rotation-x={Math.PI / 2} scale={[40, 40, 1]} color="#dfe6ee" />
      </Environment>
    </>
  )
}

/**
 * On-demand rendering: draw only while scroll progress or the pointer is changing, plus a short tail
 * so camera damping can settle. Idle frames cost nothing — big win for battery and mobile GPUs.
 */
function Invalidator({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let last = -1
    let lx = 0
    let ly = 0
    let tail = 0
    const tick = () => {
      const { progress: p, pointer: pt } = constructionStore
      if (p !== last || pt.x !== lx || pt.y !== ly) {
        last = p
        lx = pt.x
        ly = pt.y
        tail = 90
      }
      if (tail > 0) {
        tail--
        invalidate()
      }
    }
    if (!active) return
    gsap.ticker.add(tick)
    return () => gsap.ticker.remove(tick)
  }, [invalidate, active])
  return null
}

export type SceneProps = {
  active: boolean
  quality: 'high' | 'low'
  interactive: boolean
}

export default function ConstructionScene({ active, quality, interactive }: SceneProps) {
  const hi = quality === 'high'
  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={active ? 'demand' : 'never'}
      shadows={hi}
      dpr={hi ? [1, 1.75] : [1, 1.25]}
      gl={{ antialias: hi, powerPreference: 'high-performance', alpha: false }}
      camera={{ fov: 38, near: 0.5, far: 700, position: [24, 22, 28] }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
      }}
      aria-hidden
    >
      <Invalidator active={active} />
      <Atmosphere shadows={hi} />
      <CameraRig interactive={interactive} />
      <Building quality={quality} />
    </Canvas>
  )
}
