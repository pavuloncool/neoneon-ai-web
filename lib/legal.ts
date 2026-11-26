// lib/legal.ts
//
// Polityka prywatności i polityka cookies (PL/EN): adresy stron i typy. Treść jest w Sanity
// (Studio → „Polityki”, dokumenty legal-{privacy,cookies}-{pl,en}); w kodzie nie ma treści zapasowej.
// Weryfikacja prawna treści — przed każdą większą zmianą (brief, pkt 8).
//
// Stan treści z 24.11.2026 opisuje m.in. listę cookies według
// audytu z 24.11.2026 (kod + przeglądarka): NEXT_LOCALE (next-intl) — motyw jest stały (ciemny), next-themes nic nie zapisuje (sprawdzone 25.11),
// neoneon_translation_path (sessionStorage), cookies Studio Sanity i trybu podglądu (tylko redaktorzy),
// Cloudflare Turnstile w formularzu komentarzy (tylko gdy COMMENTS_ENABLED), Vercel Web Analytics i Speed Insights (bez cookies).
// Przy zmianie integracji (np. włączenie Umami) zaktualizuj treść i datę w Studio.

import type { Locale } from '@/lib/locales'
import { PUBLIC_CONTACT_EMAIL, COMMENTS_ENABLED } from '@/lib/site'
import { getLegalDocument } from '@/lib/queries'

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }

export interface LegalSection {
  title: string
  blocks: LegalBlock[]
}

export interface LegalDoc {
  title: string
  description: string
  updated: string // tekst „Ostatnia aktualizacja: …”
  sections: LegalSection[]
}

export type LegalKey = 'privacy' | 'cookies'

// Adresy stron (bez prefiksu języka) — trasy w app/[locale]/(blog)/{slug}/page.tsx
export const LEGAL_PATHS: Record<LegalKey, Record<Locale, string>> = {
  privacy: { pl: '/polityka-prywatnosci', en: '/privacy-policy' },
  cookies: { pl: '/polityka-cookies', en: '/cookie-policy' },
}

type Visibility = 'always' | 'commentsOn' | 'commentsOff' | null | undefined
type RawBlock =
  | { _type: 'legalParagraph'; text?: string; visibility?: Visibility }
  | { _type: 'legalList'; items?: { text?: string; visibility?: Visibility }[]; visibility?: Visibility }
  | { _type: 'legalTable'; head?: string[]; rows?: { cells?: string[] }[]; visibility?: Visibility }
interface RawDoc {
  title?: string
  description?: string
  updated?: string
  sections?: { title?: string; blocks?: RawBlock[]; visibility?: Visibility }[]
}

// Fragmenty o komentarzach widać tylko przy włączonych komentarzach (COMMENTS_ENABLED), i odwrotnie
const visible = (v: Visibility) => !v || v === 'always' || (v === 'commentsOn') === COMMENTS_ENABLED
const withEmail = (text = '') => text.replaceAll('{email}', PUBLIC_CONTACT_EMAIL)

export async function getLegalDoc(key: LegalKey, locale: Locale): Promise<LegalDoc> {
  const raw = (await getLegalDocument(key, locale)) as RawDoc | null
  if (!raw?.title) throw new Error(`Polityka: brak dokumentu legal-${key}-${locale} w Sanity`)
  return {
    title: raw.title,
    description: raw.description ?? '',
    updated: raw.updated ?? '',
    sections: (raw.sections ?? []).filter((s) => visible(s.visibility)).map((s) => ({
      title: s.title ?? '',
      blocks: (s.blocks ?? []).filter((b) => visible(b.visibility)).flatMap((b): LegalBlock[] => {
        if (b._type === 'legalParagraph') return [{ type: 'p', text: withEmail(b.text) }]
        if (b._type === 'legalList') return [{ type: 'list', items: (b.items ?? []).filter((i) => visible(i.visibility)).map((i) => withEmail(i.text)) }]
        if (b._type === 'legalTable') return [{ type: 'table', head: b.head ?? [], rows: (b.rows ?? []).map((r) => (r.cells ?? []).map(withEmail)) }]
        return []
      }),
    })),
  }
}
