import { useCallback, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Info, Maximize2 } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { PROJECTS, PROJECT_FILTERS, type Project } from '../../data/projects'
import { SectionHeading } from '../ui/SectionHeading'
import { SmartImage } from '../ui/SmartImage'
import { Modal } from '../ui/Modal'

type Filter = (typeof PROJECT_FILTERS)[number]

function ProjectModal({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const [idx, setIdx] = useState(0)
  const img = useRef<HTMLDivElement>(null)
  const go = useCallback(
    (d: number) => {
      if (!project) return
      setIdx((i) => (i + d + project.gallery.length) % project.gallery.length)
      gsap.fromTo(img.current, { autoAlpha: 0.3, scale: 1.04 }, { autoAlpha: 1, scale: 1, duration: 0.7, ease: 'expo.out' })
    },
    [project],
  )
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    },
    [go],
  )
  return (
    <Modal open={!!project} onClose={onClose} label={project ? `${project.title} — project details` : 'Project'} onKey={onKey}>
      {project && (
        <div className="grid lg:grid-cols-[1.5fr_1fr]">
          <div className="relative bg-ink">
            <div ref={img} className="relative aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[560px]">
              <SmartImage key={project.gallery[idx]} photo={project.gallery[idx]} width={1600} alt={`${project.title} — image ${idx + 1}`} className="absolute inset-0" eager />
            </div>
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button type="button" onClick={() => go(-1)} aria-label="Previous image" className="grid h-11 w-11 place-items-center rounded-full bg-ink/70 backdrop-blur hover:bg-orange hover:text-ink">
                <ArrowLeft size={18} />
              </button>
              <button type="button" onClick={() => go(1)} aria-label="Next image" className="grid h-11 w-11 place-items-center rounded-full bg-ink/70 backdrop-blur hover:bg-orange hover:text-ink">
                <ArrowRight size={18} />
              </button>
            </div>
            <span className="absolute bottom-6 right-4 font-mono text-xs text-bone/80">
              {String(idx + 1).padStart(2, '0')} / {String(project.gallery.length).padStart(2, '0')}
            </span>
          </div>
          <div className="flex flex-col p-6 md:p-10">
            <span className="eyebrow !text-orange">{project.category}</span>
            <h3 className="font-display-x mt-4 pr-12 text-3xl font-extrabold uppercase md:text-4xl">{project.title}</h3>
            <p className="mt-6 leading-relaxed text-bone/70">{project.description}</p>
            <ul className="mt-8 flex flex-wrap gap-2">
              {project.scope.map((s) => (
                <li key={s} className="rounded-full border border-bone/15 px-3 py-1.5 text-xs text-bone/75">
                  {s}
                </li>
              ))}
            </ul>
            <div className="mt-8 grid grid-cols-4 gap-2">
              {project.gallery.map((g, i) => (
                <button
                  key={g + i}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-current={i === idx}
                  className={`overflow-hidden rounded-sm ring-2 transition ${i === idx ? 'ring-orange' : 'ring-transparent opacity-60 hover:opacity-100'}`}
                >
                  <SmartImage photo={g} width={300} alt="" className="aspect-square" />
                </button>
              ))}
            </div>
            <p className="mt-auto flex items-start gap-2 pt-10 text-xs leading-relaxed text-bone/45">
              <Info size={14} className="mt-0.5 shrink-0 text-orange" />
              Illustrative example — stock photography (Unsplash), not a completed K&amp;C Construction project.
            </p>
          </div>
        </div>
      )}
    </Modal>
  )
}

export function Projects() {
  const root = useRef<HTMLElement>(null)
  const pin = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLUListElement>(null)
  const bar = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<Filter>('All')
  const [open, setOpen] = useState<Project | null>(null)
  const list = useMemo(() => (filter === 'All' ? PROJECTS : PROJECTS.filter((p) => p.category === filter)), [filter])
  const close = useCallback(() => setOpen(null), [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const t = track.current!
        const distance = () => Math.max(0, t.scrollWidth - window.innerWidth)
        const tween = gsap.to(t, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            id: 'projects',
            trigger: pin.current,
            start: 'top top',
            end: () => `+=${Math.max(distance(), 1)}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            refreshPriority: 5,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`
            },
          },
        })
        gsap.utils.toArray<HTMLElement>('.proj-img', t).forEach((img) => {
          gsap.fromTo(
            img,
            { xPercent: -10 },
            {
              xPercent: 10,
              ease: 'none',
              scrollTrigger: { trigger: img.parentElement, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
            },
          )
        })
      })
      mm.add('(max-width: 1023px), (prefers-reduced-motion: reduce)', () => {
        gsap.utils.toArray<HTMLElement>('.proj-card', track.current).forEach((card) => {
          gsap.from(card, { y: 60, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' } })
          const img = card.querySelector('.proj-img')
          if (img)
            gsap.fromTo(img, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } })
        })
      })
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
      return () => mm.revert()
    },
    { scope: root, dependencies: [filter], revertOnUpdate: true },
  )

  return (
    <section ref={root} id="projects" className="relative bg-ink">
      <div className="container-x pb-12 pt-28 md:pt-40">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="03"
            eyebrow="Project types"
            lines={['Homes, yards', <>&amp; everything <span className="text-orange">between.</span></>]}
            intro="Examples of the residential, remodeling, outdoor and site-work projects we take on. Images are illustrative stock photos, not completed K&C jobs."
          />
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
              {PROJECT_FILTERS.map((f) => (
                <button
                  key={f}
                  role="tab"
                  aria-selected={filter === f}
                  onClick={() => setFilter(f)}
                  className={`rounded-full border px-4 py-2 text-xs font-medium tracking-wide transition-all duration-300 ${filter === f ? 'border-orange bg-orange text-ink' : 'border-bone/15 text-bone/70 hover:border-bone/40 hover:text-bone'}`}
                >
                  {f}
                </button>
              ))}
            </div>
            <p className="flex max-w-sm items-start gap-2 text-xs text-bone/50 lg:text-right">
              <Info size={14} className="mt-0.5 shrink-0 text-orange lg:order-2" />
              Illustrative concepts — not actual completed K&amp;C Construction projects.
            </p>
          </div>
        </div>
      </div>

      <div ref={pin} className="relative overflow-hidden lg:flex lg:h-[100svh] lg:items-center">
        <ul ref={track} className="container-x flex flex-col gap-8 pb-28 lg:w-max lg:max-w-none lg:flex-row lg:gap-8 lg:pb-0 lg:pr-[10vw]">
          {list.map((p, i) => (
            <li key={p.id} className="proj-card lg:w-[min(62vw,880px)] lg:shrink-0">
              <button
                type="button"
                onClick={() => setOpen(p)}
                className="group block w-full text-left"
                aria-label={`View details for ${p.title}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-sm lg:aspect-[16/10]">
                  <div className="proj-img absolute -inset-x-[12%] inset-y-0">
                    <SmartImage
                      photo={p.cover}
                      width={1400}
                      alt={p.title}
                      className="h-full w-full"
                      imgClassName="transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.07]"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-ink/70 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-bone/85 backdrop-blur">
                    Illustrative concept
                  </span>
                  <span className="absolute right-4 top-4 grid h-11 w-11 scale-75 place-items-center rounded-full bg-orange text-ink opacity-0 transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
                    <Maximize2 size={18} />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 md:p-8">
                    <div>
                      <span className="eyebrow !text-orange">
                        {String(i + 1).padStart(2, '0')} — {p.category}
                      </span>
                      <h3 className="font-display-x mt-3 text-2xl font-extrabold uppercase text-bone md:text-4xl">{p.title}</h3>
                      <p className="mt-2 max-w-md text-sm text-bone/70">{p.summary}</p>
                    </div>
                    <ArrowUpRight className="hidden shrink-0 text-bone transition-transform duration-500 group-hover:rotate-45 md:block" size={32} />
                  </div>
                </div>
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="text-bone/60">No projects in this category yet.</li>}
        </ul>
        <div className="absolute inset-x-[clamp(1rem,4vw,3.5rem)] bottom-10 hidden h-px bg-bone/15 lg:block">
          <div ref={bar} className="h-full origin-left scale-x-0 bg-orange" />
        </div>
      </div>
      <ProjectModal key={open?.id ?? 'none'} project={open} onClose={close} />
    </section>
  )
}
