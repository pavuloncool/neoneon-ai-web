// app/api/contact/route.ts
// Formularz kontaktowy (brief, pkt 7). Walidacja tym samym schematem co w przeglądarce (lib/contactSchema.ts).
// Ochrona: honeypot i prosty limit zgłoszeń z jednego adresu IP — bez CAPTCHA (brief: dopiero gdy pojawi się spam;
// Turnstile zostaje w formularzu komentarzy). Wiadomość trafia jako szkic do Sanity (widoczna tylko w Studio)
// i mailem przez Resend; błąd zapisu w Sanity nie blokuje maila.

import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { writeClient } from '@/sanity/lib/client'
import { clientIp } from '@/lib/turnstile'
import { escapeHtml } from '@/lib/utils'
import { CONTACT_EMAIL, FORM_FROM_EMAIL } from '@/lib/site'
import { getResend } from '@/lib/email'
import { contactSchema, fieldErrors } from '@/lib/contactSchema'

// Limit: 5 wiadomości na 10 minut z jednego IP. Pamięć jednej instancji funkcji — wystarcza na
// przypadkowe wielokrotne wysyłki i prosty spam; przy realnym spamie: Turnstile albo limit w Vercel Firewall.
const WINDOW_MS = 10 * 60 * 1000
const MAX_PER_WINDOW = 5
const hits = new Map<string, number[]>()

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  recent.push(now)
  hits.set(ip, recent)
  if (hits.size > 5000) hits.clear() // zabezpieczenie pamięci
  return recent.length > MAX_PER_WINDOW
}

// Etykiety opcji w mailu (po polsku — mail czyta właściciel strony)
const LABELS: Record<string, string> = {
  copy: 'Tekst na stronę',
  website: 'Strona od decyzji do wdrożenia',
  content: 'Treści i blog',
  audit: 'Audyt widoczności w AI',
  unsure: 'Jeszcze nie wiem / Nie wiem',
  asap: 'Jak najszybciej',
  month: 'W ciągu miesiąca',
  quarter: 'Za 2–3 miesiące',
  upTo3k: 'do 3 000 zł',
  from3to8k: '3 000–8 000 zł',
  from8to15k: '8 000–15 000 zł',
  over15k: 'powyżej 15 000 zł',
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid' }, { status: 400 })
  }

  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'validation', fields: fieldErrors(parsed.error) }, { status: 400 })
  }
  const data = parsed.data

  // Honeypot wypełniony: odpowiedź jak przy sukcesie (bot nie dostaje sygnału), nic nie zapisujemy
  if (data.website) return NextResponse.json({ success: true })

  if (rateLimited(clientIp(request) ?? 'unknown')) {
    return NextResponse.json({ error: 'rate' }, { status: 429 })
  }

  const locale = (body as { locale?: string })?.locale === 'en' ? 'en' : 'pl'

  let saved = false
  try {
    await writeClient.create({
      _id: `drafts.${randomUUID()}`,
      _type: 'contactMessage',
      name: data.name,
      email: data.email,
      company: data.company || undefined,
      needs: data.needs,
      start: data.start || undefined,
      budget: data.budget || undefined,
      message: data.message,
      locale,
      submittedAt: new Date().toISOString(),
    })
    saved = true
  } catch (e) {
    console.error('Contact save error:', e)
  }

  // Bez klucza Resend (ostrzeżenie w logu) wiadomość zostaje tylko w Sanity
  const resend = getResend()
  if (!resend) {
    return saved ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'server' }, { status: 500 })
  }

  const row = (label: string, value: string) => (value ? `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>` : '')
  const { error } = await resend.emails.send({
    from: FORM_FROM_EMAIL,
    to: CONTACT_EMAIL,
    replyTo: data.email,
    subject: `Nowa wiadomość od ${data.name}`,
    html: [
      row('Imię i nazwisko', data.name),
      row('E-mail', data.email),
      row('Firma / strona', data.company),
      row('Potrzeby', data.needs.map((n) => LABELS[n] ?? n).join(', ')),
      row('Start', data.start ? LABELS[data.start] : ''),
      row('Budżet netto', data.budget ? LABELS[data.budget] : ''),
      row('Język strony', locale.toUpperCase()),
      `<p><strong>Wiadomość:</strong></p><p style="white-space:pre-line">${escapeHtml(data.message)}</p>`,
    ].join(''),
  })

  if (error) {
    console.error('Resend error:', error)
    // Mail nie wyszedł, ale wiadomość jest w Sanity — dla nadawcy to sukces
    return saved ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'server' }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
