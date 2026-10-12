import { useRef, useState, type FormEvent } from 'react'
import { AlertTriangle, ArrowUpRight, CircleAlert, CircleCheck, Info, LoaderCircle } from 'lucide-react'
import { gsap, useGSAP } from '../../lib/gsap'
import { FORM_ENDPOINT, submitInquiry, type InquiryPayload } from '../../lib/submitInquiry'
import { MagneticButton } from '../ui/MagneticButton'
import { CallButton } from '../ui/CallButton'
import { SITE, hasPhone, telHref } from '../../lib/site'

type Errors = Partial<Record<keyof InquiryPayload, string>>

const EMPTY: InquiryPayload = { fullName: '', email: '', phone: '', projectType: '', location: '', budget: '', description: '', startDate: '' }

const PROJECT_TYPES = ['Custom residential project', 'Residential construction', 'Home remodeling', 'Decks & patios', 'Concrete work', 'Excavation', 'Bobcat work', 'Light hauling', 'Landscaping', 'Fencing', 'Land grading', 'Other / not sure']
const BUDGETS = ['Under $5k', '$5k – $15k', '$15k – $50k', '$50k – $150k', '$150k+', 'Not sure yet']

const today = () => new Date().toISOString().slice(0, 10)

function validate(v: InquiryPayload): Errors {
  const e: Errors = {}
  if (v.fullName.trim().length < 2) e.fullName = 'Please enter your full name.'
  if (!v.email.trim()) e.email = 'Please enter your email address.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.email.trim())) e.email = 'Please enter a valid email address, e.g. name@example.com.'
  if (v.phone.trim() && (v.phone.replace(/\D/g, '').length < 7 || /[^\d\s()+.-]/.test(v.phone)))
    e.phone = 'Please enter a valid phone number (digits, spaces, + ( ) - only).'
  if (!v.projectType) e.projectType = 'Please choose a project type.'
  if (v.location.trim() && v.location.trim().length < 2) e.location = 'Please enter a city or area.'
  if (v.description.trim().length < 20) e.description = 'Please describe your project in at least 20 characters.'
  if (v.startDate && v.startDate < today()) e.startDate = 'Preferred start date cannot be in the past.'
  return e
}

const LABELS: Record<keyof InquiryPayload, string> = {
  fullName: 'Full name',
  email: 'Email address',
  phone: 'Phone number',
  projectType: 'Project type',
  location: 'Project location',
  budget: 'Estimated budget',
  description: 'Project description',
  startDate: 'Preferred start date',
}

function Field({
  name, label, required, error, children, hint,
}: { name: keyof InquiryPayload; label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={name} className="flex items-baseline justify-between text-xs font-medium uppercase tracking-[0.14em] text-bone/70">
        <span>
          {label} {required ? <span className="text-orange" aria-hidden>*</span> : <span className="normal-case tracking-normal text-bone/35">(optional)</span>}
        </span>
      </label>
      {children}
      {hint && !error && <p id={`${name}-hint`} className="text-xs text-bone/40">{hint}</p>}
      {error && (
        <p id={`${name}-error`} className="flex items-center gap-1.5 text-xs text-[#ff8a65]">
          <CircleAlert size={13} /> {error}
        </p>
      )}
    </div>
  )
}

const inputCls = (err?: string) =>
  `w-full rounded-lg border bg-ink/60 px-4 py-3.5 text-[0.95rem] text-bone placeholder:text-bone/30 outline-none transition focus:border-orange focus:ring-2 focus:ring-orange/25 ${err ? 'border-[#ff8a65]' : 'border-white/10 hover:border-white/25'}`

export function Contact() {
  const root = useRef<HTMLElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)
  const [values, setValues] = useState<InquiryPayload>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof InquiryPayload, boolean>>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'demo' | 'sent' | 'error'>('idle')
  const [serverError, setServerError] = useState('')
  const [showSummary, setShowSummary] = useState(false)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.ct-line', { yPercent: 110, duration: 1.2, stagger: 0.1, ease: 'power4.out', scrollTrigger: { trigger: root.current, start: 'top 75%', toggleActions: 'play none none reverse' } })
        gsap.from('.ct-form', { y: 60, autoAlpha: 0, duration: 1.1, scrollTrigger: { trigger: '.ct-form', start: 'top 85%', toggleActions: 'play none none reverse' } })
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  const set = (k: keyof InquiryPayload, v: string) => {
    const next = { ...values, [k]: v }
    setValues(next)
    if (touched[k] || errors[k]) setErrors((prev) => ({ ...prev, [k]: validate(next)[k] }))
  }
  const blur = (k: keyof InquiryPayload) => {
    setTouched((t) => ({ ...t, [k]: true }))
    setErrors((prev) => ({ ...prev, [k]: validate(values)[k] }))
  }
  const a11y = (k: keyof InquiryPayload, hint?: boolean) => ({
    id: k,
    name: k,
    'aria-invalid': !!errors[k] || undefined,
    'aria-describedby': errors[k] ? `${k}-error` : hint ? `${k}-hint` : undefined,
    onBlur: () => blur(k),
  })

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    setTouched(Object.fromEntries(Object.keys(EMPTY).map((k) => [k, true])))
    if (Object.keys(errs).length) {
      setShowSummary(true)
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    setShowSummary(false)
    setStatus('submitting')
    const res = await submitInquiry(values)
    if (res.mode === 'error') {
      setServerError(res.message)
      setStatus('error')
      return
    }
    setStatus(res.mode)
    requestAnimationFrame(() => doneRef.current?.focus())
  }

  const reset = () => {
    setValues(EMPTY)
    setErrors({})
    setTouched({})
    setStatus('idle')
  }

  const errorList = Object.entries(errors).filter(([, v]) => v) as [keyof InquiryPayload, string][]

  return (
    <section ref={root} id="contact" className="grain relative overflow-hidden bg-ink py-28 md:py-40">
      <div className="pointer-events-none absolute -right-40 top-20 h-[600px] w-[600px] rounded-full bg-orange/10 blur-[140px]" />
      <div className="container-x relative">
        <p className="eyebrow mb-8 flex items-center gap-3">
          <span className="font-mono text-orange">09</span>
          <span className="h-px w-10 bg-orange/70" /> Call now for a bid
        </p>
        <h2 className="font-display-x text-[clamp(2.4rem,8vw,8.5rem)] font-black uppercase text-bone">
          <span className="line-mask"><span className="ct-line">Let’s build</span></span>
          <span className="line-mask"><span className="ct-line">something</span></span>
          <span className="line-mask"><span className="ct-line text-orange">that lasts.</span></span>
        </h2>

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <p className="text-lg leading-relaxed text-bone/70">
              The fastest way to get started is a phone call. Prefer to write? Send your project details with the form and we’ll get back to you.
            </p>
            <CallButton className="mt-8" />
            <ol className="mt-10 space-y-6">
              {['Call or send your project details', 'We look at the job with you', 'You receive a clear bid'].map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-orange/50 font-mono text-xs text-orange">{i + 1}</span>
                  <span className="pt-1 text-bone/80">{s}</span>
                </li>
              ))}
            </ol>
            <div className="mt-10 rounded-xl border border-white/10 bg-ink-2 p-5 text-sm leading-relaxed text-bone/55">
              <p className="mb-2 flex items-center gap-2 font-medium text-bone/80">
                <Info size={15} className="text-orange" /> K&amp;C Construction
              </p>
              Waterloo, Illinois · Second generation owned and operated · Licensed &amp; insured
              {hasPhone && <a href={telHref} className="mt-3 block font-display-x text-2xl font-extrabold text-bone hover:text-orange">{SITE.phone}</a>}
            </div>
          </aside>

          <div className="ct-form lg:col-span-8">
            {!FORM_ENDPOINT && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-orange/40 bg-orange/[0.08] p-4 text-sm text-bone/85" role="note">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-orange" />
                <p>
                  <strong className="font-semibold text-bone">Demo mode.</strong> This form is not connected to an email service or backend yet, so submissions are
                  validated but <strong>not sent anywhere</strong>. It needs integration (set <code className="font-mono text-xs text-orange">VITE_FORM_ENDPOINT</code>) before it can receive real inquiries.
                </p>
              </div>
            )}

            {status === 'demo' || status === 'sent' ? (
              <div className="rounded-2xl border border-white/10 bg-ink-2 p-8 md:p-12" role="status" aria-live="polite">
                <CircleCheck size={40} className="text-orange" />
                <h3 ref={doneRef} tabIndex={-1} className="font-display-x mt-6 text-3xl font-extrabold uppercase outline-none md:text-4xl">
                  {status === 'sent' ? 'Inquiry sent.' : 'Form completed — not sent.'}
                </h3>
                <p className="mt-4 max-w-xl leading-relaxed text-bone/70">
                  {status === 'sent'
                    ? `Thanks, ${values.fullName.split(' ')[0]}. Your inquiry was delivered to the configured form service.`
                    : `Thanks, ${values.fullName.split(' ')[0]}. Your details passed validation, but because this site is in demo mode nothing was transmitted and no one has received your message. Once a form service is connected, submissions will be delivered.`}
                </p>
                <dl className="mt-8 grid gap-x-8 gap-y-3 border-t border-white/10 pt-6 text-sm sm:grid-cols-2">
                  {(Object.keys(EMPTY) as (keyof InquiryPayload)[])
                    .filter((k) => values[k] && k !== 'description')
                    .map((k) => (
                      <div key={k}>
                        <dt className="text-xs uppercase tracking-wider text-bone/40">{LABELS[k]}</dt>
                        <dd className="text-bone/85">{values[k]}</dd>
                      </div>
                    ))}
                </dl>
                <button type="button" onClick={reset} className="mt-8 text-sm font-semibold text-orange underline-offset-4 hover:underline">
                  Start a new inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-white/10 bg-ink-2/80 p-6 backdrop-blur md:p-10" aria-describedby="form-required-note">
                {showSummary && errorList.length > 0 && (
                  <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-8 rounded-xl border border-[#ff8a65]/50 bg-[#ff8a65]/10 p-4 text-sm outline-none">
                    <p className="font-semibold text-bone">Please fix {errorList.length} {errorList.length === 1 ? 'field' : 'fields'}:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-bone/80">
                      {errorList.map(([k, msg]) => (
                        <li key={k}>
                          <a href={`#${k}`} onClick={(e) => { e.preventDefault(); document.getElementById(k)?.focus() }} className="underline underline-offset-2 hover:text-orange">
                            {LABELS[k]}
                          </a>{' '}
                          — {msg}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {status === 'error' && (
                  <div role="alert" className="mb-8 rounded-xl border border-[#ff8a65]/50 bg-[#ff8a65]/10 p-4 text-sm text-bone">
                    {serverError}
                  </div>
                )}
                <div className="grid gap-6 md:grid-cols-2">
                  <Field name="fullName" label={LABELS.fullName} required error={errors.fullName}>
                    <input {...a11y('fullName')} type="text" autoComplete="name" required value={values.fullName} onChange={(e) => set('fullName', e.target.value)} className={inputCls(errors.fullName)} placeholder="Jane Doe" />
                  </Field>
                  <Field name="email" label={LABELS.email} required error={errors.email}>
                    <input {...a11y('email')} type="email" autoComplete="email" required value={values.email} onChange={(e) => set('email', e.target.value)} className={inputCls(errors.email)} placeholder="name@example.com" />
                  </Field>
                  <Field name="phone" label={LABELS.phone} error={errors.phone}>
                    <input {...a11y('phone')} type="tel" autoComplete="tel" value={values.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls(errors.phone)} placeholder="+1 555 000 0000" />
                  </Field>
                  <Field name="projectType" label={LABELS.projectType} required error={errors.projectType}>
                    <select {...a11y('projectType')} required value={values.projectType} onChange={(e) => set('projectType', e.target.value)} className={`${inputCls(errors.projectType)} appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23ff5a1f' stroke-width='2'><path d='M2 4l4 4 4-4'/></svg>")] bg-[position:right_1rem_center] bg-no-repeat pr-10`}>
                      <option value="" disabled>Select a project type</option>
                      {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field name="location" label={LABELS.location} error={errors.location}>
                    <input {...a11y('location')} type="text" autoComplete="address-level2" value={values.location} onChange={(e) => set('location', e.target.value)} className={inputCls(errors.location)} placeholder="City or area" />
                  </Field>
                  <Field name="budget" label={LABELS.budget} error={errors.budget}>
                    <select {...a11y('budget')} value={values.budget} onChange={(e) => set('budget', e.target.value)} className={`${inputCls(errors.budget)} appearance-none bg-[url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23ff5a1f' stroke-width='2'><path d='M2 4l4 4 4-4'/></svg>")] bg-[position:right_1rem_center] bg-no-repeat pr-10`}>
                      <option value="">Select a range</option>
                      {BUDGETS.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </Field>
                  <div className="md:col-span-2">
                    <Field name="description" label={LABELS.description} required error={errors.description} hint="Scope, size, site, any drawings you already have — at least 20 characters.">
                      <textarea {...a11y('description', true)} required rows={5} value={values.description} onChange={(e) => set('description', e.target.value)} className={`${inputCls(errors.description)} resize-y`} placeholder="Tell us what you’d like to build…" />
                    </Field>
                  </div>
                  <Field name="startDate" label={LABELS.startDate} error={errors.startDate}>
                    <input {...a11y('startDate')} type="date" min={today()} value={values.startDate} onChange={(e) => set('startDate', e.target.value)} className={`${inputCls(errors.startDate)} [color-scheme:dark]`} />
                  </Field>
                  <div className="flex items-end">
                    <MagneticButton type="submit" disabled={status === 'submitting'} className="w-full !py-4" strength={0.2}>
                      {status === 'submitting' ? (
                        <>
                          <LoaderCircle size={18} className="animate-spin" /> Checking…
                        </>
                      ) : (
                        <>
                          {FORM_ENDPOINT ? 'Request a bid' : 'Request a bid (demo mode)'} <ArrowUpRight size={18} />
                        </>
                      )}
                    </MagneticButton>
                  </div>
                </div>
                <p id="form-required-note" className="mt-6 text-xs text-bone/40">
                  <span className="text-orange">*</span> Required fields. Your information is only used to respond to your inquiry.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
