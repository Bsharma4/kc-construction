/** Capability helpers used to scale animation and 3D cost to the device. */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const isTouchDevice = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches

export const isLowPowerDevice = (): boolean => {
  if (typeof navigator === 'undefined') return false
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8
  const small = window.innerWidth < 768
  return cores <= 4 || memory <= 4 || (small && isTouchDevice())
}
