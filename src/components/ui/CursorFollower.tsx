import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery'

/** Small ring that trails the pointer and grows over interactive elements (desktop only). */
export function CursorFollower() {
  const ring = useRef<HTMLDivElement>(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()
  useGSAP(
    () => {
      if (!fine || reduced || !ring.current) return
      const el = ring.current
      gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 })
      const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3' })
      const move = (e: PointerEvent) => {
        xTo(e.clientX)
        yTo(e.clientY)
        const interactive = (e.target as HTMLElement)?.closest?.('a,button,[role="button"],input,select,textarea,label')
        gsap.to(el, { scale: interactive ? 2.2 : 1, autoAlpha: 1, duration: 0.3, overwrite: 'auto' })
      }
      const out = () => gsap.to(el, { autoAlpha: 0, duration: 0.3 })
      window.addEventListener('pointermove', move)
      document.documentElement.addEventListener('pointerleave', out)
      return () => {
        window.removeEventListener('pointermove', move)
        document.documentElement.removeEventListener('pointerleave', out)
      }
    },
    { dependencies: [fine, reduced] },
  )
  if (!fine || reduced) return null
  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] h-7 w-7 rounded-full border border-brand/80 mix-blend-difference"
    />
  )
}
