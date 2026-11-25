// Etykiety koła i mapy w obu językach (kierunek „Sygnał”). Treści sekcji są w komponentach i Sanity —
// tu tylko stałe elementy interfejsu.

import type { Locale } from '@/lib/locales'
import type { DialLabels } from './SignalDial'
import type { MapLabels } from './SignalMap'

export const DIAL_LABELS: Record<Locale, DialLabels> = {
  pl: { nav: 'Spis strony', open: 'Otwórz spis strony', now: 'Teraz' },
  en: { nav: 'Site contents', open: 'Open site contents', now: 'Now' },
}

export const MAP_LABELS: Record<Locale, MapLabels> = {
  pl: {
    dialog: 'Spis strony',
    list: '☰ Lista',
    wheel: '◎ Koło',
    close: 'Esc · Zamknij',
    here: 'Tu jesteś',
    talk: 'Rozmowa',
    talkCta: 'Umów rozmowę →',
    keys: 'Tab — pozycje · ← → — obrót · Enter — przejdź · Esc — zamknij',
  },
  en: {
    dialog: 'Site contents',
    list: '☰ List',
    wheel: '◎ Wheel',
    close: 'Esc · Close',
    here: 'You are here',
    talk: 'Talk',
    talkCta: 'Book a call →',
    keys: 'Tab — items · ← → — rotate · Enter — go · Esc — close',
  },
}

// Podpis przy zadokowanym kole i inne drobne teksty chrome'u strony
export const CHROME_LABELS: Record<Locale, { contents: string; search: string; searchPlaceholder: string; allArticles: string; fromBlog: string; cta: string; footerNav: string; footerTalk: string; footerLegal: string; language: string; skip: string }> = {
  pl: {
    contents: 'spis strony',
    search: 'Szukaj w serwisie',
    searchPlaceholder: 'np. landing page, cennik, AI',
    allArticles: 'Wszystkie artykuły →',
    fromBlog: 'Blog',
    cta: 'Umów rozmowę',
    footerNav: 'Na stronie',
    footerTalk: 'Rozmowa',
    footerLegal: 'Prawo',
    language: 'Język',
    skip: 'Przejdź do treści',
  },
  en: {
    contents: 'site contents',
    search: 'Search the site',
    searchPlaceholder: 'e.g. landing page, pricing, AI',
    allArticles: 'All articles →',
    fromBlog: 'Blog',
    cta: 'Book a call',
    footerNav: 'On this site',
    footerTalk: 'Talk',
    footerLegal: 'Legal',
    language: 'Language',
    skip: 'Skip to content',
  },
}
