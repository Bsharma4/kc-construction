import { useRef, type ReactNode, type MouseEvent } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery'

type Props = {
  children: ReactNode
  href?: string
  onClick?: (e: MouseEvent<HTMLElement>) => void
  variant?: 'primary' | 'ghost' | 'light'
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  ariaLabel?: string
  strength?: number
}

const styles = {
  primary: 'bg-orange text-ink hover:bg-bone',
  ghost: 'border border-bone/25 text-bone hover:border-bone/60 bg-white/0 hover:bg-white/5',
  light: 'bg-bone text-ink hover:bg-orange',
}

/** Button / link that is pulled toward the pointer, with an inner label that moves further. */
export function MagneticButton({
  children,
  href,
  onClick,
  variant = 'primary',
  className = '',
  type = 'button',
  disabled,
  ariaLabel,
  strength = 0.35,
}: Props) {
  const ref = useRef<HTMLElement>(null)
  const inner = useRef<HTMLSpanElement>(null)
  const fine = useFinePointer()
  const reduced = useReducedMotion()

  useGSAP(
    () => {
      const el = ref.current
      if (!el || !fine || reduced) return
      const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
      const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
      const ixTo = gsap.quickTo(inner.current, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
      const iyTo = gsap.quickTo(inner.current, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.4)' })
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        xTo(dx * strength)
        yTo(dy * strength)
        ixTo(dx * strength * 0.4)
        iyTo(dy * strength * 0.4)
      }
      const leave = () => {
        xTo(0)
        yTo(0)
        ixTo(0)
        iyTo(0)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerleave', leave)
      return () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerleave', leave)
      }
    },
    { dependencies: [fine, reduced] },
  )

  const cls = `group relative inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-colors duration-300 will-change-transform disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`
  const content = (
    <span ref={inner} className="relative inline-flex items-center gap-2.5">
      {children}
    </span>
  )
  if (href)
    return (
      <a ref={ref as React.Ref<HTMLAnchorElement>} href={href} onClick={onClick} className={cls} aria-label={ariaLabel}>
        {content}
      </a>
    )
  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      className={cls}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  )
}
