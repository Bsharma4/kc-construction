import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, MessageSquareQuote, Quote, Star } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { TESTIMONIALS } from '../../data/testimonials'
import { SectionHeading } from '../ui/SectionHeading'
import { CallButton } from '../ui/CallButton'

const HEADING = <SectionHeading index="06" eyebrow="Customer reviews" lines={['What our', <>clients <span className="text-orange">say.</span></>]} />

/** Shows real reviews from data/testimonials.ts, or an honest invitation while none have been added. */
export function Testimonials() {
  return TESTIMONIALS.length ? <ReviewCarousel /> : <ReviewsPending />
}

function ReviewsPending() {
  return (
    <section id="reviews" className="relative overflow-hidden bg-ink-2 py-28 md:py-40">
      <div className="container-x">
        {HEADING}
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          <div className="rounded-xl border border-white/[0.08] bg-ink p-8 md:p-10">
            <MessageSquareQuote size={30} className="text-orange" />
            <p className="mt-6 font-display-x text-2xl font-extrabold uppercase text-bone md:text-3xl">Real reviews from real neighbors.</p>
            <p className="mt-4 max-w-md leading-relaxed text-bone/65">
              We only publish genuine feedback from K&amp;C Construction customers. Verified reviews will appear here soon.
            </p>
          </div>
          <div className="flex flex-col justify-between gap-8 rounded-xl border border-dashed border-bone/15 p-8 md:p-10">
            <p className="leading-relaxed text-bone/65">
              Worked with us on a home, remodel, deck, driveway, fence or yard? We would be grateful for your review — and if you are planning a project, the best way to start is a quick call.
            </p>
            <CallButton className="w-fit" />
          </div>
        </div>
      </div>
    </section>
  )
}

function ReviewCarousel() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLUListElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [perView, setPerView] = useState(1)
  const drag = useRef({ x: 0, dx: 0, active: false })
  const maxIndex = Math.max(0, TESTIMONIALS.length - perView)

  useEffect(() => {
    const calc = () => setPerView(window.innerWidth >= 1280 ? 3 : window.innerWidth >= 768 ? 2 : 1)
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  const offsetFor = useCallback((i: number) => {
    const card = track.current?.children[i] as HTMLElement | undefined
    return card ? -card.offsetLeft : 0
  }, [])

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex))
  }, [maxIndex])

  useGSAP(() => {
    gsap.to(track.current, { x: offsetFor(index), duration: 0.9, ease: 'expo.out' })
  }, { dependencies: [index, perView], scope: root })

  useGSAP(
    () => {
      gsap.from('.t-card', {
        y: 60,
        autoAlpha: 0,
        stagger: 0.1,
        duration: 1,
        scrollTrigger: { trigger: viewport.current, start: 'top 85%', toggleActions: 'play none none reverse' },
      })
    },
    { scope: root },
  )

  const go = (d: number) => setIndex((i) => Math.min(maxIndex, Math.max(0, i + d)))

  // touch / pointer swipe
  const onDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, dx: 0, active: true }
  }
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current.active) return
    drag.current.dx = e.clientX - drag.current.x
    if (Math.abs(drag.current.dx) > 6) gsap.set(track.current, { x: offsetFor(index) + drag.current.dx * 0.9 })
  }
  const onUp = () => {
    if (!drag.current.active) return
    const { dx } = drag.current
    drag.current.active = false
    if (dx < -50) go(1)
    else if (dx > 50) go(-1)
    else gsap.to(track.current, { x: offsetFor(index), duration: 0.6, ease: 'expo.out' })
  }

  return (
    <section ref={root} id="reviews" className="relative overflow-hidden bg-ink-2 py-28 md:py-40">
      <div className="container-x">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          {HEADING}
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous review" className="grid h-14 w-14 place-items-center rounded-full border border-bone/20 transition hover:border-orange hover:bg-orange hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-bone">
              <ArrowLeft size={20} />
            </button>
            <button type="button" onClick={() => go(1)} disabled={index >= maxIndex} aria-label="Next review" className="grid h-14 w-14 place-items-center rounded-full border border-bone/20 transition hover:border-orange hover:bg-orange hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-bone">
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={viewport}
          className="mt-14 cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing"
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerLeave={onUp}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') go(1)
            if (e.key === 'ArrowLeft') go(-1)
          }}
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label="Customer reviews"
        >
          <ul ref={track} className="flex gap-5 will-change-transform">
            {TESTIMONIALS.map((t, i) => (
              <li
                key={t.id}
                className="t-card flex shrink-0 basis-full flex-col rounded-xl border border-white/[0.08] bg-ink p-7 md:basis-[calc((100%-1.25rem)/2)] md:p-9 xl:basis-[calc((100%-2.5rem)/3)]"
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${TESTIMONIALS.length}`}
                aria-hidden={i < index || i >= index + perView}
              >
                <div className="flex items-center justify-between">
                  {t.rating ? (
                    <div className="flex gap-1" aria-label={`Rating: ${t.rating} out of 5`}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={16} className={s < (t.rating ?? 0) ? 'fill-orange text-orange' : 'text-bone/20'} />
                      ))}
                    </div>
                  ) : <span />}
                  <Quote size={28} className="text-bone/10" />
                </div>
                <blockquote className="mt-6 flex-1 text-lg leading-relaxed text-bone/85">“{t.quote}”</blockquote>
                <div className="mt-8 flex items-center gap-4 border-t border-white/[0.08] pt-6">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-bone/10 font-display-x text-sm font-extrabold text-bone">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                  <div>
                    <p className="font-semibold text-bone">{t.name}</p>
                    {t.source && <p className="text-sm text-bone/50">via {t.source}</p>}
                  </div>
                  <span className="ml-auto hidden rounded-full border border-bone/15 px-3 py-1 text-[0.65rem] uppercase tracking-wider text-bone/60 sm:inline">
                    {t.category}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex items-center justify-between gap-6">
          <div className="flex gap-2" role="tablist" aria-label="Choose review">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to review ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${i === index ? 'w-10 bg-orange' : 'w-4 bg-bone/20 hover:bg-bone/40'}`}
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
