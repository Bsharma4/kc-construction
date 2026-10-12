import { useEffect, useId, useRef, useState } from 'react'
import { ScrollTrigger } from '../../lib/gsap'
import { Plus } from 'lucide-react'
import { FAQS } from '../../data/faq'
import { SectionHeading } from '../ui/SectionHeading'

function Item({ q, a, open, onToggle, n }: { q: string; a: string; open: boolean; onToggle: () => void; n: number }) {
  const id = useId()
  return (
    <li className="border-b border-white/[0.08]">
      <h3>
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={onToggle}
          className="group flex w-full items-center gap-6 py-7 text-left"
        >
          <span className="font-mono text-xs text-brand-bright">{String(n).padStart(2, '0')}</span>
          <span className={`flex-1 text-lg font-medium transition-colors md:text-xl ${open ? 'text-bone' : 'text-bone/80 group-hover:text-bone'}`}>{q}</span>
          <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all duration-500 ${open ? 'rotate-45 border-brand bg-brand text-white' : 'border-bone/20 text-bone'}`}>
            <Plus size={18} />
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className={`grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)] ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <p className="max-w-3xl pb-8 pl-10 leading-relaxed text-bone/65">{a}</p>
        </div>
      </div>
    </li>
  )
}

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  const ref = useRef<HTMLElement>(null)
  // accordion height changes shift everything below — re-measure scroll triggers afterwards
  useEffect(() => {
    const t = setTimeout(() => ScrollTrigger.refresh(), 560)
    return () => clearTimeout(t)
  }, [open])
  return (
    <section ref={ref} id="faq" className="relative bg-ink-2 py-28 md:py-40">
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <SectionHeading size="compact" index="08" eyebrow="Frequently asked" lines={['Good', <>questions<span className="text-brand-bright">.</span></>]} intro="Straight answers about how projects are planned, priced and run." />
          </div>
        </div>
        <ul className="lg:col-span-7">
          {FAQS.map((f, i) => (
            <Item key={f.q} n={i + 1} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </ul>
      </div>
    </section>
  )
}
