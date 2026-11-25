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

// Strona główna: etykiety sekcji w kole i mapie (klucze = ONE_PAGER_SECTIONS w lib/onePager.ts)
// oraz drobne podpisy sekcji „Sygnał”
export const HOME_LABELS: Record<Locale, { sections: Record<string, string>; group: { audience: string; talk: string }; stage: string; who: string }> = {
  pl: {
    sections: {
      hero: 'Start',
      aiRole: 'Rola AI',
      problem: 'Pusta strona',
      audience: 'Dla kogo',
      services: 'Usługi',
      process: 'Proces',
      pricing: 'Cennik',
      about: 'O mnie',
      faq: 'FAQ',
      blog: 'Z bloga',
      cta: 'Rozmowa',
    },
    group: { audience: 'Dla kogo', talk: 'Rozmowa' },
    stage: 'Etap',
    who: 'Kto',
  },
  en: {
    sections: {
      hero: 'Start',
      aiRole: 'Role of AI',
      problem: 'Blank page',
      audience: 'Who it’s for',
      services: 'Services',
      process: 'Process',
      pricing: 'Pricing',
      about: 'About',
      faq: 'FAQ',
      blog: 'From the blog',
      cta: 'Talk',
    },
    group: { audience: 'Who it’s for', talk: 'Talk' },
    stage: 'Stage',
    who: 'Who',
  },
}
