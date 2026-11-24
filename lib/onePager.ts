// lib/onePager.ts
// Sekcje strony głównej (one-pager) w kolejności budowy z briefu (pkt 4) i ich kotwice w każdym języku.
// Kotwice z nawigacji (proces, uslugi, wyceny, o-mnie / process, services, pricing, about) są ustalone
// w briefie — nie zmieniać bez przekierowań linków w Sanity (link typu „Sekcja strony głównej”).

import type { Locale } from '@/lib/locales'

export const ONE_PAGER_SECTIONS = [
  { key: 'hero', iteration: 1, anchor: { pl: 'start', en: 'start' } },
  { key: 'aiRole', iteration: 2, anchor: { pl: 'ai-i-decyzje', en: 'ai-and-decisions' } },
  { key: 'problem', iteration: 3, anchor: { pl: 'pusta-strona', en: 'blank-page' } },
  { key: 'audience', iteration: 4, anchor: { pl: 'dla-kogo', en: 'who-i-work-with' } },
  { key: 'services', iteration: 5, anchor: { pl: 'uslugi', en: 'services' } },
  { key: 'process', iteration: 6, anchor: { pl: 'proces', en: 'process' } },
  { key: 'pricing', iteration: 7, anchor: { pl: 'wyceny', en: 'pricing' } },
  { key: 'about', iteration: 8, anchor: { pl: 'o-mnie', en: 'about' } },
  { key: 'faq', iteration: 9, anchor: { pl: 'faq', en: 'faq' } },
  { key: 'blog', iteration: 10, anchor: { pl: 'z-bloga', en: 'from-the-blog' } },
  { key: 'cta', iteration: 11, anchor: { pl: 'kontakt', en: 'contact' } },
] as const satisfies readonly { key: string; iteration: number; anchor: Record<Locale, string> }[]

export type OnePagerSectionKey = (typeof ONE_PAGER_SECTIONS)[number]['key']

export function sectionAnchor(key: OnePagerSectionKey, locale: Locale): string {
  return ONE_PAGER_SECTIONS.find((s) => s.key === key)!.anchor[locale]
}

// Strona kontaktowa (dokument `page` w Sanity; slug zależy od języka)
export const CONTACT_PATH: Record<Locale, string> = { pl: '/kontakt', en: '/contact' }
