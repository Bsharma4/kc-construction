/**
 * Shared mutable state between the GSAP ScrollTrigger timeline (DOM side)
 * and the React Three Fiber render loop (WebGL side). Using a plain object
 * avoids React re-renders on every scroll frame.
 */
export const constructionStore = {
  /** 0 → empty site, 1 → finished, landscaped building. Scrubbed by ScrollTrigger. */
  progress: 0,
  /** Normalised pointer position, -1..1 */
  pointer: { x: 0, y: 0 },
  /** Whether the canvas is on screen (used to pause rendering). */
  visible: false,
}

export type ConstructionStage = {
  id: string
  label: string
  caption: string
  start: number
}

export const CONSTRUCTION_STAGES: ConstructionStage[] = [
  { id: 'site', label: 'Site Prep & Excavation', caption: 'Staking the lot, Bobcat work, excavation and grading.', start: 0 },
  { id: 'foundation', label: 'Foundation', caption: 'Footings, rebar and a poured concrete slab.', start: 0.08 },
  { id: 'framing', label: 'Framing', caption: 'Walls, floor joists and roof trusses go up.', start: 0.2 },
  { id: 'roofing', label: 'Roofing', caption: 'Roof deck, metal roofing, ridge and fascia.', start: 0.465 },
  { id: 'windows', label: 'Windows & Doors', caption: 'Windows, the deck slider and the front door are set.', start: 0.585 },
  { id: 'finishes', label: 'Exterior Finishes', caption: 'Board-and-batten siding, stone, porch and garage door.', start: 0.685 },
  { id: 'outdoor', label: 'Outdoor & Landscaping', caption: 'Deck, concrete drive, fencing, lawn and lighting.', start: 0.8 },
]

export function stageIndexFor(progress: number): number {
  let idx = 0
  CONSTRUCTION_STAGES.forEach((s, i) => {
    if (progress >= s.start) idx = i
  })
  return idx
}
