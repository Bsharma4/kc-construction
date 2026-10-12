import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'

/** Number that counts up when scrolled into view and back down when scrolled past in reverse. */
export function Counter({ to, suffix = '', pad = 0 }: { to: number; suffix?: string; pad?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const fmt = (n: number) => String(Math.round(n)).padStart(pad, '0') + suffix
  useGSAP(() => {
    const el = ref.current!
    const obj = { v: 0 }
    gsap.to(obj, {
      v: to,
      duration: 2,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = fmt(obj.v)
      },
      scrollTrigger: { trigger: el, start: 'top 90%', toggleActions: 'play none none reverse' },
    })
  })
  return (
    <span ref={ref} aria-label={`${to}${suffix}`}>
      {fmt(0)}
    </span>
  )
}
