import { useRef } from 'react'
import { ArrowDown, ArrowUpRight } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { IMG } from '../../lib/images'
import { SmartImage } from '../ui/SmartImage'
import { MagneticButton } from '../ui/MagneticButton'
import { navigate } from '../layout/Navbar'
import { CallButton } from '../ui/CallButton'
import { BID_LABEL, SITE, telHref } from '../../lib/site'

const TICKER = ['Custom Homes', 'Remodeling', 'Decks & Patios', 'Concrete', 'Excavation', 'Bobcat Work', 'Light Hauling', 'Landscaping', 'Fencing', 'Land Grading']

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const spot = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // intro
        const tl = gsap.timeline({ delay: 0.15 })
        tl.from('.hero-bg', { scale: 1.25, duration: 2.4, ease: 'power3.out' }, 0)
          .from('.hero-line', { yPercent: 115, rotate: 3, duration: 1.3, stagger: 0.12, ease: 'power4.out' }, 0.2)
          .from('.hero-fade', { y: 30, autoAlpha: 0, duration: 1, stagger: 0.1 }, 0.8)
          .from('.hero-rule', { scaleX: 0, transformOrigin: 'left', duration: 1.4, ease: 'expo.out' }, 0.6)

        // scroll-out: parallax layers move at different speeds
        const out = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
        })
        out.to('.hero-bg', { yPercent: 25, scale: 1.12, ease: 'none' }, 0)
          .to('.hero-title', { yPercent: -35, ease: 'none' }, 0)
          .to('.hero-meta', { yPercent: -80, autoAlpha: 0, ease: 'none' }, 0)
          .to('.hero-shade', { opacity: 1, ease: 'none' }, 0)

        // pointer-following light
        const el = spot.current!
        const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3' })
        const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3' })
        const bgX = gsap.quickTo('.hero-bg-inner', 'x', { duration: 1.2, ease: 'power3' })
        const bgY = gsap.quickTo('.hero-bg-inner', 'y', { duration: 1.2, ease: 'power3' })
        const move = (e: PointerEvent) => {
          const r = root.current!.getBoundingClientRect()
          xTo(e.clientX - r.left)
          yTo(e.clientY - r.top)
          bgX((e.clientX / window.innerWidth - 0.5) * -24)
          bgY((e.clientY / window.innerHeight - 0.5) * -16)
        }
        root.current!.addEventListener('pointermove', move)
        return () => root.current?.removeEventListener('pointermove', move)
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="home" className="grain relative flex min-h-[100svh] flex-col overflow-hidden bg-ink" aria-label="Introduction">
      <div className="hero-bg absolute inset-0 will-change-transform">
        <div className="hero-bg-inner absolute -inset-8">
          <SmartImage photo={IMG.houseFraming} width={2000} alt="Wood-framed house under construction" eager fetchPriority="high" className="h-full w-full" imgClassName="opacity-70" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/35 to-ink" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/85 via-ink/30 to-transparent" />
      <div className="grid-lines absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div
        ref={spot}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(209,31,38,0.18),transparent_65%)] mix-blend-screen"
      />
      <div className="hero-shade pointer-events-none absolute inset-0 bg-ink opacity-0" />

      <div className="container-x relative z-10 flex flex-1 flex-col justify-end pb-20 pt-28 sm:pb-28 sm:pt-36 md:pb-32">
        <div className="hero-meta hero-fade mb-6 flex sm:mb-8 flex-wrap items-center gap-x-6 gap-y-2">
          <span className="eyebrow flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" /> K&amp;S Construction · Waterloo, Illinois
          </span>
          <span className="eyebrow hidden sm:inline">Second generation owned &amp; operated · Licensed &amp; insured</span>
        </div>
        <h1 className="hero-title font-display-x text-[clamp(2.15rem,9.5vw,9.5rem)] [@media(max-height:520px)]:text-[clamp(2rem,6.5vw,4.2rem)] font-black uppercase text-bone">
          <span className="line-mask"><span className="hero-line">Built for</span></span>
          <span className="line-mask"><span className="hero-line">your home<span className="text-brand-bright">.</span></span></span>
          <span className="line-mask"><span className="hero-line text-stroke">Built to last.</span></span>
        </h1>
        <div className="hero-rule mt-6 h-px sm:mt-10 w-full bg-bone/20" />
        <div className="hero-meta mt-6 flex flex-col gap-6 sm:mt-8 sm:gap-8 md:flex-row md:items-end md:justify-between">
          <p className="hero-fade max-w-xl text-base leading-relaxed text-bone/75 sm:text-lg md:text-xl">
            Family-owned residential construction, remodeling and outdoor improvements in Waterloo, Illinois — from excavation and concrete to decks, fencing and landscaping.
          </p>
          <div className="hero-fade flex flex-wrap gap-3">
            <CallButton />
            <MagneticButton href="#contact" variant="ghost" onClick={(e) => navigate(e, '#contact')}>
              {BID_LABEL} <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:rotate-45" />
            </MagneticButton>
            <a href={telHref} className="w-full font-mono text-sm tracking-wider text-bone/70 transition-colors hover:text-brand-bright">
              {SITE.phone} · Waterloo, IL
            </a>
          </div>
        </div>
      </div>

      <a
        href="#construction"
        onClick={(e) => navigate(e, '#construction')}
        className="hero-fade absolute bottom-8 right-[clamp(1rem,4vw,3.5rem)] z-10 hidden flex-col items-center gap-3 md:flex"
        aria-label="Scroll to the construction experience"
      >
        <span className="eyebrow [writing-mode:vertical-rl]">Scroll</span>
        <span className="relative h-12 w-7 rounded-full border border-bone/40">
          <span className="animate-scroll-dot absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-brand" />
        </span>
        <ArrowDown size={14} className="text-bone/60" />
      </a>

      <div className="relative z-10 overflow-hidden border-y border-white/[0.07] bg-ink/60 py-3 backdrop-blur" aria-hidden>
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="flex items-center gap-10 font-mono text-xs uppercase tracking-[0.3em] text-bone/55">
              {t} <span className="h-1 w-1 rotate-45 bg-brand" />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
