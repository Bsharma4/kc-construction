/** Verified business details in one place. */
const PHONE = (import.meta.env.VITE_PHONE_NUMBER as string | undefined)?.trim() || '618-910-7886'
const digits = PHONE.replace(/\D/g, '')

export const SITE = {
  name: 'K&S Construction',
  city: 'Waterloo',
  region: 'Illinois',
  regionCode: 'IL',
  tagline: 'Second Generation Owned and Operated. Licensed & Insured.',
  phone: PHONE,
} as const

export const hasPhone = digits.length >= 10
export const telHref = hasPhone ? `tel:+${digits.length === 10 ? '1' + digits : digits}` : '#contact'
export const CALL_LABEL = 'Call Now for a Bid'
export const BID_LABEL = 'Request a Free Bid'
