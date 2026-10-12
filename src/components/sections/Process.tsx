import { useRef } from 'react'
import { Check } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { PROCESS } from '../../data/process'
import { SectionHeading } from '../ui/SectionHeading'

/** Blueprint drawing — each <g data-step> is drawn when its process step becomes active. */
function Blueprint() {
  const s = { fill: 'none', stroke: '#9cc6ee', strokeWidth: 1.4, vectorEffect: 'non-scaling-stroke' as const }
  const d = (extra?: object) => ({ ...s, pathLength: 1, className: 'bp-line', ...extra })
  const floors = [0, 1, 2, 3, 4, 5]
  return (
    <svg viewBox="0 0 600 520" className="h-full w-full" role="img" aria-label="Animated architectural blueprint of a building">
      {/* 01 — site boundary & north point */}
      <g data-step="0">
        <rect x="40" y="40" width="520" height="440" {...d({ strokeDasharray: undefined })} />
        <path d="M520 80 l12 -30 l12 30 M532 50 v40" {...d()} />
        <text x="527" y="110" fill="#9cc6ee" fontSize="11" fontFamily="JetBrains Mono" className="bp-text">N</text>
        <text x="56" y="64" fill="#9cc6ee" fontSize="10" fontFamily="JetBrains Mono" className="bp-text">SITE BOUNDARY</text>
      </g>
      {/* 02 — structural grid */}
      <g data-step="1">
        {[120, 230, 340, 450].map((x, i) => (
          <g key={x}>
            <path d={`M${x} 92 V440`} {...d({ strokeDasharray: '6 4', strokeWidth: 0.8 })} />
            <circle cx={x} cy="80" r="11" {...d()} />
            <text x={x - 4} y="84" fill="#9cc6ee" fontSize="11" fontFamily="JetBrains Mono" className="bp-text">{'ABCD'[i]}</text>
          </g>
        ))}
      </g>
      {/* 03 — ground & excavation */}
      <g data-step="2">
        <path d="M60 420 H540" {...d({ strokeWidth: 2 })} />
        <path d="M90 420 v22 h420 v-22" {...d()} />
        {Array.from({ length: 22 }).map((_, i) => (
          <path key={i} d={`M${70 + i * 22} 452 l14 -14`} {...d({ strokeWidth: 0.7 })} />
        ))}
      </g>
      {/* 04 — foundations, columns, floors */}
      <g data-step="3">
        {[120, 230, 340, 450].map((x) => (
          <g key={x}>
            <rect x={x - 16} y="420" width="32" height="18" {...d()} />
            <path d={`M${x} 420 V150`} {...d({ strokeWidth: 2.2 })} />
          </g>
        ))}
        {floors.map((f) => (
          <path key={f} d={`M100 ${420 - (f + 1) * 45} H470`} {...d({ strokeWidth: 1.8 })} />
        ))}
      </g>
      {/* 05 — facade & openings */}
      <g data-step="4">
        {floors.slice(0, 5).map((f) =>
          [0, 1, 2].map((b) => <rect key={`${f}-${b}`} x={132 + b * 110} y={420 - (f + 1) * 45 + 10} width="86" height="28" {...d({ strokeWidth: 0.9 })} />),
        )}
        <path d="M100 150 V420 M470 150 V420" {...d({ strokeWidth: 2.4 })} />
      </g>
      {/* 06 — dimensions & annotations */}
      <g data-step="5">
        <path d="M510 150 V420 M504 150 h12 M504 420 h12" {...d({ strokeWidth: 0.8 })} />
        <path d="M100 470 H470 M100 464 v12 M470 464 v12" {...d({ strokeWidth: 0.8 })} />
        <text x="518" y="290" fill="#9cc6ee" fontSize="10" fontFamily="JetBrains Mono" className="bp-text">H</text>
        <text x="270" y="490" fill="#9cc6ee" fontSize="10" fontFamily="JetBrains Mono" className="bp-text">L</text>
        <path d="M300 240 l40 -40 h70" {...d({ strokeWidth: 0.8 })} />
        <text x="345" y="194" fill="#9cc6ee" fontSize="9" fontFamily="JetBrains Mono" className="bp-text">QA CHECKED</text>
      </g>
      {/* 07 — roof & handover stamp */}
      <g data-step="6">
        <path d="M90 150 H480 M90 150 v-14 H480 v14" {...d({ strokeWidth: 2 })} />
        <path d="M190 136 v-24 h120 v24" {...d()} />
        <rect x="372" y="440" width="150" height="34" rx="3" {...d({ stroke: '#ff5a1f', strokeWidth: 1.6 })} />
        <text x="384" y="462" fill="#ff5a1f" fontSize="11" fontFamily="JetBrains Mono" className="bp-text">READY FOR HANDOVER</text>
      </g>
    </svg>
  )
}

export function Process() {
  const root = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const groups = () => gsap.utils.toArray<SVGGElement>('[data-step]', root.current)

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const steps = gsap.utils.toArray<HTMLElement>('.ps-detail')
        const items = gsap.utils.toArray<HTMLElement>('.ps-item')
        gsap.set('.bp-line', { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.set('.bp-text', { autoAlpha: 0 })
        gsap.set(steps, { autoAlpha: 0, y: 40 })
        gsap.set(steps[0], { autoAlpha: 1, y: 0 })
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            id: 'process',
            trigger: pin.current,
            start: 'top top',
            end: () => `+=${window.innerHeight * 4.5}`,
            pin: true,
            scrub: 1,
            refreshPriority: 3,
            invalidateOnRefresh: true,
          },
        })
        groups().forEach((g, i) => {
          const lines = g.querySelectorAll('.bp-line')
          const labels = g.querySelectorAll('.bp-text')
          if (lines.length) tl.to(lines, { strokeDashoffset: 0, duration: 0.8, stagger: 0.02 }, i)
          if (labels.length) tl.to(labels, { autoAlpha: 1, duration: 0.3 }, i + 0.5)
          if (i > 0) {
            tl.to(steps[i - 1], { autoAlpha: 0, y: -40, duration: 0.3 }, i - 0.05)
            tl.to(steps[i], { autoAlpha: 1, y: 0, duration: 0.35 }, i + 0.15)
            tl.to(items[i - 1], { opacity: 0.45, duration: 0.2 }, i)
          }
          tl.fromTo(items[i], { opacity: 0.45 }, { opacity: 1, duration: 0.2 }, i)
          const dot = items[i]?.querySelector('.ps-dot')
          if (dot) tl.to(dot, { backgroundColor: '#ff5a1f', scale: 1.4, duration: 0.2 }, i)
        })
        tl.fromTo('.ps-progress', { scaleY: 0 }, { scaleY: 1, duration: groups().length }, 0)
        tl.to({}, { duration: 0.6 })
      })

      mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
        gsap.set('.bp-line', { strokeDasharray: 1, strokeDashoffset: 1 })
        gsap.to('.bp-line', {
          strokeDashoffset: 0,
          stagger: 0.01,
          ease: 'none',
          scrollTrigger: { trigger: '.ps-mobile', start: 'top 70%', end: 'bottom 70%', scrub: true },
        })
        gsap.utils.toArray<HTMLElement>('.ps-mcard').forEach((c) =>
          gsap.from(c, { y: 40, autoAlpha: 0, duration: 0.8, scrollTrigger: { trigger: c, start: 'top 88%', toggleActions: 'play none none reverse' } }),
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="process" className="relative bg-[#0a121b]">
      <div ref={pin} className="relative lg:h-[100svh]">
        <div className="container-x grid h-full gap-10 py-24 lg:grid-cols-12 lg:items-center lg:py-0">
          <div className="lg:col-span-5">
            <SectionHeading size="compact" index="04" eyebrow="Our construction process" lines={['From bid', <>to <span className="text-orange">built.</span></>]} />
            {/* desktop: step index + live detail */}
            <div className="mt-10 hidden lg:block motion-reduce:lg:hidden">
              <div className="relative grid min-h-[210px]">
                {PROCESS.map((p) => (
                  <div key={p.n} className="ps-detail col-start-1 row-start-1">
                    <p className="font-mono text-sm text-orange">{p.n} / 07</p>
                    <h3 className="font-display-x mt-3 text-3xl font-extrabold uppercase xl:text-4xl">{p.title}</h3>
                    <p className="mt-4 max-w-md leading-relaxed text-bone/70">{p.text}</p>
                    <ul className="mt-5 flex flex-wrap gap-2">
                      {p.points.map((pt) => (
                        <li key={pt} className="flex items-center gap-1.5 rounded-full border border-[#9cc6ee]/25 px-3 py-1 text-xs text-[#cfe3f7]">
                          <Check size={12} className="text-orange" /> {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative lg:col-span-7">
            <div className="blueprint-grid relative aspect-[6/5.2] w-full overflow-hidden rounded-sm border border-[#9cc6ee]/20 shadow-[0_40px_120px_-40px_rgba(30,90,160,0.5)]">
              <Blueprint />
              <span className="absolute left-4 top-3 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-[#9cc6ee]/70">Dwg. KC-001 · Elevation</span>
            </div>
            <ol className="absolute -right-2 top-0 hidden h-full flex-col justify-between py-4 xl:-right-8 lg:flex" aria-label="Process steps">
              <span className="absolute left-[5px] top-4 bottom-4 w-px bg-[#9cc6ee]/15" aria-hidden />
              <span className="ps-progress absolute left-[5px] top-4 bottom-4 w-px origin-top bg-orange" aria-hidden />
              {PROCESS.map((p) => (
                <li key={p.n} className="ps-item relative flex items-center gap-3 opacity-45">
                  <span className="ps-dot relative h-[11px] w-[11px] rounded-full border border-[#9cc6ee]/60 bg-[#0a121b]" />
                  <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[#cfe3f7]">{p.n}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
      {/* mobile & reduced-motion: stacked steps */}
      <ol className="ps-mobile container-x grid gap-4 pb-24 lg:hidden motion-reduce:lg:grid motion-reduce:lg:grid-cols-2">
        {PROCESS.map((p) => (
          <li key={p.n} className="ps-mcard rounded-sm border border-[#9cc6ee]/15 bg-[#0d1824] p-6">
            <p className="font-mono text-sm text-orange">{p.n}</p>
            <h3 className="font-display-x mt-2 text-2xl font-extrabold uppercase">{p.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-bone/70">{p.text}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {p.points.map((pt) => (
                <li key={pt} className="rounded-full border border-[#9cc6ee]/25 px-3 py-1 text-xs text-[#cfe3f7]">{pt}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </section>
  )
}
