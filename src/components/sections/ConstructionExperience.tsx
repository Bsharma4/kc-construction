import { Component, Suspense, lazy, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { CONSTRUCTION_STAGES, constructionStore, stageIndexFor } from '../../lib/constructionStore'
import { isLowPowerDevice } from '../../lib/device'
import { useReducedMotion } from '../../hooks/useMediaQuery'

const ConstructionScene = lazy(() => import('../three/ConstructionScene'))

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.warn('[K&S] 3D scene failed, using 2D construction fallback.', err)
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** 2D elevation that still constructs with scroll — used only when WebGL is unavailable. */
function ElevationFallback() {
  const ref = useRef<SVGSVGElement>(null)
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const p = constructionStore.progress
      ref.current?.querySelectorAll<SVGElement>('[data-t]').forEach((el) => {
        const t = Number(el.dataset.t)
        el.style.opacity = String(Math.min(1, Math.max(0, (p - t) / 0.04)))
      })
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="blueprint-grid absolute inset-0 flex items-end justify-center pb-[12vh]">
      <svg ref={ref} viewBox="0 0 400 300" className="h-[56vh] w-auto max-w-[92vw]" aria-hidden>
        <rect x="30" y="276" width="340" height="10" fill="#8a857d" data-t="0.13" />
        {[0, 1].map((f) => (
          <g key={f}>
            {Array.from({ length: 10 }).map((_, i) => (
              <rect key={i} x={60 + i * 21} y={206 - f * 70} width="4" height="70" fill="#cfa36a" data-t={0.21 + f * 0.1 + i * 0.004} />
            ))}
            <rect x="56" y={204 - f * 70} width="200" height="4" fill="#cfa36a" data-t={0.25 + f * 0.1} />
          </g>
        ))}
        <polygon points="44,136 156,70 268,136" fill="#2a2d32" data-t="0.5" />
        <rect x="58" y="136" width="196" height="140" fill="#ece6db" data-t="0.7" />
        {[78, 138, 198].map((x) => (
          <g key={x}>
            <rect x={x} y="160" width="36" height="34" fill="#2a3846" data-t="0.6" />
            <rect x={x} y="160" width="36" height="34" fill="#ffd08a" opacity="0" data-t="0.92" />
            <rect x={x} y="220" width="36" height="34" fill="#2a3846" data-t="0.6" />
            <rect x={x} y="220" width="36" height="34" fill="#ffd08a" opacity="0" data-t="0.94" />
          </g>
        ))}
        <rect x="256" y="196" width="96" height="80" fill="#8b8075" data-t="0.73" />
        <rect x="270" y="216" width="68" height="60" fill="#1b1d21" data-t="0.77" />
        <rect x="256" y="190" width="100" height="8" fill="#2a2d32" data-t="0.52" />
      </svg>
    </div>
  )
}

/**
 * The pinned, ~500vh scroll-driven construction sequence.
 * One GSAP timeline (scrubbed) drives `constructionStore.progress` 0→1; the WebGL scene reads it every frame.
 */
export function ConstructionExperience() {
  const section = useRef<HTMLElement>(null)
  const pctRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef(0)
  const [stage, setStage] = useState(0)
  const [active, setActive] = useState(false)
  const reduced = useReducedMotion()
  const webgl = useMemo(() => hasWebGL(), [])
  const quality = useMemo(() => (isLowPowerDevice() ? 'low' : 'high') as 'low' | 'high', [])

  // Only render WebGL while the section is near the viewport.
  useEffect(() => {
    const el = section.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      setActive(e.isIntersecting)
      constructionStore.visible = e.isIntersecting
    }, { rootMargin: '200px 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Pointer parallax input.
  useEffect(() => {
    if (reduced) return
    const move = (e: PointerEvent) => {
      if (!constructionStore.visible) return
      constructionStore.pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      constructionStore.pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [reduced])

  useGSAP(
    () => {
      constructionStore.progress = 0
      const sync = () => {
        const p = constructionStore.progress
        if (pctRef.current) pctRef.current.textContent = String(Math.round(p * 100)).padStart(3, '0')
        if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
        const idx = stageIndexFor(p)
        if (idx !== stageRef.current) {
          stageRef.current = idx
          setStage(idx)
        }
      }
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          id: 'construction',
          trigger: section.current,
          start: 'top top',
          end: () => `+=${window.innerHeight * 5}`,
          pin: true,
          scrub: reduced ? true : 1,
          refreshPriority: 10,
          invalidateOnRefresh: true,
        },
      })
      tl.to(constructionStore, { progress: 1, duration: 1, onUpdate: sync }, 0)
      tl.to('.cx-intro-line', { yPercent: -120, autoAlpha: 0, stagger: 0.008, duration: 0.05, ease: 'power2.in' }, 0.03)
      tl.to('.cx-intro-sub', { autoAlpha: 0, y: -20, duration: 0.04 }, 0.03)
      tl.fromTo('.cx-hud', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.04, ease: 'power2.out' }, 0.05)
      tl.to('.cx-hud', { autoAlpha: 0, y: 20, duration: 0.04, ease: 'power2.in' }, 0.89)
      gsap.set('.cx-final-line', { yPercent: 120, autoAlpha: 0 })
      gsap.set('.cx-final-sub', { y: 20, autoAlpha: 0 })
      tl.to('.cx-final-line', { yPercent: 0, autoAlpha: 1, stagger: 0.012, duration: 0.05, ease: 'power3.out' }, 0.9)
      tl.to('.cx-final-sub', { autoAlpha: 1, y: 0, duration: 0.04 }, 0.94)
      sync()
      if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__KC__ = { store: constructionStore, ScrollTrigger }
    },
    { scope: section, dependencies: [reduced], revertOnUpdate: true },
  )

  const current = CONSTRUCTION_STAGES[stage]

  return (
    <section
      ref={section}
      id="construction"
      aria-label="Scroll-driven 3D construction of a family home"
      className="relative h-[100svh] w-full overflow-hidden bg-ink"
    >
      <div className="absolute inset-0">
        {webgl ? (
          <SceneBoundary fallback={<ElevationFallback />}>
            <Suspense fallback={<div className="absolute inset-0 grid place-items-center"><span className="eyebrow animate-pulse">Preparing site…</span></div>}>
              <ConstructionScene active={active} quality={quality} interactive={!reduced} />
            </Suspense>
          </SceneBoundary>
        ) : (
          <ElevationFallback />
        )}
      </div>

      {/* cinematic vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(8,8,9,0.65)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ink/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-ink/85 to-transparent" />

      {/* 0% — opening statement */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <h2 className="font-display-x text-[clamp(1.9rem,6.4vw,6rem)] font-extrabold uppercase text-bone drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <span className="line-mask"><span className="cx-intro-line">Every great home</span></span>
          <span className="line-mask"><span className="cx-intro-line">starts with</span></span>
          <span className="line-mask"><span className="cx-intro-line text-brand-bright">solid ground.</span></span>
        </h2>
        <p className="cx-intro-sub eyebrow mt-8">Scroll to break ground ↓</p>
      </div>

      {/* 100% — final reveal */}
      <div className="pointer-events-none absolute inset-x-0 top-[13vh] flex flex-col items-center px-4 text-center [@media(max-height:520px)]:top-[19vh]">
        <h2 className="font-display-x text-[clamp(2rem,6vw,5.6rem)] [@media(max-height:520px)]:text-[clamp(1.4rem,4.4vw,2.6rem)] font-extrabold uppercase text-bone drop-shadow-[0_4px_40px_rgba(0,0,0,0.6)]">
          <span className="line-mask"><span className="cx-final-line invisible">Built for your home.</span></span>
          <span className="line-mask"><span className="cx-final-line invisible">Built to <span className="text-brand-bright">last.</span></span></span>
        </h2>
        <p className="cx-final-sub invisible mt-6 max-w-md text-sm text-bone/75 md:text-base [@media(max-height:520px)]:mt-2 [@media(max-height:520px)]:text-xs">
          Excavation, concrete, framing, roofing, decks, fencing and landscaping — one family team from start to finish.
        </p>
      </div>

      {/* progress HUD */}
      <div className="cx-hud invisible absolute inset-x-0 bottom-0 px-4 pb-6 md:px-10 md:pb-10 [@media(max-height:520px)]:pb-3">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-5 md:flex-row [@media(max-height:520px)]:gap-2 md:items-end md:justify-between">
          <div aria-live="polite" className="max-w-md">
            <p className="eyebrow mb-2 !text-brand">
              Stage {String(stage + 1).padStart(2, '0')} / {String(CONSTRUCTION_STAGES.length).padStart(2, '0')}
            </p>
            <p key={current.id} className="font-display-x text-2xl font-extrabold uppercase text-bone md:text-4xl [@media(max-height:520px)]:text-lg">
              {current.label}
            </p>
            <p className="mt-2 text-sm text-bone/70 [@media(max-height:520px)]:hidden">{current.caption}</p>
          </div>
          <div className="w-full md:w-[460px]">
            <div className="mb-3 flex items-end justify-between">
              <span className="eyebrow">Construction progress</span>
              <span className="font-mono text-3xl text-bone md:text-5xl">
                <span ref={pctRef}>000</span>
                <span className="text-brand-bright">%</span>
              </span>
            </div>
            <div className="relative h-[3px] w-full overflow-hidden bg-bone/15">
              <div ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-brand" />
            </div>
            <ol className="mt-3 hidden grid-cols-7 gap-1.5 lg:grid">
              {CONSTRUCTION_STAGES.map((s, i) => (
                <li
                  key={s.id}
                  className={`font-mono text-[0.6rem] uppercase leading-tight tracking-wider transition-colors duration-500 ${i <= stage ? 'text-bone' : 'text-bone/30'}`}
                >
                  <span className={`mb-1.5 block h-1 w-1 rounded-full ${i === stage ? 'bg-brand' : i < stage ? 'bg-bone/70' : 'bg-bone/20'}`} />
                  {s.label}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
