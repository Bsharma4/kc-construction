import { ScrollTrigger } from '../../lib/gsap'
import { useEffect, useRef, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { scrollToTarget } from '../../lib/smoothScroll'

/** Thin page-progress bar plus a floating back-to-top button. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  useEffect(() => {
    let raf = 0
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? window.scrollY / max : 0
      if (bar.current) bar.current.style.transform = `scaleX(${p})`
      // stay out of the way of the construction HUD while that scene is pinned
      const st = ScrollTrigger.getById('construction')
      const inScene = !!st && window.scrollY >= st.start - 10 && window.scrollY <= st.end
      setShow(window.scrollY > window.innerHeight * 1.5 && !inScene)
    }
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]" aria-hidden>
        <div ref={bar} className="h-full origin-left scale-x-0 bg-brand" />
      </div>
      <button
        type="button"
        onClick={() => scrollToTarget(0)}
        aria-label="Back to top"
        className={`fixed bottom-4 right-4 z-40 grid h-11 w-11 sm:bottom-5 sm:right-5 sm:h-12 sm:w-12 place-items-center rounded-full border border-bone/15 bg-ink/70 text-bone backdrop-blur transition-all duration-500 hover:border-brand hover:bg-brand hover:text-white ${show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}
        tabIndex={show ? 0 : -1}
      >
        <ArrowUp size={18} />
      </button>
    </>
  )
}
