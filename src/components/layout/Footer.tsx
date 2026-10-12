import { ArrowUp, ArrowUpRight, AtSign, Globe, Rss, Share2 } from 'lucide-react'
import { NAV_LINKS, Logo, navigate } from './Navbar'
import { SERVICE_CATEGORIES } from '../../data/services'
import { CallButton } from '../ui/CallButton'
import { SITE } from '../../lib/site'
import { scrollToTarget } from '../../lib/smoothScroll'

const SOCIAL = [
  { label: 'Social profile placeholder 1', icon: Share2 },
  { label: 'Social profile placeholder 2', icon: Globe },
  { label: 'Social profile placeholder 3', icon: AtSign },
  { label: 'Social profile placeholder 4', icon: Rss },
]

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-ink pt-24">
      <div className="container-x">
        <div className="flex flex-col gap-10 border-b border-white/[0.07] pb-16 md:flex-row md:items-end md:justify-between">
          <p className="font-display-x max-w-3xl text-[clamp(2rem,5vw,4.2rem)] font-black uppercase leading-[0.95]">
            Have a project in mind<span className="text-orange">?</span>
          </p>
          <CallButton className="!px-8 !py-5 text-base" />
        </div>

        <div className="grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo />
            <p className="mt-6 max-w-xs text-sm leading-relaxed text-bone/55">{SITE.tagline} Based in {SITE.city}, {SITE.region}.</p>
            <ul className="mt-8 flex gap-2" aria-label="Social media (placeholders)">
              {SOCIAL.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <span
                    title="Social profile coming soon"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-full border border-bone/15 text-bone/50"
                  >
                    <Icon size={16} />
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-bone/35">Social profiles not yet published.</p>
          </div>
          <nav className="lg:col-span-2" aria-label="Footer">
            <p className="eyebrow mb-5">Navigate</p>
            <ul className="space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={(e) => navigate(e, l.href)} className="text-sm text-bone/70 transition-colors hover:text-orange">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="lg:col-span-3">
            <p className="eyebrow mb-5">Services</p>
            <ul className="space-y-3">
              {SERVICE_CATEGORIES.map((c) => (
                <li key={c}>
                  <a href="#services" onClick={(e) => navigate(e, '#services')} className="text-sm text-bone/70 transition-colors hover:text-orange">
                    {c}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-3">
            <p className="eyebrow mb-5">Start a project</p>
            <p className="text-sm leading-relaxed text-bone/60">Call for a bid, or share your plans through the bid request form.</p>
            <a href="#contact" onClick={(e) => navigate(e, '#contact')} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange hover:underline">
              Request a bid online <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
      </div>

      <div className="pointer-events-none select-none overflow-hidden" aria-hidden>
        <p className="font-display-x translate-y-[18%] whitespace-nowrap text-center text-[22vw] font-black uppercase leading-none text-bone/[0.04]">K&amp;C Build</p>
      </div>

      <div className="border-t border-white/[0.07]">
        <div className="container-x flex flex-col items-center justify-between gap-4 py-6 text-xs text-bone/45 sm:flex-row">
          <p>© {new Date().getFullYear()} K&amp;C Construction. All rights reserved.</p>
          <p className="text-center">Project images are illustrative stock photography (Unsplash), not K&amp;C job photos.</p>
          <button
            type="button"
            onClick={() => scrollToTarget(0)}
            className="group inline-flex items-center gap-2 rounded-full border border-bone/15 px-4 py-2 text-bone/70 transition hover:border-orange hover:text-orange"
          >
            Back to top <ArrowUp size={14} className="transition-transform group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}
