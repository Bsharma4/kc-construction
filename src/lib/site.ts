/**
 * Business details in one place.
 * Set VITE_PHONE_NUMBER in `.env` (e.g. VITE_PHONE_NUMBER="(618) 555-0123") to switch every
 * "Call Now for a Bid" button to a tap-to-call link. Until then the buttons lead to the bid form.
 */
export const SITE = {
  name: 'K&C Construction',
  city: 'Waterloo',
  region: 'Illinois',
  regionCode: 'IL',
  tagline: 'Second Generation Owned and Operated. Licensed & Insured.',
  phone: (import.meta.env.VITE_PHONE_NUMBER as string | undefined)?.trim() || '',
} as const

export const hasPhone = SITE.phone.length > 0
export const telHref = hasPhone ? `tel:${SITE.phone.replace(/[^\d+]/g, '')}` : '#contact'
export const CALL_LABEL = 'Call Now for a Bid'
