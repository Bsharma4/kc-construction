import { useEffect, useRef, useState } from 'react'
import { Menu, Phone, X } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import logo160 from '../../assets/brand/logo-160.webp'
import logo320 from '../../assets/brand/logo-320.webp'
import logo640 from '../../assets/brand/logo-640.webp'
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

/** Official K&S Construction logo (transparent WebP, original artwork, aspect ratio preserved). */
export function Logo({ className = 'h-11 sm:h-12', eager = false, sizes = '80px' }: { className?: string; eager?: boolean; sizes?: string }) {
  return (
    <img
      src={logo320}
      srcSet={`${logo160} 160w, ${logo320} 320w, ${logo640} 640w`}
      sizes={sizes}
      width={1503}
      height={901}
      alt="K&S Construction"
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`w-auto select-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)] ${className}`}
      draggable={false}
    />
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
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-brand focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <div
        className={`transition-all duration-500 ${scrolled || open ? 'glass border-b border-white/[0.07] py-3' : 'border-b border-transparent bg-transparent py-5'}`}
      >
        <nav className="container-x flex items-center justify-between gap-6" aria-label="Primary">
          <a href="#home" onClick={(e) => navigate(e, '#home', () => setOpen(false))} aria-label="K&S Construction — home">
            <Logo eager className="h-11 sm:h-[52px]" />
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
                    className={`absolute inset-x-3.5 -bottom-0.5 h-px origin-left bg-brand transition-transform duration-500 ${active === l.href ? 'scale-x-100' : 'scale-x-0'}`}
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
              className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white sm:hidden"
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
                  <span className="font-mono text-xs text-brand-bright">0{i + 1}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="container-x pb-10">
            <a
              data-menu-item
              href={telHref}
              onClick={hasPhone ? () => setOpen(false) : (e) => navigate(e, '#contact', () => setOpen(false))}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-4 font-semibold text-white"
            >
              <Phone size={18} /> {CALL_LABEL}
            </a>
          </div>
        </div>
      )}
    </header>
  )
}
