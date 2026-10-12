import { useEffect, useRef, useState } from 'react'
import { Menu, Phone, X } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { lockScroll, scrollToTarget } from '../../lib/smoothScroll'
import { CallButton } from '../ui/CallButton'
import { CALL_LABEL, hasPhone, telHref } from '../../lib/site'

export const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Projects', href: '#projects' },
  { label: 'Process', href: '#process' },
  { label: 'Reviews', href: '#reviews' },
  { label: 'Contact', href: '#contact' },
]

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-9 w-9 place-items-center rounded-[10px] bg-bone text-ink">
        <span className="font-display-x text-[0.95rem] font-black tracking-tighter">K&amp;C</span>
        <span className="absolute -bottom-1 -right-1 h-2.5 w-2.5 bg-orange" />
      </span>
      <span className="leading-none">
        <span className="font-display-x block text-[0.95rem] font-extrabold uppercase tracking-tight">K&amp;C</span>
        <span className="block font-mono text-[0.58rem] uppercase tracking-[0.3em] text-bone/60">Construction</span>
      </span>
    </span>
  )
}

export function navigate(e: React.MouseEvent, href: string, after?: () => void) {
  e.preventDefault()
  const go = () => scrollToTarget(href === '#home' ? 0 : href)
  if (after) {
    // closing the mobile menu releases the scroll lock in an effect — scroll once that has run
    after()
    requestAnimationFrame(() => requestAnimationFrame(go))
  } else go()
  history.replaceState(null, '', href)
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('#home')
  const menuRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Active-section tracking
  useEffect(() => {
    const ids = NAV_LINKS.map((l) => l.href.slice(1))
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive('#' + e.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  // Mobile menu: scroll lock, Escape to close, focus management
  useEffect(() => {
    lockScroll(open)
    if (!open) return
    const first = menuRef.current?.querySelector<HTMLElement>('a,button')
    first?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
      if (e.key === 'Tab' && menuRef.current) {
        const f = menuRef.current.querySelectorAll<HTMLElement>('a,button')
        const a = f[0]
        const b = f[f.length - 1]
        if (e.shiftKey && document.activeElement === a) {
          e.preventDefault()
          b.focus()
        } else if (!e.shiftKey && document.activeElement === b) {
          e.preventDefault()
          a.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  useGSAP(
    () => {
      if (!open || !menuRef.current) return
      gsap.from(menuRef.current.querySelectorAll('[data-menu-item]'), {
        yPercent: 100,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.05,
        ease: 'power4.out',
      })
    },
    { dependencies: [open] },
  )

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-orange focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <div
        className={`transition-all duration-500 ${scrolled || open ? 'glass border-b border-white/[0.07] py-3' : 'border-b border-transparent bg-transparent py-5'}`}
      >
        <nav className="container-x flex items-center justify-between gap-6" aria-label="Primary">
          <a href="#home" onClick={(e) => navigate(e, '#home', () => setOpen(false))} aria-label="K&C Construction — home">
            <Logo />
          </a>
          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => navigate(e, l.href)}
                  aria-current={active === l.href ? 'true' : undefined}
                  className={`relative rounded-full px-3.5 py-2 text-[0.82rem] font-medium tracking-wide transition-colors ${active === l.href ? 'text-bone' : 'text-bone/60 hover:text-bone'}`}
                >
                  {l.label}
                  <span
                    className={`absolute inset-x-3.5 -bottom-0.5 h-px origin-left bg-orange transition-transform duration-500 ${active === l.href ? 'scale-x-100' : 'scale-x-0'}`}
                  />
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <CallButton compact onNavigate={() => setOpen(false)} className="whitespace-nowrap !px-5 !py-2.5 max-sm:!hidden" />
            <a
              href={telHref}
              onClick={hasPhone ? undefined : (e) => navigate(e, '#contact', () => setOpen(false))}
              aria-label={CALL_LABEL}
              className="grid h-11 w-11 place-items-center rounded-full bg-orange text-ink sm:hidden"
            >
              <Phone size={18} />
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="grid h-11 w-11 place-items-center rounded-full border border-bone/20 lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </div>
      {open && (
        <div
          id="mobile-menu"
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="glass fixed inset-x-0 bottom-0 top-[68px] z-40 overflow-y-auto border-t border-white/10 lg:hidden"
        >
          <ul className="container-x flex flex-col gap-1 py-8">
            {NAV_LINKS.map((l, i) => (
              <li key={l.href} className="overflow-hidden border-b border-white/[0.07]">
                <a
                  data-menu-item
                  href={l.href}
                  onClick={(e) => navigate(e, l.href, () => setOpen(false))}
                  className="flex items-baseline justify-between py-4"
                >
                  <span className="font-display-x text-3xl font-extrabold uppercase">{l.label}</span>
                  <span className="font-mono text-xs text-orange">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="container-x pb-10">
            <a
              data-menu-item
              href={telHref}
              onClick={hasPhone ? () => setOpen(false) : (e) => navigate(e, '#contact', () => setOpen(false))}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-orange px-6 py-4 font-semibold text-ink"
            >
              <Phone size={18} /> {CALL_LABEL}
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
