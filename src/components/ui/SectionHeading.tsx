import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '../../lib/gsap'

type Props = {
  eyebrow: string
  index?: string
  lines: ReactNode[]
  intro?: ReactNode
  align?: 'left' | 'center'
  className?: string
  tone?: 'dark' | 'light'
  /** 'compact' for headings that sit in a narrow column */
  size?: 'default' | 'compact'
}

/** Editorial section heading with a masked, staggered line reveal tied to scroll. */
export function SectionHeading({ eyebrow, index, lines, intro, align = 'left', className = '', tone = 'dark', size = 'default' }: Props) {
  const root = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from(root.current!.querySelectorAll('.line-mask > span'), {
          yPercent: 110,
          rotate: 2,
          duration: 1.1,
          stagger: 0.09,
          ease: 'power4.out',
          scrollTrigger: { trigger: root.current, start: 'top 82%', toggleActions: 'play none none reverse' },
        })
        gsap.from(root.current!.querySelectorAll('[data-fade]'), {
          y: 24,
          autoAlpha: 0,
          duration: 1,
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: 'top 80%', toggleActions: 'play none none reverse' },
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )
  const center = align === 'center'
  return (
    <div ref={root} className={`${center ? 'mx-auto text-center' : ''} ${className}`}>
      <div data-fade className={`mb-6 flex items-center gap-3 ${center ? 'justify-center' : ''}`}>
        {index && <span className="font-mono text-xs text-orange">{index}</span>}
        <span className="h-px w-10 bg-orange/70" aria-hidden />
        <span className={`eyebrow ${tone === 'light' ? '!text-ink/60' : ''}`}>{eyebrow}</span>
      </div>
      <h2
        className={`font-display-x ${size === 'compact' ? 'text-[clamp(2.1rem,4.4vw,4.4rem)]' : 'text-[clamp(2.2rem,6.2vw,5.6rem)]'} font-extrabold uppercase ${tone === 'light' ? 'text-ink' : 'text-bone'}`}
      >
        {lines.map((l, i) => (
          <span key={i} className="line-mask">
            <span>{l}</span>
          </span>
        ))}
      </h2>
      {intro && (
        <p
          data-fade
          className={`mt-7 max-w-2xl text-base leading-relaxed md:text-lg ${center ? 'mx-auto' : ''} ${tone === 'light' ? 'text-ink/70' : 'text-bone/65'}`}
        >
          {intro}
        </p>
      )}
    </div>
  )
}
