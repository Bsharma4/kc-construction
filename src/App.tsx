import { useEffect } from 'react'
import { ScrollTrigger } from './lib/gsap'
import { initSmoothScroll } from './lib/smoothScroll'
import { Navbar } from './components/layout/Navbar'
import { Footer } from './components/layout/Footer'
import { Hero } from './components/sections/Hero'
import { ConstructionExperience } from './components/sections/ConstructionExperience'
import { About } from './components/sections/About'
import { Services } from './components/sections/Services'
import { Projects } from './components/sections/Projects'
import { Process } from './components/sections/Process'
import { WhyChoose } from './components/sections/WhyChoose'
import { Testimonials } from './components/sections/Testimonials'
import { Gallery } from './components/sections/Gallery'
import { FAQ } from './components/sections/FAQ'
import { Contact } from './components/sections/Contact'
import { CursorFollower } from './components/ui/CursorFollower'
import { ScrollProgress } from './components/ui/ScrollProgress'

export default function App() {
  useEffect(() => {
    const stop = initSmoothScroll()
    // re-measure once fonts and late images have settled
    const refresh = () => ScrollTrigger.refresh()
    window.addEventListener('load', refresh)
    document.fonts?.ready.then(refresh)
    // Re-measure whenever the document height changes (late images, accordions, filters),
    // otherwise trigger positions after the pinned sections go stale.
    let timer = 0
    let lastH = document.documentElement.scrollHeight
    const ro = new ResizeObserver(() => {
      const h = document.documentElement.scrollHeight
      if (Math.abs(h - lastH) < 2) return
      lastH = h
      window.clearTimeout(timer)
      timer = window.setTimeout(refresh, 200)
    })
    const main = document.getElementById('main')
    if (main) ro.observe(main)
    return () => {
      stop()
      ro.disconnect()
      window.clearTimeout(timer)
      window.removeEventListener('load', refresh)
    }
  }, [])

  return (
    <>
      <ScrollProgress />
      <Navbar />
      <main id="main">
        <Hero />
        <ConstructionExperience />
        <About />
        <Services />
        <Projects />
        <Process />
        <WhyChoose />
        <Testimonials />
        <Gallery />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <CursorFollower />
    </>
  )
}
