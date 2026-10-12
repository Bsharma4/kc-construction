import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)
gsap.defaults({ ease: 'power3.out' })
ScrollTrigger.config({ ignoreMobileResize: true })

export { gsap, ScrollTrigger, useGSAP }
