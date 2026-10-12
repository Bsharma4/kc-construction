import { useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Info } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { SERVICES, SERVICE_CATEGORIES, type ServiceCategory } from '../../data/services'
import { SectionHeading } from '../ui/SectionHeading'
import { SmartImage } from '../ui/SmartImage'
import { useFinePointer } from '../../hooks/useMediaQuery'

type Filter = 'All' | ServiceCategory

export function Services() {
  const root = useRef<HTMLElement>(null)
  const grid = useRef<HTMLUListElement>(null)
  const [filter, setFilter] = useState<Filter>('All')
  const fine = useFinePointer()
  const list = useMemo(() => (filter === 'All' ? SERVICES : SERVICES.filter((s) => s.category === filter)), [filter])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('.svc-card', grid.current)
        gsap.set(cards, { autoAlpha: 0, y: 50 })
        ScrollTrigger.batch(cards, {
          start: 'top 92%',
          onEnter: (b) => gsap.to(b, { autoAlpha: 1, y: 0, stagger: 0.06, duration: 0.9, ease: 'power3.out', overwrite: true }),
          onLeaveBack: (b) => gsap.to(b, { autoAlpha: 0, y: 50, stagger: 0.03, duration: 0.5, overwrite: true }),
        })
      })
      ScrollTrigger.refresh()
      return () => mm.revert()
    },
    { scope: root, dependencies: [filter], revertOnUpdate: true },
  )

  return (
    <section ref={root} id="services" className="relative bg-ink-2 py-28 md:py-40">
      <div className="grid-lines pointer-events-none absolute inset-0 opacity-40" />
      <div className="container-x relative">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="02"
            eyebrow="Our services · Waterloo, Illinois"
            lines={['Eleven services.', <>One <span className="text-orange">family team.</span></>]}
            intro="From the first dig to the last fence post — residential construction, remodeling, concrete, site work and outdoor improvements handled by one local crew."
          />
          <p className="flex max-w-xs items-start gap-2 text-xs leading-relaxed text-bone/50">
            <Info size={14} className="mt-0.5 shrink-0 text-orange" />
            Based in Waterloo, Illinois · Licensed &amp; insured · Call for a bid on any of these services.
          </p>
        </div>

        <div className="mt-14 flex flex-wrap gap-2" role="tablist" aria-label="Filter services by category">
          {(['All', ...SERVICE_CATEGORIES] as Filter[]).map((c) => (
            <button
              key={c}
              role="tab"
              aria-selected={filter === c}
              onClick={() => setFilter(c)}
              className={`rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-all duration-300 ${filter === c ? 'border-orange bg-orange text-ink' : 'border-bone/15 text-bone/70 hover:border-bone/40 hover:text-bone'}`}
            >
              {c}
              <span className="ml-1.5 font-mono opacity-60">
                {c === 'All' ? SERVICES.length : SERVICES.filter((s) => s.category === c).length}
              </span>
            </button>
          ))}
        </div>

        <ul ref={grid} className="mt-10 grid gap-px overflow-hidden rounded-sm border border-white/[0.07] bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {list.map((s) => {
            const Icon = s.icon
            const idx = SERVICES.indexOf(s) + 1
            return (
              <li key={s.title} className="svc-card group relative min-h-[250px] overflow-hidden bg-ink-2 p-7 transition-colors duration-500 hover:bg-ink-3">
                {s.photo && (
                  <div className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] ${fine ? 'scale-110 opacity-0 group-hover:scale-100 group-hover:opacity-100' : 'opacity-45'}`}>
                    {/* touch screens have no hover, so the photo stays softly visible there */}
                    <SmartImage photo={s.photo} width={fine ? 700 : 480} alt="" className="h-full w-full" aria-hidden />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-ink/40" />
                  </div>
                )}
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-bone/15 text-orange transition-all duration-500 group-hover:rotate-[-12deg] group-hover:border-orange group-hover:bg-orange group-hover:text-ink">
                      <Icon size={20} strokeWidth={1.6} />
                    </span>
                    <span className="font-mono text-[0.65rem] text-bone/35">{String(idx).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-8 text-lg font-semibold leading-snug text-bone">{s.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-bone/55 transition-colors group-hover:text-bone/80">{s.description}</p>
                  <div className="mt-auto flex items-center justify-between pt-6">
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.2em] text-bone/35">{s.category}</span>
                    <ArrowUpRight size={18} className="translate-y-2 text-orange opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100" />
                  </div>
                </div>
                <span className="absolute bottom-0 left-0 h-[2px] w-full origin-left scale-x-0 bg-orange transition-transform duration-700 group-hover:scale-x-100" />
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
