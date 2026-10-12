import { Phone } from 'lucide-react'
import { MagneticButton } from './MagneticButton'
import { navigate } from '../layout/Navbar'
import { CALL_LABEL, SITE, hasPhone, telHref } from '../../lib/site'

type Props = { variant?: 'primary' | 'ghost'; className?: string; onNavigate?: () => void; compact?: boolean }

/** Primary lead CTA. Dials the configured number, or falls back to the bid form until one is set. */
export function CallButton({ variant = 'primary', className = '', onNavigate, compact }: Props) {
  return (
    <MagneticButton
      href={telHref}
      variant={variant}
      className={className}
      ariaLabel={hasPhone ? `${CALL_LABEL}: ${SITE.phone}` : `${CALL_LABEL} — request a bid using the form`}
      onClick={hasPhone ? onNavigate : (e) => navigate(e, '#contact', onNavigate)}
    >
      <Phone size={compact ? 15 : 17} className="transition-transform duration-300 group-hover:-rotate-12" />
      {CALL_LABEL}
    </MagneticButton>
  )
}
