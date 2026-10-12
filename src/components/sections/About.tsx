import { useRef } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'
import { IMG } from '../../lib/images'
import { SmartImage } from '../ui/SmartImage'
import { SectionHeading } from '../ui/SectionHeading'
import { Counter } from '../ui/Counter'
import { SERVICES } from '../../data/services'
import { PROCESS } from '../../data/process'

const STATEMENT =
  'K&C Construction is a second-generation, family-owned and operated contractor based in Waterloo, Illinois. We are licensed and insured, and we stay hands-on — the family behind the name is on the job, from the first dig to the final walk-through.'

const PILLARS = [
  { k: 'Family', t: 'Second generation owned and operated — our name is on every job.' },
  { k: 'Local', t: 'Based in Waterloo, Illinois, working for our neighbors.' },
  { k: 'Hands-On', t: 'The owners stay on site and involved, not just on the phone.' },
  { k: 'Honest', t: 'Straightforward bids, clear answers and no surprises.' },
  { k: 'Built Right', t: 'Licensed, insured and focused on work that lasts.' },
]

export function About() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        // scroll-scrubbed word reveal of the statement
        gsap.fromTo(
          '.about-word',
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.05,
            ease: 'none',
            scrollTrigger: { trigger: '.about-statement', start: 'top 80%', end: 'bottom 45%', scrub: true },
          },
        )
        // image parallax
        gsap.utils.toArray<HTMLElement>('.about-par').forEach((el) => {
          gsap.fromTo(
            el,
            { yPercent: Number(el.dataset.from ?? 10) },
            { yPercent: Number(el.dataset.to ?? -10), ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } },
          )
        })
        gsap.fromTo(
          '.about-clip',
          { clipPath: 'inset(18% 18% 18% 18%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', scrollTrigger: { trigger: '.about-clip', start: 'top 90%', end: 'center 55%', scrub: true } },
        )
        // pillars: each row draws its rule and slides in
        gsap.utils.toArray<HTMLElement>('.pillar').forEach((row) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: row, start: 'top 88%', toggleActions: 'play none none reverse' } })
          tl.from(row.querySelector('.pillar-rule'), { scaleX: 0, transformOrigin: 'left', duration: 1.2, ease: 'expo.out' })
            .from(row.querySelectorAll('.pillar-in'), { y: 40, autoAlpha: 0, stagger: 0.08, duration: 0.9 }, 0.1)
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} id="about" className="relative overflow-hidden bg-ink py-28 md:py-40">
      <div className="container-x">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <SectionHeading
              index="01"
              eyebrow="About K&C Construction · Second generation"
              lines={['Family owned.', <span key="loc" className="text-orange">Locally rooted.</span>, 'Built to last.']}
            />
            <p className="about-statement mt-12 max-w-3xl text-[clamp(1.25rem,2.2vw,1.9rem)] font-medium leading-snug text-bone">
              {STATEMENT.split(' ').map((w, i) => (
                <span key={i} className="about-word">
                  {w}{' '}
                </span>
              ))}
            </p>
          </div>
          <div className="relative lg:col-span-5">
            <div className="about-clip relative aspect-[4/5] overflow-hidden rounded-sm">
              <div className="about-par absolute -inset-y-[12%] inset-x-0" data-from="-8" data-to="8">
                <SmartImage photo={IMG.houseFraming} width={1100} alt="Residential wood framing under construction" className="h-full w-full" />
              </div>
            </div>
            <div className="about-par absolute -bottom-12 -left-6 hidden w-[52%] border-[6px] border-ink shadow-2xl md:block" data-from="30" data-to="-20">
              <SmartImage photo={IMG.skidSteerDirt} width={700} alt="Skid steer loader moving dirt" className="aspect-[3/4] w-full" />
            </div>
            <div className="absolute -right-2 top-6 rotate-90 origin-top-right font-mono text-[0.62rem] uppercase tracking-[0.4em] text-bone/40">
              Waterloo, Illinois
            </div>
          </div>
        </div>

        <div className="mt-28 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-white/[0.07] bg-white/[0.07] md:grid-cols-4">
          {[
            { n: SERVICES.length, l: 'Service disciplines' },
            { n: 2, l: 'Generations, owned & operated', pad: 2 },
            { n: PROCESS.length, l: 'Step delivery process', pad: 2 },
            { n: 1, l: 'Local family team — licensed & insured', pad: 2 },
          ].map((s) => (
            <div key={s.l} className="bg-ink p-6 md:p-8">
              <p className="font-display-x text-5xl font-black text-bone md:text-7xl">
                <Counter to={s.n} pad={s.pad ?? 0} />
              </p>
              <p className="mt-3 max-w-[16rem] text-sm text-bone/55">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-28">
          <p className="eyebrow mb-10">What you can count on</p>
          <ul>
            {PILLARS.map((p, i) => (
              <li key={p.k} className="pillar group relative py-7 md:py-9">
                <span className="pillar-rule absolute inset-x-0 top-0 h-px bg-bone/15" />
                <div className="grid items-baseline gap-4 md:grid-cols-12">
                  <span className="pillar-in font-mono text-xs text-orange md:col-span-1">0{i + 1}</span>
                  <h3 className="pillar-in font-display-x text-[clamp(2rem,6vw,5rem)] font-extrabold uppercase text-bone/90 transition-colors duration-500 group-hover:text-orange md:col-span-6">
                    {p.k}
                  </h3>
                  <p className="pillar-in max-w-md text-bone/60 md:col-span-5">{p.t}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
