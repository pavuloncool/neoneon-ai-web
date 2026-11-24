'use client'

// components/blog/ContactForm.tsx
// Formularz kontaktowy (brief, pkt 7) — sekcja page buildera „Formularz kontaktowy” na stronie /pl/kontakt, /en/contact.
// Tekst obok formularza: lead z briefu + opcjonalny tekst z Sanity (children) + „Wolisz e-mail?”.
// Walidacja: ten sam schemat zod co w /api/contact (lib/contactSchema.ts); komunikaty zawsze tekstem pod polem
// (aria-invalid + aria-describedby), nie tylko kolorem. ?usluga= / ?service= wstępnie zaznacza potrzebę.
// Ochrona: honeypot (ukryte pole „website”) i limit po stronie serwera — bez CAPTCHA.
//
// Animacje (reduce: bez ruchu): podkreślenie pola przy fokusie rysuje się od lewej (CSS scaleX, 0,3 s);
// błąd pola przy próbie wysłania — krótki shake x (3 cykle, 0,3 s); przycisk przy wysyłce — ScrambleText
// na „Wysyłam…”; sukces — formularz zwija się (Flip), w jego miejscu rysuje się znak ✓ (DrawSVG) i komunikat.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { gsap } from '@/lib/gsap'
import '@/lib/gsap-text'
import '@/lib/gsap-svg'
import { Flip } from '@/lib/gsap-flip'
import { cn } from '@/lib/utils'
import { PUBLIC_CONTACT_EMAIL } from '@/lib/site'
import { toLocale } from '@/lib/locales'
import {
  BUDGET_OPTIONS,
  NEEDS,
  START_OPTIONS,
  contactSchema,
  fieldErrors,
  needFromParam,
  type ContactField,
  type Need,
} from '@/lib/contactSchema'

type Status = 'idle' | 'sending' | 'success' | 'error'

// Adres polityki prywatności (strony z Sanity; slug zależy od języka)
const PRIVACY_PATH = { pl: '/polityka-prywatnosci', en: '/privacy-policy' } as const

const reduceMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function ContactForm({ children }: { children?: React.ReactNode }) {
  const t = useTranslations('contactForm')
  const locale = toLocale(useLocale())
  const [status, setStatus] = useState<Status>('idle')
  const [form, setForm] = useState({ name: '', email: '', company: '', start: '', budget: '', message: '', website: '' })
  const [needs, setNeeds] = useState<Need[]>([])
  const [privacy, setPrivacy] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({})
  const [attempted, setAttempted] = useState(false)
  const [sentTo, setSentTo] = useState('')

  const wrap = useRef<HTMLDivElement>(null)
  const buttonLabel = useRef<HTMLSpanElement>(null)
  const flipState = useRef<Flip.FlipState | null>(null)

  // ?usluga= / ?service= z CTA usług → zaznaczona potrzeba
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const need = needFromParam(locale, params.get(locale === 'pl' ? 'usluga' : 'service'))
    if (need) setNeeds((prev) => (prev.includes(need) ? prev : [...prev, need]))
  }, [locale])

  const values = () => ({ ...form, needs, privacy })

  // Po pierwszej próbie wysłania błędy aktualizują się na bieżąco
  useEffect(() => {
    if (!attempted) return
    const result = contactSchema.safeParse(values())
    setErrors(result.success ? {} : fieldErrors(result.error))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, needs, privacy, attempted])

  // Sukces: Flip ze stanu sprzed zamiany formularza na komunikat, potem rysowanie ✓
  useLayoutEffect(() => {
    if (status !== 'success' || !wrap.current) return
    const check = wrap.current.querySelector<SVGPathElement>('[data-contact-check]')
    if (reduceMotion() || !flipState.current) return
    Flip.from(flipState.current, { duration: 0.6, ease: 'power3.inOut' })
    if (check) gsap.fromTo(check, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.6, ease: 'power2.out', delay: 0.35 })
    gsap.from(wrap.current.querySelector('[data-contact-success-text]'), { opacity: 0, y: 8, duration: 0.5, delay: 0.5, ease: 'power3.out' })
    flipState.current = null
  }, [status])

  const shake = (fields: ContactField[]) => {
    if (reduceMotion() || !wrap.current) return
    const targets = fields.map((f) => wrap.current!.querySelector(`[data-field="${f}"]`)).filter(Boolean)
    if (targets.length) gsap.fromTo(targets, { x: 0 }, { x: 6, duration: 0.05, repeat: 5, yoyo: true, ease: 'power1.inOut', clearProps: 'transform' })
  }

  const setButtonText = (text: string) => {
    const el = buttonLabel.current
    if (!el) return
    if (reduceMotion()) el.textContent = text
    else gsap.to(el, { duration: 0.5, scrambleText: { text, chars: 'lowerCase', speed: 0.6 } })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAttempted(true)
    const result = contactSchema.safeParse(values())
    if (!result.success) {
      const errs = fieldErrors(result.error)
      setErrors(errs)
      shake(Object.keys(errs) as ContactField[])
      // Fokus na pierwszym błędnym polu
      const first = (['name', 'email', 'needs', 'message', 'privacy'] as ContactField[]).find((f) => errs[f])
      wrap.current?.querySelector<HTMLElement>(`[data-field="${first}"] input, [data-field="${first}"] textarea`)?.focus()
      return
    }

    setStatus('sending')
    setButtonText(t('sending'))
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values(), locale }),
      })
      if (res.status === 400) {
        const data = await res.json().catch(() => null)
        if (data?.fields) {
          setErrors(data.fields)
          setStatus('idle')
          setButtonText(t('submit'))
          shake(Object.keys(data.fields) as ContactField[])
          return
        }
      }
      if (!res.ok) throw new Error(String(res.status))
      if (wrap.current) flipState.current = Flip.getState(wrap.current)
      setSentTo(result.data.email)
      setStatus('success')
    } catch {
      setStatus('error')
      setButtonText(t('submit'))
    }
  }

  const err = (f: ContactField) => (errors[f] ? t(`errors.${f}`) : null)
  const inputClass =
    'w-full bg-transparent border-0 border-b border-border dark:border-white/30 px-0 py-2.5 text-base text-ink dark:text-white placeholder:text-muted focus:outline-none'
  const labelClass = 'text-xs tracking-[0.14em] uppercase text-muted'
  const required = <span aria-hidden="true">*</span>

  // Pole tekstowe z podkreśleniem rysowanym przy fokusie (.contact-field w globals.css)
  const field = (name: 'name' | 'email' | 'company' | 'message', opts: { type?: string; textarea?: boolean; required?: boolean; autoComplete?: string }) => {
    const id = `contact-${name}`
    const error = name === 'company' ? null : err(name)
    return (
      <div data-field={name} className="flex flex-col gap-1.5">
        <label htmlFor={id} className={labelClass}>
          {t(name)}
          {opts.required ? required : null}
        </label>
        <div className="contact-field relative">
          {opts.textarea ? (
            <textarea
              id={id}
              rows={6}
              value={form[name]}
              onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              required={opts.required}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className={cn(inputClass, 'resize-y')}
            />
          ) : (
            <input
              id={id}
              type={opts.type ?? 'text'}
              value={form[name]}
              autoComplete={opts.autoComplete}
              onChange={(e) => setForm({ ...form, [name]: e.target.value })}
              required={opts.required}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className={inputClass}
            />
          )}
          <span aria-hidden="true" className="contact-field-line" />
        </div>
        {error ? (
          <p id={`${id}-error`} className="text-sm text-accent-edit">
            {error}
          </p>
        ) : null}
      </div>
    )
  }

  const select = (name: 'start' | 'budget', options: readonly string[], optionKey: 'startOptions' | 'budgetOptions') => (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`contact-${name}`} className={labelClass}>
        {t(name)}
      </label>
      <div className="contact-field relative">
        <select
          id={`contact-${name}`}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          className={cn(inputClass, 'appearance-none cursor-pointer pr-6')}
        >
          <option value="">—</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {t(`${optionKey}.${o}`)}
            </option>
          ))}
        </select>
        <span aria-hidden="true" className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-muted">
          ↓
        </span>
        <span aria-hidden="true" className="contact-field-line" />
      </div>
    </div>
  )

  return (
    <div className="grid md:grid-cols-[1fr_2fr] gap-12">
      <div className="flex flex-col gap-6 text-[15px] text-muted dark:text-white/70 leading-relaxed">
        <p className="text-lg text-ink dark:text-white leading-relaxed">{t('lead')}</p>
        {children}
        <p>
          {t('preferEmail')}{' '}
          <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`} className="underline underline-offset-4 text-ink dark:text-white">
            {PUBLIC_CONTACT_EMAIL}
          </a>
        </p>
      </div>

      <div ref={wrap} data-contact-wrap className="relative">
        {status === 'success' ? (
          <div role="status" className="flex items-start gap-5 border-t border-b border-border dark:border-white/15 py-8">
            {/* Znak ✓ w stylu korektorskim (dekoracja) */}
            <svg aria-hidden="true" viewBox="0 0 48 40" className="h-10 w-12 shrink-0 overflow-visible">
              <path
                data-contact-check
                d="M3,22 C9,26 13,31 17,36 C24,22 33,11 45,3"
                fill="none"
                stroke="var(--accent-edit)"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p data-contact-success-text className="font-display text-2xl md:text-3xl leading-snug">
              {t('success', { email: sentTo })}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
            {field('name', { required: true, autoComplete: 'name' })}
            {field('email', { type: 'email', required: true, autoComplete: 'email' })}
            {field('company', { autoComplete: 'organization' })}

            <fieldset
              data-field="needs"
              aria-describedby={errors.needs ? 'contact-needs-error' : undefined}
              aria-invalid={errors.needs ? true : undefined}
              className="flex flex-col gap-3"
            >
              <legend className={cn(labelClass, 'mb-3')}>
                {t('needsLegend')}
                {required}
              </legend>
              {NEEDS.map((need) => (
                <label key={need} className="flex items-center gap-3 text-base cursor-pointer">
                  <input
                    type="checkbox"
                    checked={needs.includes(need)}
                    onChange={(e) => setNeeds(e.target.checked ? [...needs, need] : needs.filter((n) => n !== need))}
                    className="h-4 w-4 accent-[var(--accent-edit)]"
                  />
                  {t(`needs.${need}`)}
                </label>
              ))}
              {err('needs') ? (
                <p id="contact-needs-error" className="text-sm text-accent-edit">
                  {err('needs')}
                </p>
              ) : null}
            </fieldset>

            <div className="grid gap-7 sm:grid-cols-2">
              {select('start', START_OPTIONS, 'startOptions')}
              {select('budget', BUDGET_OPTIONS, 'budgetOptions')}
            </div>

            {field('message', { textarea: true, required: true })}

            {/* Honeypot — niewidoczne dla ludzi i czytników; wypełnione = bot */}
            <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>

            <div data-field="privacy" className="flex flex-col gap-1.5">
              <label className="flex items-start gap-3 text-base cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacy}
                  onChange={(e) => setPrivacy(e.target.checked)}
                  aria-invalid={errors.privacy ? true : undefined}
                  aria-describedby={errors.privacy ? 'contact-privacy-error' : undefined}
                  className="mt-1 h-4 w-4 accent-[var(--accent-edit)]"
                />
                <span>
                  {t('privacyBefore')}
                  <Link href={PRIVACY_PATH[locale]} className="underline underline-offset-4">
                    {t('privacyLink')}
                  </Link>
                  {t('privacyAfter')}
                  {required}
                </span>
              </label>
              {err('privacy') ? (
                <p id="contact-privacy-error" className="text-sm text-accent-edit">
                  {err('privacy')}
                </p>
              ) : null}
            </div>

            {status === 'error' ? (
              <p role="alert" className="text-sm text-accent-edit">
                {t('serverError', { email: PUBLIC_CONTACT_EMAIL })}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === 'sending'}
              aria-busy={status === 'sending'}
              className="self-start inline-flex items-center gap-2 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink px-7 py-3.5 text-sm font-medium disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span ref={buttonLabel}>{t('submit')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
