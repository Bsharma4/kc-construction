/**
 * Procedural residential home.
 *
 * Every component is a "Part": its final position/size, the scroll-progress window [t0, t1] in which it
 * is installed, an optional removal window [r0, r1] (temporary works) and the installation motion.
 * Parts that share a material are rendered as one InstancedMesh, so the whole house is ~30 draw calls.
 * Because each pose is a pure function of progress, scrolling backwards reverses the build exactly.
 */
export type Vec3 = [number, number, number]
export type Anim = 'growY' | 'drop' | 'scale' | 'slide' | 'rise'

export interface Part {
  p: Vec3
  s: Vec3
  t0: number
  t1: number
  r0?: number
  r1?: number
  anim: Anim
  dir?: Vec3
  dist?: number
  /** Euler rotation (x, y, z) in radians. */
  rot?: Vec3
  /** For window panes: progress at which the interior light switches on. */
  lt?: number
}

/* ---------- Dimensions ---------- */
export const W = 10 // main house length (x: -5..5)
export const D = 7 // main house depth (z: -3.5..3.5)
export const FLOORS = 2
export const FH = 1.5 // floor-to-floor height
export const BASE = 0.35 // top of foundation slab
export const WALL_TOP = BASE + FLOORS * FH
const PITCH = (33 * Math.PI) / 180
const TAN = Math.tan(PITCH)
const HEEL = 0.15
const EAVE = 0.5 // roof overhang beyond the walls
const RISE = (D / 2) * TAN + HEEL // gable height above the wall plate
export const RIDGE = WALL_TOP + RISE
const G = { x0: 5, x1: 9.4, z0: -3.5, z1: 2, top: 3 } // attached garage
const DOOR = { x0: 5.7, x1: 8.7 } // garage door opening
const DECK = { x0: -9.2, x1: -5.2, z0: -2.6, z1: 2.6, y: 0.75 }

/** Scroll windows (0..1). Kept in sync with CONSTRUCTION_STAGES. */
export const T = {
  siteOut: [0.1, 0.13],
  excavate: [0.02, 0.06],
  footings: [0.08, 0.12],
  slab: [0.13, 0.19],
  frame1: 0.21,
  frame2: 0.31,
  trusses: [0.37, 0.44],
  sheathing: [0.42, 0.47],
  roofDeck: [0.47, 0.5],
  shingles: [0.5, 0.56],
  windows: [0.59, 0.67],
  siding: [0.69, 0.74],
  trim: [0.73, 0.79],
  tempOut: [0.79, 0.82],
  outdoor: [0.81, 0.93],
  lights: [0.9, 1.0],
} as const

// Deterministic pseudo-random so the layout is identical every render.
let seed = 7
const rand = () => {
  seed = (seed * 16807) % 2147483647
  return (seed - 1) / 2147483646
}
const range = (a: number, b: number, step: number) => {
  const out: number[] = []
  for (let v = a; v <= b + 1e-6; v += step) out.push(+v.toFixed(3))
  return out
}

export function buildParts() {
  seed = 7
  const P = {
    outline: [] as Part[],
    ground: [] as Part[],
    dirt: [] as Part[],
    concrete: [] as Part[],
    rebar: [] as Part[],
    lumber: [] as Part[],
    osb: [] as Part[],
    osbGable: [] as Part[],
    roof: [] as Part[],
    trimDark: [] as Part[],
    panes: [] as Part[],
    siding: [] as Part[],
    sidingGable: [] as Part[],
    batten: [] as Part[],
    stone: [] as Part[],
    wood: [] as Part[],
    deck: [] as Part[],
    fence: [] as Part[],
    paving: [] as Part[],
    mulch: [] as Part[],
    trunks: [] as Part[],
    crowns: [] as Part[],
    shrubs: [] as Part[],
    lampHeads: [] as Part[],
    machine: [] as Part[],
    machineDark: [] as Part[],
    siteTemp: [] as Part[],
  }

  /* ---------- 1. Site set-out, excavation & Bobcat ---------- */
  const out = { r0: T.siteOut[0], r1: T.siteOut[1] }
  const cx = 2.2
  const ow = 16
  const od = 8.4
  const line = 0.03
  P.outline.push(
    { p: [cx, 0.05, od / 2], s: [ow, line, line], t0: 0, t1: 0.0001, anim: 'scale', ...out },
    { p: [cx, 0.05, -od / 2], s: [ow, line, line], t0: 0, t1: 0.0001, anim: 'scale', ...out },
    { p: [cx + ow / 2, 0.05, 0], s: [line, line, od], t0: 0, t1: 0.0001, anim: 'scale', ...out },
    { p: [cx - ow / 2, 0.05, 0], s: [line, line, od], t0: 0, t1: 0.0001, anim: 'scale', ...out },
  )
  ;[[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) =>
    P.outline.push({ p: [cx + (sx * ow) / 2, 0.3, (sz * od) / 2], s: [0.08, 0.6, 0.08], t0: 0, t1: 0.0001, anim: 'scale', ...out }),
  )
  P.ground.push({ p: [cx, 0.02, 0], s: [ow + 1.5, 0.04, od + 1.5], t0: T.excavate[0], t1: T.excavate[1], anim: 'scale', r0: T.tempOut[0], r1: T.tempOut[1] })
  ;[
    [-11, -5.5, 2.4],
    [-12.6, -3.6, 1.6],
    [13, -5, 1.9],
  ].forEach(([x, z, r], k) =>
    P.dirt.push({ p: [x, r * 0.28, z], s: [r * 2, r * 0.8, r * 1.8], t0: 0.03 + k * 0.012, t1: 0.07 + k * 0.012, anim: 'scale', r0: T.tempOut[0], r1: T.tempOut[1] }),
  )
  // Bobcat (skid steer) drives in, works the site, and leaves before landscaping
  const bob = (p: Vec3, s: Vec3, dark = false) =>
    (dark ? P.machineDark : P.machine).push({ p, s, t0: 0.005, t1: 0.05, anim: 'slide', dir: [1, 0, 0.4], dist: 9, r0: T.tempOut[0], r1: T.tempOut[1] })
  const bx = 11.5
  const bz = 6
  bob([bx, 0.62, bz], [1.25, 0.6, 0.86])
  bob([bx + 0.12, 1.2, bz], [0.8, 0.62, 0.78], true)
  bob([bx, 0.24, bz - 0.5], [1.35, 0.42, 0.22], true)
  bob([bx, 0.24, bz + 0.5], [1.35, 0.42, 0.22], true)
  bob([bx - 0.95, 0.32, bz], [0.42, 0.42, 1.1])
  bob([bx - 0.45, 0.8, bz - 0.47], [1.0, 0.1, 0.1])
  bob([bx - 0.45, 0.8, bz + 0.47], [1.0, 0.1, 0.1])

  // temporary site works: portable toilet, dumpster, lumber stack
  const temp = { r0: T.tempOut[0], r1: T.tempOut[1] }
  P.siteTemp.push({ p: [-13, 1.1, 4.5], s: [1.1, 2.2, 1.1], t0: 0.02, t1: 0.05, anim: 'drop', dist: 3, ...temp })
  P.siteTemp.push({ p: [12.5, 0.6, -1.5], s: [2.2, 1.2, 4.2], t0: 0.04, t1: 0.07, anim: 'drop', dist: 3, ...temp })
  for (let k = 0; k < 4; k++)
    P.lumber.push({ p: [-12.6, 0.12 + k * 0.2, 0.5], s: [1.4, 0.18, 4.4], t0: 0.16 + k * 0.006, t1: 0.18 + k * 0.006, anim: 'drop', dist: 3, r0: 0.4 - k * 0.02, r1: 0.42 - k * 0.02 })

  /* ---------- 2. Foundation: footings, rebar, slabs ---------- */
  type Seg = { a: number; b: number; fixed: number; axis: 'x' | 'z' }
  const houseWalls: Seg[] = [
    { a: -5, b: 5, fixed: 3.5, axis: 'x' },
    { a: -5, b: 5, fixed: -3.5, axis: 'x' },
    { a: -3.5, b: 3.5, fixed: -5, axis: 'z' },
    { a: -3.5, b: 3.5, fixed: 5, axis: 'z' },
  ]
  const garageWalls: Seg[] = [
    { a: G.x0, b: G.x1, fixed: G.z1, axis: 'x' },
    { a: G.x0, b: G.x1, fixed: G.z0, axis: 'x' },
    { a: G.z0, b: G.z1, fixed: G.x1, axis: 'z' },
  ]
  const seg = (w: Seg, y: number, h: number, thick: number, off = 0): Pick<Part, 'p' | 's'> => {
    const len = w.b - w.a
    const mid = (w.a + w.b) / 2
    const o = w.fixed + Math.sign(w.fixed || 1) * off
    return w.axis === 'x' ? { p: [mid, y, o], s: [len + thick, h, thick] } : { p: [o, y, mid], s: [thick, h, len + thick] }
  }
  ;[...houseWalls, ...garageWalls].forEach((w, k) => {
    const t0 = T.footings[0] + k * 0.004
    P.concrete.push({ ...seg(w, 0.13, 0.26, 0.6), t0, t1: t0 + 0.02, anim: 'growY' })
    range(w.a, w.b, 1.2).forEach((v, j) => {
      const p: Vec3 = w.axis === 'x' ? [v, 0.5, w.fixed] : [w.fixed, 0.5, v]
      const r0 = T.slab[0] + 0.01
      P.rebar.push({ p, s: [0.04, 0.6, 0.04], t0: t0 + 0.01 + j * 0.0008, t1: t0 + 0.025 + j * 0.0008, anim: 'growY', r0, r1: r0 + 0.02 })
    })
  })
  P.concrete.push(
    { p: [0, BASE / 2, 0], s: [W + 0.3, BASE, D + 0.3], t0: T.slab[0], t1: T.slab[0] + 0.04, anim: 'growY' },
    { p: [(G.x0 + G.x1) / 2, 0.125, (G.z0 + G.z1) / 2], s: [G.x1 - G.x0 + 0.3, 0.25, G.z1 - G.z0 + 0.3], t0: T.slab[0] + 0.02, t1: T.slab[1], anim: 'growY' },
    { p: [-1.2, 0.1, 4.5], s: [4.2, 0.2, 2.0], t0: T.slab[0] + 0.03, t1: T.slab[1], anim: 'growY' },
  )

  /* ---------- 3. Framing: studs, plates, joists, subfloor, trusses ---------- */
  const studs = (w: Seg, yb: number, h: number, t: number, span = 0.04) => {
    const pts = range(w.a, w.b, 0.6)
    pts.forEach((v, j) => {
      const inDoor = w === garageWalls[0] && v > DOOR.x0 + 0.1 && v < DOOR.x1 - 0.1
      if (inDoor) return
      const t0 = t + (j / pts.length) * span
      const p: Vec3 = w.axis === 'x' ? [v, yb + h / 2, w.fixed] : [w.fixed, yb + h / 2, v]
      const s: Vec3 = w.axis === 'x' ? [0.06, h, 0.14] : [0.14, h, 0.06]
      P.lumber.push({ p, s, t0, t1: t0 + 0.015, anim: 'growY' })
    })
    P.lumber.push({ ...seg(w, yb + 0.03, 0.06, 0.16), t0: t, t1: t + 0.01, anim: 'scale' })
    P.lumber.push({ ...seg(w, yb + h + 0.03, 0.06, 0.16), t0: t + span, t1: t + span + 0.012, anim: 'drop', dist: 1.5 })
  }
  houseWalls.forEach((w, k) => studs(w, BASE, FH - 0.06, T.frame1 + k * 0.012))
  garageWalls.forEach((w, k) => studs(w, 0.25, G.top - 0.31, T.frame1 + 0.05 + k * 0.01, 0.03))
  // header over the garage door
  P.lumber.push({ p: [(DOOR.x0 + DOOR.x1) / 2, 2.55, G.z1], s: [DOOR.x1 - DOOR.x0 + 0.3, 0.3, 0.16], t0: 0.29, t1: 0.3, anim: 'drop', dist: 2 })
  // second-floor joists + subfloor
  range(-4.75, 4.75, 0.5).forEach((x, j) => {
    const t0 = 0.27 + j * 0.0012
    P.lumber.push({ p: [x, BASE + FH - 0.12, 0], s: [0.06, 0.22, D], t0, t1: t0 + 0.01, anim: 'drop', dist: 2.5 })
  })
  P.osb.push({ p: [0, BASE + FH, 0], s: [W + 0.15, 0.05, D + 0.15], t0: 0.296, t1: 0.31, anim: 'growY' })
  houseWalls.forEach((w, k) => studs(w, BASE + FH + 0.03, FH - 0.09, T.frame2 + k * 0.012))
  // garage roof joists
  range(G.x0 + 0.3, G.x1 - 0.2, 0.6).forEach((x, j) => {
    const t0 = 0.35 + j * 0.002
    P.lumber.push({ p: [x, G.top + 0.1, (G.z0 + G.z1) / 2], s: [0.06, 0.2, G.z1 - G.z0 + 0.2], t0, t1: t0 + 0.01, anim: 'drop', dist: 2 })
  })
  // roof trusses, set one by one along the house
  const L = (D / 2 + EAVE) / Math.cos(PITCH)
  const yUnder = (absZ: number) => WALL_TOP + HEEL + (D / 2 - absZ) * TAN
  const nrm = (side: number): Vec3 => [0, Math.cos(PITCH), side * Math.sin(PITCH)]
  const along = (side: number, absZ: number, off: number): Vec3 => {
    const n = nrm(side)
    return [0, yUnder(absZ) + n[1] * off, side * absZ + n[2] * off]
  }
  const trussXs = range(-4.9, 4.9, 0.7)
  trussXs.forEach((x, j) => {
    const t0 = T.trusses[0] + (j / trussXs.length) * (T.trusses[1] - T.trusses[0] - 0.012)
    const tt = { t0, t1: t0 + 0.012, anim: 'drop' as Anim, dist: 3 }
    P.lumber.push({ p: [x, WALL_TOP + 0.06, 0], s: [0.06, 0.1, D + 0.3], ...tt })
    P.lumber.push({ p: [x, WALL_TOP + RISE / 2 + 0.05, 0], s: [0.06, RISE, 0.06], ...tt })
    ;[-1, 1].forEach((side) => {
      const c = along(side, (D / 2 + EAVE) / 2, -0.07)
      P.lumber.push({ p: [x, c[1], c[2]], s: [0.06, 0.12, L], rot: [side * PITCH, 0, 0], ...tt })
    })
  })
  // wall sheathing (OSB) closes the frame
  houseWalls.forEach((w, k) => {
    const t0 = T.sheathing[0] + k * 0.008
    P.osb.push({ ...seg(w, (BASE + WALL_TOP) / 2, WALL_TOP - BASE, 0.03, 0.09), t0, t1: t0 + 0.02, anim: 'growY' })
  })
  garageWalls.slice(1).forEach((w, k) => {
    const t0 = T.sheathing[0] + 0.02 + k * 0.006
    P.osb.push({ ...seg(w, (0.25 + G.top) / 2, G.top - 0.25, 0.03, 0.09), t0, t1: t0 + 0.02, anim: 'growY' })
  })
  ;[-1, 1].forEach((side) =>
    P.osbGable.push({ p: [side * (W / 2 + 0.09), WALL_TOP + RISE / 2, 0], s: [0.03, RISE, D + 0.1], t0: T.sheathing[1] - 0.01, t1: T.sheathing[1] + 0.01, anim: 'scale' }),
  )

  /* ---------- 4. Roofing: deck, standing-seam rows from eave to ridge, ridge cap, fascia ---------- */
  const RW = W + 2 * EAVE
  ;[-1, 1].forEach((side) => {
    const c = along(side, (D / 2 + EAVE) / 2, 0.025)
    P.osb.push({ p: [0, c[1], c[2]], s: [RW, 0.05, L], rot: [side * PITCH, 0, 0], t0: T.roofDeck[0], t1: T.roofDeck[1], anim: 'drop', dist: 2 })
    const rows = 5
    for (let k = 0; k < rows; k++) {
      const f = (k + 0.5) / rows
      const absZ = (D / 2 + EAVE) * (1 - f)
      const q = along(side, absZ, 0.085)
      const t0 = T.shingles[0] + k * 0.009 + (side > 0 ? 0 : 0.004)
      P.roof.push({ p: [0, q[1], q[2]], s: [RW, 0.07, L / rows + 0.03], rot: [side * PITCH, 0, 0], t0, t1: t0 + 0.012, anim: 'drop', dist: 1.4 })
    }
    P.trimDark.push(
      { p: [0, yUnder(D / 2 + EAVE) - 0.04, side * (D / 2 + EAVE + 0.02)], s: [RW, 0.24, 0.05], t0: T.shingles[1] - 0.006, t1: T.shingles[1] + 0.008, anim: 'scale' },
      { p: [0, yUnder(D / 2 + EAVE) - 0.12, side * (D / 2 + EAVE / 2)], s: [RW, 0.04, EAVE], t0: T.shingles[1], t1: T.shingles[1] + 0.01, anim: 'scale' },
    )
  })
  P.roof.push({ p: [0, RIDGE + 0.2, 0], s: [RW, 0.1, 0.42], t0: T.shingles[1], t1: T.shingles[1] + 0.01, anim: 'drop', dist: 1 })
  // flat garage roof with a slim dark parapet
  P.roof.push({ p: [(G.x0 + G.x1) / 2, G.top + 0.3, (G.z0 + G.z1) / 2 + 0.1], s: [G.x1 - G.x0 + 0.5, 0.18, G.z1 - G.z0 + 0.7], t0: 0.52, t1: 0.545, anim: 'drop', dist: 2 })
  P.trimDark.push({ p: [(G.x0 + G.x1) / 2, G.top + 0.36, G.z1 + 0.46], s: [G.x1 - G.x0 + 0.5, 0.34, 0.06], t0: 0.545, t1: 0.56, anim: 'scale' })

  /* ---------- 5. Windows & doors ---------- */
  const WIN_OFF = 0.17
  const win = (axis: 'x' | 'z', side: number, u: number, cy: number, w: number, h: number, t0: number) => {
    const o = (axis === 'z' ? D / 2 : W / 2) + WIN_OFF
    const frame: Vec3 = axis === 'z' ? [w + 0.14, h + 0.14, 0.05] : [0.05, h + 0.14, w + 0.14]
    const pane: Vec3 = axis === 'z' ? [w, h, 0.04] : [0.04, h, w]
    const at = (d: number): Vec3 => (axis === 'z' ? [u, cy, side * (o + d)] : [side * (o + d), cy, u])
    const dir: Vec3 = axis === 'z' ? [0, 0, side] : [side, 0, 0]
    P.trimDark.push({ p: at(0), s: frame, t0, t1: t0 + 0.01, anim: 'scale' })
    P.panes.push({ p: at(0.03), s: pane, t0: t0 + 0.004, t1: t0 + 0.016, anim: 'slide', dir, dist: 1.6, lt: T.lights[0] + rand() * 0.07 })
  }
  const g1 = BASE + 0.95
  const g2 = BASE + FH + 0.8
  let wt = T.windows[0]
  const nextT = () => (wt += 0.0032)
  ;[[-3.6, 1.4], [1.2, 2.4], [3.8, 1.0]].forEach(([x, w]) => win('z', 1, x, g1, w, 1.3, nextT()))
  ;[[-3.6, 1.2], [-1.2, 1.0], [1.2, 1.2], [3.8, 1.0]].forEach(([x, w]) => win('z', 1, x, g2, w, 1.0, nextT()))
  ;[-3, 0, 3].forEach((x) => win('z', -1, x, g1, 1.6, 1.2, nextT()))
  ;[-3, 0, 3].forEach((x) => win('z', -1, x, g2, 1.2, 1.0, nextT()))
  win('x', -1, 0, BASE + 0.9, 2.6, 1.7, nextT()) // sliding door to the deck
  ;[-1.5, 1.5].forEach((z) => win('x', -1, z, g2 + 0.12, 1.0, 0.9, nextT()))
  win('x', 1, 0, g2, 1.2, 1.0, nextT())
  ;[-1, 1].forEach((side) => win('x', side, 0, WALL_TOP + 0.75, 0.7, 0.7, nextT()))
  // garage side window
  P.trimDark.push({ p: [G.x1 + WIN_OFF, 1.8, -0.8], s: [0.05, 0.94, 1.34], t0: nextT(), t1: wt + 0.01, anim: 'scale' })
  P.panes.push({ p: [G.x1 + WIN_OFF + 0.03, 1.8, -0.8], s: [0.04, 0.8, 1.2], t0: wt + 0.004, t1: wt + 0.016, anim: 'slide', dir: [1, 0, 0], dist: 1.6, lt: 0.95 })
  // front door
  P.trimDark.push({ p: [-1.2, BASE + 1.07, D / 2 + WIN_OFF], s: [1.14, 2.28, 0.05], t0: 0.645, t1: 0.655, anim: 'scale' })
  P.wood.push({ p: [-1.2, BASE + 1.05, D / 2 + WIN_OFF + 0.04], s: [1.0, 2.1, 0.06], t0: 0.65, t1: 0.665, anim: 'slide', dir: [0, 0, 1], dist: 1.5 })

  /* ---------- 6. Exterior finishes: siding, battens, stone, porch, garage door ---------- */
  houseWalls.forEach((w, k) => {
    const t0 = T.siding[0] + k * 0.008
    P.siding.push({ ...seg(w, (BASE + WALL_TOP) / 2, WALL_TOP - BASE, 0.04, 0.12), t0, t1: t0 + 0.02, anim: 'growY' })
    const pts = range(w.a + 0.3, w.b - 0.3, 0.55)
    pts.forEach((v, j) => {
      const yb = w.fixed === 5 ? BASE + FH : BASE // east wall is hidden by the garage below
      const h = WALL_TOP - yb
      const p: Vec3 = w.axis === 'x' ? [v, yb + h / 2, w.fixed + Math.sign(w.fixed) * 0.15] : [w.fixed + Math.sign(w.fixed) * 0.15, yb + h / 2, v]
      const s: Vec3 = w.axis === 'x' ? [0.05, h, 0.03] : [0.03, h, 0.05]
      const tb = T.siding[1] - 0.01 + (j / pts.length) * 0.03 + k * 0.004
      P.batten.push({ p, s, t0: tb, t1: tb + 0.01, anim: 'growY' })
    })
  })
  ;[-1, 1].forEach((side) =>
    P.sidingGable.push({ p: [side * (W / 2 + 0.12), WALL_TOP + RISE / 2, 0], s: [0.04, RISE, D + 0.2], t0: T.siding[1] - 0.012, t1: T.siding[1] + 0.006, anim: 'scale' }),
  )
  // stone veneer on the garage, leaving the door opening
  const st = T.trim[0]
  const gh = G.top - 0.25
  const gy = 0.25 + gh / 2
  P.stone.push(
    { p: [(G.x0 + DOOR.x0) / 2 + 0.06, gy, G.z1 + 0.12], s: [DOOR.x0 - G.x0 + 0.12, gh, 0.08], t0: st, t1: st + 0.015, anim: 'growY' },
    { p: [(DOOR.x1 + G.x1) / 2 + 0.06, gy, G.z1 + 0.12], s: [G.x1 - DOOR.x1 + 0.12, gh, 0.08], t0: st + 0.004, t1: st + 0.019, anim: 'growY' },
    { p: [(DOOR.x0 + DOOR.x1) / 2, 2.7, G.z1 + 0.12], s: [DOOR.x1 - DOOR.x0, 0.6, 0.08], t0: st + 0.012, t1: st + 0.022, anim: 'drop', dist: 1 },
    { p: [G.x1 + 0.12, gy, (G.z0 + G.z1) / 2], s: [0.08, gh, G.z1 - G.z0 + 0.2], t0: st + 0.006, t1: st + 0.021, anim: 'growY' },
    { p: [(G.x0 + G.x1) / 2, gy, G.z0 - 0.12], s: [G.x1 - G.x0 + 0.2, gh, 0.08], t0: st + 0.008, t1: st + 0.023, anim: 'growY' },
  )
  // garage door rolls down
  P.trimDark.push({ p: [(DOOR.x0 + DOOR.x1) / 2, 0.25 + 1.12, G.z1 + 0.08], s: [DOOR.x1 - DOOR.x0, 2.24, 0.06], t0: 0.765, t1: 0.785, anim: 'growY' })
  // covered front porch
  ;[-3.1, 0.7].forEach((x, k) => P.wood.push({ p: [x, 1.55, 5.3], s: [0.18, 2.7, 0.18], t0: 0.755 + k * 0.004, t1: 0.77 + k * 0.004, anim: 'growY' }))
  P.roof.push({ p: [-1.2, 2.97, 4.6], s: [4.6, 0.14, 2.4], t0: 0.775, t1: 0.79, anim: 'drop', dist: 1.5 })
  // trim band between floors
  P.trimDark.push({ p: [0, BASE + FH, D / 2 + 0.16], s: [W + 0.3, 0.07, 0.04], t0: 0.77, t1: 0.785, anim: 'scale' })

  /* ---------- 7. Outdoor living: deck, concrete, fence, landscaping ---------- */
  const O = T.outdoor[0]
  // concrete driveway, front walk and public sidewalk
  P.paving.push(
    { p: [(DOOR.x0 + DOOR.x1) / 2, 0.03, 8.1], s: [3.8, 0.06, 12.2], t0: O, t1: O + 0.03, anim: 'scale' },
    { p: [-1.2, 0.03, 8.9], s: [1.3, 0.06, 6.8], t0: O + 0.01, t1: O + 0.035, anim: 'scale' },
    { p: [0, 0.025, 13.2], s: [44, 0.05, 1.6], t0: O + 0.005, t1: O + 0.03, anim: 'scale' },
  )
  // deck: posts, joists, boards, railing, steps
  const deckPosts: [number, number][] = [
    [DECK.x0 + 0.2, DECK.z0 + 0.2], [DECK.x0 + 0.2, 0], [DECK.x0 + 0.2, DECK.z1 - 0.2],
    [-7.2, DECK.z0 + 0.2], [-7.2, DECK.z1 - 0.2],
  ]
  deckPosts.forEach(([x, z], k) => P.deck.push({ p: [x, DECK.y / 2, z], s: [0.16, DECK.y, 0.16], t0: O + 0.01 + k * 0.002, t1: O + 0.022 + k * 0.002, anim: 'growY' }))
  range(DECK.x0 + 0.2, DECK.x1 - 0.1, 0.5).forEach((x, k) =>
    P.deck.push({ p: [x, DECK.y - 0.14, 0], s: [0.06, 0.2, DECK.z1 - DECK.z0], t0: O + 0.02 + k * 0.0015, t1: O + 0.03 + k * 0.0015, anim: 'drop', dist: 1.5 }),
  )
  range(DECK.z0 + 0.07, DECK.z1 - 0.07, 0.15).forEach((z, k) =>
    P.wood.push({ p: [(DECK.x0 + DECK.x1) / 2, DECK.y - 0.02, z], s: [DECK.x1 - DECK.x0 + 0.1, 0.05, 0.13], t0: O + 0.03 + k * 0.0009, t1: O + 0.04 + k * 0.0009, anim: 'slide', dir: [-1, 0, 0], dist: 2 }),
  )
  const rail = O + 0.06
  ;[
    { p: [DECK.x0 + 0.05, DECK.y + 0.5, -1.5], s: [0.06, 0.06, 2.2] },
    { p: [DECK.x0 + 0.05, DECK.y + 0.5, 1.5], s: [0.06, 0.06, 2.2] },
    { p: [(DECK.x0 + DECK.x1) / 2, DECK.y + 0.5, DECK.z0 + 0.05], s: [4, 0.06, 0.06] },
    { p: [(DECK.x0 + DECK.x1) / 2, DECK.y + 0.5, DECK.z1 - 0.05], s: [4, 0.06, 0.06] },
  ].forEach((r, k) => P.trimDark.push({ ...(r as Pick<Part, 'p' | 's'>), t0: rail + k * 0.003, t1: rail + 0.01 + k * 0.003, anim: 'scale' }))
  ;[
    ...range(DECK.z0 + 0.05, -0.4, 0.55).map((z) => [DECK.x0 + 0.05, z]),
    ...range(0.4, DECK.z1 - 0.05, 0.55).map((z) => [DECK.x0 + 0.05, z]),
    ...range(DECK.x0 + 0.05, DECK.x1, 0.55).flatMap((x) => [[x, DECK.z0 + 0.05], [x, DECK.z1 - 0.05]]),
  ].forEach(([x, z], k) => P.trimDark.push({ p: [x, DECK.y + 0.25, z], s: [0.05, 0.5, 0.05], t0: rail + 0.004 + k * 0.0004, t1: rail + 0.012 + k * 0.0004, anim: 'growY' }))
  for (let k = 0; k < 3; k++)
    P.wood.push({ p: [DECK.x0 - 0.25 - k * 0.3, DECK.y - 0.2 - k * 0.22, 0], s: [0.3, 0.06, 1.2], t0: rail + 0.01 + k * 0.003, t1: rail + 0.02 + k * 0.003, anim: 'scale' })

  // backyard privacy fence
  const FZ = -8
  const FX = 13
  const fenceLines: { a: [number, number]; b: [number, number] }[] = [
    { a: [-FX, FZ], b: [FX, FZ] },
    { a: [-FX, FZ], b: [-FX, 1] },
    { a: [FX, FZ], b: [FX, -2] },
  ]
  let fk = 0
  fenceLines.forEach(({ a, b }) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1])
    const n = Math.round(len / 2.2)
    for (let i = 0; i <= n; i++) {
      const f = i / n
      const x = a[0] + (b[0] - a[0]) * f
      const z = a[1] + (b[1] - a[1]) * f
      const t0 = O + 0.03 + fk++ * 0.0012
      P.fence.push({ p: [x, 0.95, z], s: [0.16, 1.9, 0.16], t0, t1: t0 + 0.01, anim: 'growY' })
      if (i < n) {
        const xm = a[0] + (b[0] - a[0]) * (f + 0.5 / n)
        const zm = a[1] + (b[1] - a[1]) * (f + 0.5 / n)
        const seglen = len / n
        const along = Math.abs(b[0] - a[0]) > 0.01
        P.fence.push({ p: [xm, 0.88, zm], s: along ? [seglen, 1.6, 0.05] : [0.05, 1.6, seglen], t0: t0 + 0.01, t1: t0 + 0.022, anim: 'growY' })
      }
    }
  })

  // planting beds, shrubs and trees
  const beds: [number, number, number, number][] = [
    [-4.1, D / 2 + 0.75, 1.6, 1.1],
    [2.6, D / 2 + 0.75, 4.2, 1.1],
    [10.2, 2.5, 1.2, 4],
  ]
  beds.forEach(([x, z, w, d], k) => P.mulch.push({ p: [x, 0.06, z], s: [w, 0.12, d], t0: O + 0.05 + k * 0.003, t1: O + 0.06 + k * 0.003, anim: 'growY' }))
  ;[[-4.6, 4.2], [-3.6, 4.3], [1.0, 4.2], [2.0, 4.3], [3.2, 4.2], [4.3, 4.3], [10.2, 1.2], [10.2, 2.6], [10.2, 4.0]].forEach(([x, z], k) => {
    const r = 0.5 + rand() * 0.25
    const t0 = O + 0.06 + k * 0.002
    P.shrubs.push({ p: [x, r * 0.5, z], s: [r, r * 0.9, r], t0, t1: t0 + 0.015, anim: 'scale' })
  })
  const trees: [number, number][] = [[-12, 7], [-14, -3], [-10, -6.4], [3, -6.6], [11, -6], [13.5, 7.5], [-6, 10.5], [2.5, 10.8]]
  trees.forEach(([x, z], k) => {
    const t0 = O + 0.06 + (k / trees.length) * 0.05
    const h = 1.5 + rand() * 0.8
    const c = 1.8 + rand() * 1.0
    P.trunks.push({ p: [x, h / 2, z], s: [0.2, h, 0.2], t0, t1: t0 + 0.02, anim: 'growY' })
    P.crowns.push({ p: [x, h + c * 0.36, z], s: [c, c * 1.15, c], t0: t0 + 0.01, t1: t0 + 0.03, anim: 'scale' })
  })
  // lighting: porch, garage and path lights
  const L0 = T.lights[0]
  ;[[-2.0, 2.1, D / 2 + 0.25], [-0.4, 2.1, D / 2 + 0.25], [5.4, 2.4, G.z1 + 0.22], [9.0, 2.4, G.z1 + 0.22]].forEach(([x, y, z], k) =>
    P.lampHeads.push({ p: [x, y, z], s: [0.16, 0.26, 0.1], t0: 0.78 + k * 0.002, t1: 0.79 + k * 0.002, anim: 'scale' }),
  )
  ;[6.5, 8.5, 10.5, 12.0].forEach((z, k) =>
    [-2.1, -0.3].forEach((x, j) => P.lampHeads.push({ p: [x, 0.3, z], s: [0.12, 0.6, 0.12], t0: L0 - 0.02 + k * 0.002 + j * 0.001, t1: L0 + k * 0.002 + j * 0.001, anim: 'growY' })),
  )

  return P
}

export type BuildingParts = ReturnType<typeof buildParts>
