import { useEffect, useRef, type ReactNode, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { lockScroll } from '../../lib/smoothScroll'

type Props = {
  open: boolean
  onClose: () => void
  label: string
  children: ReactNode
  variant?: 'panel' | 'fullscreen'
  onKey?: (e: KeyboardEvent) => void
}

/** Accessible dialog: portal, scroll lock, focus trap, Escape to close, focus restore. */
export function Modal({ open, onClose, label, children, variant = 'panel', onKey }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const backdrop = useRef<HTMLDivElement>(null)
  const restore = useRef<HTMLElement | null>(null)
  const closeRef = useRef(onClose)
  const keyRef = useRef(onKey)
  useLayoutEffect(() => {
    closeRef.current = onClose
    keyRef.current = onKey
  })

  useEffect(() => {
    if (!open) return
    restore.current = document.activeElement as HTMLElement
    lockScroll(true)
    const focusables = () =>
      panel.current?.querySelectorAll<HTMLElement>('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') ?? []
    setTimeout(() => focusables()[0]?.focus({ preventScroll: true }), 30)
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeRef.current()
      if (e.key === 'Tab') {
        const f = focusables()
        if (!f.length) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
      keyRef.current?.(e)
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      lockScroll(false)
      restore.current?.focus?.({ preventScroll: true })
    }
  }, [open])

  useGSAP(
    () => {
      if (!open) return
      gsap.fromTo(backdrop.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: 'power2.out' })
      gsap.fromTo(
        panel.current,
        { y: variant === 'panel' ? 60 : 0, autoAlpha: 0, scale: variant === 'panel' ? 0.98 : 1.02 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: 'expo.out' },
      )
    },
    { dependencies: [open] },
  )

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" data-lenis-prevent>
      <div ref={backdrop} className="absolute inset-0 bg-ink/85 backdrop-blur-md" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={
          variant === 'panel'
            ? 'relative z-10 max-h-[92svh] w-full max-w-6xl overflow-y-auto rounded-t-2xl border border-white/10 bg-ink-2 sm:m-6 sm:rounded-2xl'
            : 'relative z-10 flex h-full w-full items-center justify-center'
        }
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 grid h-11 w-11 place-items-center rounded-full border border-bone/20 bg-ink/70 text-bone backdrop-blur transition-colors hover:border-brand hover:text-brand-bright"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  )
}
