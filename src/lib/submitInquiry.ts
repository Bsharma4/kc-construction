export type InquiryPayload = {
  fullName: string
  email: string
  phone: string
  projectType: string
  location: string
  budget: string
  description: string
  startDate: string
}

export type InquiryResult =
  | { mode: 'demo' }
  | { mode: 'sent' }
  | { mode: 'error'; message: string }

/**
 * Integration point for the quote form.
 *
 * Set VITE_FORM_ENDPOINT in a `.env` file to a form backend (Formspree, a serverless
 * function, your CRM webhook, …) that accepts a JSON POST. Until then the form runs in
 * demo mode and never claims that a message was delivered.
 */
export const FORM_ENDPOINT: string | undefined = import.meta.env.VITE_FORM_ENDPOINT || undefined

export async function submitInquiry(payload: InquiryPayload): Promise<InquiryResult> {
  if (!FORM_ENDPOINT) {
    await new Promise((r) => setTimeout(r, 700))
    return { mode: 'demo' }
  }
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) return { mode: 'error', message: `The form service responded with ${res.status}.` }
    return { mode: 'sent' }
  } catch {
    return { mode: 'error', message: 'Network error — the inquiry could not be sent. Please try again.' }
  }
}
