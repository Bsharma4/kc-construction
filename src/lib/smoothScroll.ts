import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'
import { prefersReducedMotion } from './device'

let lenis: Lenis | null = null
let tick: ((time: number) => void) | null = null

/** Starts Lenis smooth scrolling, driven by the GSAP ticker so ScrollTrigger stays in sync. */
export function initSmoothScroll(): () => void {
  if (prefersReducedMotion()) return () => {}
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.2 })
  lenis.on('scroll', ScrollTrigger.update)
  tick = (time: number) => lenis?.raf(time * 1000)
  gsap.ticker.add(tick)
  gsap.ticker.lagSmoothing(0)
  return () => {
    if (tick) gsap.ticker.remove(tick)
    lenis?.destroy()
    lenis = null
    tick = null
  }
}

export function getLenis(): Lenis | null {
  return lenis
}

/** Scrolls to a selector / element / pixel offset, with or without Lenis. */
export function scrollToTarget(target: string | HTMLElement | number, offset = 0): void {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) })
    return
  }
  let top = 0
  if (typeof target === 'number') top = target
  else {
    const el = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : target
    if (!el) return
    top = el.getBoundingClientRect().top + window.scrollY
  }
  window.scrollTo({ top: top + offset, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
}

export function lockScroll(locked: boolean): void {
  if (lenis) {
    if (locked) lenis.stop()
    else lenis.start()
  }
  document.documentElement.style.overflow = locked ? 'hidden' : ''
}
