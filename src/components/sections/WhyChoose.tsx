import { useRef } from 'react'
import { BadgeCheck, CalendarCheck, Handshake, MessagesSquare, ShieldCheck, Tractor } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { IMG } from '../../lib/images'
import { SmartImage } from '../ui/SmartImage'
import { SectionHeading } from '../ui/SectionHeading'

const FEATURES = [
  { icon: BadgeCheck, title: 'Quality Craftsmanship', text: 'Hands-on workmanship, proper materials and details finished right.' },
  { icon: ShieldCheck, title: 'Licensed & Insured', text: 'Peace of mind for you, your family and your property.' },
  { icon: MessagesSquare, title: 'Talk to the Owners', text: 'A family business — you deal directly with the people doing the work.' },
  { icon: CalendarCheck, title: 'One Team, Start to Finish', text: 'Excavation, concrete, construction and landscaping without juggling contractors.' },
  { icon: Tractor, title: 'The Right Equipment', text: 'Excavation, Bobcat and hauling equipment to get site work done efficiently.' },
  { icon: Handshake, title: 'Local & Second Generation', text: 'Owned and operated by the second generation of the family, right here in Waterloo.' },
]

export function WhyChoose() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // cinematic image scaling band
        gsap.fromTo(
          '.why-frame',
          { clipPath: 'inset(12% 22% 12% 22% round 18px)' },
          { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', scrollTrigger: { trigger: '.why-band', start: 'top bottom', end: 'center center', scrub: true } },
        )
        gsap.fromTo('.why-frame img', { scale: 1.35 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.why-band', start: 'top bottom', end: 'bottom top', scrub: true } })
        gsap.fromTo('.why-band-text', { yPercent: 60 }, { yPercent: -60, ease: 'none', scrollTrigger: { trigger: '.why-band', start: 'top bottom', end: 'bottom top', scrub: true } })

        gsap.from('.why-card', {
          y: 70,
          autoAlpha: 0,
          rotateX: -12,
          stagger: 0.08,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.why-grid', start: 'top 82%', toggleActions: 'play none none reverse' },
        })
      })
      mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        const cards = gsap.utils.toArray<HTMLElement>('.why-card')
        const cleanups = cards.map((card) => {
          const rx = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3' })
          const ry = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3' })
          const move = (e: PointerEvent) => {
            const r = card.getBoundingClientRect()
            const x = (e.clientX - r.left) / r.width
            const y = (e.clientY - r.top) / r.height
            card.style.setProperty('--mx', `${x * 100}%`)
            card.style.setProperty('--my', `${y * 100}%`)
            ry((x - 0.5) * 10)
            rx((0.5 - y) * 10)
          }
          const leave = () => {
            rx(0)
            ry(0)
          }
          card.addEventListener('pointermove', move)
          card.addEventListener('pointerleave', leave)
          return () => {
            card.removeEventListener('pointermove', move)
            card.removeEventListener('pointerleave', leave)
          }
        })
        return () => cleanups.forEach((c) => c())
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="why" className="relative bg-ink py-28 md:py-40">
      <div className="why-band relative h-[70svh] min-h-[420px] overflow-hidden">
        <div className="why-frame absolute inset-0">
          <SmartImage photo={IMG.houseLawn} width={2000} alt="Finished modern home with a green lawn" className="h-full w-full" />
          <div className="absolute inset-0 bg-ink/45" />
        </div>
        <div className="why-band-text pointer-events-none absolute inset-0 grid place-items-center px-4 text-center">
          <p className="font-display-x text-[clamp(2rem,7vw,6.5rem)] font-black uppercase leading-none text-bone">
            Built to <span className="text-brand-bright">last.</span>
          </p>
        </div>
      </div>

      <div className="container-x mt-28">
        <SectionHeading
          index="05"
          eyebrow="Why choose K&S"
          lines={['Why homeowners', <>call <span className="text-brand-bright">K&amp;S.</span></>]}
          intro="A second-generation family business that treats your property like our own."
        />
        <ul className="why-grid mt-16 grid gap-5 [perspective:1200px] sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon
            return (
              <li
                key={f.title}
                className="why-card group relative overflow-hidden rounded-xl border border-white/[0.08] bg-ink-2 p-8 [transform-style:preserve-3d]"
                style={{ ['--mx' as string]: '50%', ['--my' as string]: '50%' }}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{ background: 'radial-gradient(420px circle at var(--mx) var(--my), rgba(209,31,38,0.14), transparent 45%)' }}
                />
                <div className="relative flex items-center justify-between">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-bone/[0.06] text-brand-bright transition-all duration-500 group-hover:-translate-y-1 group-hover:rotate-[8deg] group-hover:bg-brand group-hover:text-white">
                    <Icon size={24} strokeWidth={1.6} />
                  </span>
                  <span className="font-mono text-xs text-bone/30">0{i + 1}</span>
                </div>
                <h3 className="relative mt-10 text-xl font-semibold text-bone">{f.title}</h3>
                <p className="relative mt-3 leading-relaxed text-bone/60">{f.text}</p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
