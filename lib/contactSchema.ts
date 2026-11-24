// lib/contactSchema.ts
// Formularz kontaktowy (brief, pkt 7): pola, opcje i walidacja — wspólne dla przeglądarki i /api/contact.
// Komunikaty błędów są kluczami tekstów (messages: contactForm.errors.*), tłumaczonymi w formularzu.

import { z } from 'zod'
import type { Locale } from '@/lib/locales'

// Stałe wartości opcji (zapisywane w Sanity i w mailu); etykiety w messages: contactForm.needs.* itd.
export const NEEDS = ['copy', 'website', 'content', 'audit', 'unsure'] as const
export const START_OPTIONS = ['asap', 'month', 'quarter', 'unsure'] as const
export const BUDGET_OPTIONS = ['upTo3k', 'from3to8k', 'from8to15k', 'over15k', 'unsure'] as const

export type Need = (typeof NEEDS)[number]

// ?usluga= (PL) / ?service= (EN) z CTA usług → wstępnie zaznaczona potrzeba (brief 5.5)
const SERVICE_PARAM_TO_NEED: Record<Locale, Record<string, Need>> = {
  pl: { tekst: 'copy', strona: 'website', tresci: 'content' },
  en: { copy: 'copy', website: 'website', content: 'content' },
}
export function needFromParam(locale: Locale, value: string | null | undefined): Need | null {
  return value ? SERVICE_PARAM_TO_NEED[locale][value] ?? null : null
}

export const MESSAGE_MIN = 20

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'name').max(100, 'name'),
  email: z.string().trim().max(200, 'email').pipe(z.email('email')),
  company: z.string().trim().max(200).optional().default(''),
  needs: z.array(z.enum(NEEDS)).min(1, 'needs'),
  start: z.union([z.enum(START_OPTIONS), z.literal('')]).optional().default(''),
  budget: z.union([z.enum(BUDGET_OPTIONS), z.literal('')]).optional().default(''),
  message: z.string().trim().min(MESSAGE_MIN, 'message').max(5000, 'message'),
  privacy: z.literal(true, 'privacy'),
  // Honeypot: pole niewidoczne dla ludzi; wypełnione = bot (serwer udaje sukces, nic nie zapisuje)
  website: z.string().optional().default(''),
})

export type ContactInput = z.input<typeof contactSchema>
export type ContactData = z.output<typeof contactSchema>
export type ContactField = 'name' | 'email' | 'needs' | 'message' | 'privacy'

// Błędy walidacji → { pole: klucz komunikatu } (pierwszy błąd każdego pola)
export function fieldErrors(error: z.ZodError): Partial<Record<ContactField, string>> {
  const out: Partial<Record<ContactField, string>> = {}
  for (const issue of error.issues) {
    const field = issue.path[0] as ContactField
    if (!out[field]) out[field] = field
  }
  return out
}
