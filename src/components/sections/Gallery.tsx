import { useCallback, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Maximize2 } from 'lucide-react'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { GALLERY } from '../../data/gallery'
import { SectionHeading } from '../ui/SectionHeading'
import { SmartImage } from '../ui/SmartImage'
import { Modal } from '../ui/Modal'

export function Gallery() {
  const root = useRef<HTMLElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const close = useCallback(() => setOpen(null), [])
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + GALLERY.length) % GALLERY.length)), [])
  const onKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    },
    [step],
  )

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const items = gsap.utils.toArray<HTMLElement>('.gal-item')
        gsap.set(items, { clipPath: 'inset(100% 0% 0% 0%)' })
        const imgs = items.map((el) => el.querySelector('img')).filter((el): el is HTMLImageElement => !!el)
        if (imgs.length) gsap.set(imgs, { scale: 1.3 })
        ScrollTrigger.batch(items, {
          start: 'top 92%',
          onEnter: (b) => {
            gsap.to(b, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.out', stagger: 0.08, overwrite: true })
            const bImgs = b.map((el) => el.querySelector('img')).filter((el): el is HTMLImageElement => !!el)
            if (bImgs.length) gsap.to(bImgs, { scale: 1, duration: 1.6, ease: 'expo.out', stagger: 0.08 })
          },
          onLeaveBack: (b) => gsap.to(b, { clipPath: 'inset(100% 0% 0% 0%)', duration: 0.6, overwrite: true }),
        })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const current = open !== null ? GALLERY[open] : null

  return (
    <section ref={root} id="gallery" className="relative bg-ink py-28 md:py-40">
      <div className="container-x">
        <SectionHeading
          index="07"
          eyebrow="Construction gallery"
          lines={['On site.', <>In <span className="text-orange">detail.</span></>]}
          intro="The kind of work we do — framing, remodels, concrete, decks, fencing and site work. Illustrative stock photography via Unsplash; not K&C job photos."
        />
        <ul className="mt-16 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>li]:mb-4">
          {GALLERY.map((g, i) => (
            <li key={g.id} className="break-inside-avoid">
              <button
                type="button"
                onClick={() => setOpen(i)}
                className="gal-item group relative block w-full overflow-hidden rounded-sm"
                aria-label={`Open image: ${g.alt}`}
              >
                <SmartImage
                  photo={g.photo}
                  width={900}
                  alt={g.alt}
                  className="w-full"
                  style={{ aspectRatio: g.ratio }}
                  imgClassName="transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:!scale-[1.06]"
                />
                <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-ink/80 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                  <span className="text-left text-sm text-bone">{g.alt}</span>
                  <Maximize2 size={18} className="shrink-0 text-orange" />
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <Modal open={current !== null} onClose={close} label="Image viewer" variant="fullscreen" onKey={onKey}>
        {current && (
          <figure className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 md:p-16">
            <SmartImage key={current.id} photo={current.photo} width={2000} alt={current.alt} eager className="max-h-[80svh] w-full max-w-6xl !bg-none [&>img]:object-contain" style={{ aspectRatio: current.ratio }} />
            <figcaption className="flex w-full max-w-6xl items-center justify-between gap-4">
              <span className="text-sm text-bone/80">{current.alt}</span>
              <span className="font-mono text-xs text-bone/50">
                {String((open ?? 0) + 1).padStart(2, '0')} / {GALLERY.length}
              </span>
            </figcaption>
            <button type="button" onClick={() => step(-1)} aria-label="Previous image" className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-bone/20 bg-ink/60 backdrop-blur hover:border-orange hover:text-orange md:left-8">
              <ArrowLeft size={20} />
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next image" className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-bone/20 bg-ink/60 backdrop-blur hover:border-orange hover:text-orange md:right-8">
              <ArrowRight size={20} />
            </button>
          </figure>
        )}
      </Modal>
    </section>
  )
}
