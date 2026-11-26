// components/sygnal/home/types.ts
// Kształty tekstów i danych sekcji strony głównej (teksty: Sanity „Strona główna — teksty” → onePager; dane: Sanity).

export interface AiRoleCard {
  title: string
  text: string
  who: string
}

export interface ServiceItem {
  key: 'copy' | 'website' | 'content'
  title: string
  tags: string[]
  text: string
  points: string[]
  cta: string
  href: string
}

export interface ProcessStep {
  title: string
  text: string
}

export interface ProblemTexts {
  title: string
  lead: string
  before: string
  note: string
  after: string[]
  caption: string
  gaps: { title: string; text: string }[]
  closing: string
  cta: string
}

export interface AudienceTexts {
  title: string
  lead: string
  industries: string[]
  rest: string
  text: string
}

export interface PricingCard {
  id: string
  title: string
  summary: string | null
  hoursLabel: string
  // Kwota: tekst przed / między / po liczbach i same liczby; null = tylko godziny
  total: { before: string; between: string; after: string; min: number; max: number } | null
  missingRates: string[]
  items: { key: string; task: string; hoursLabel: string; minPct: number; maxPct: number }[]
}

export interface PricingTexts {
  title: string
  lead: string
  ratesLine: string | null
  note: string
  cta: string
  devEmpty: string
}

export interface AboutTexts {
  eyebrow: string
  title: string
  paragraphs: string[]
  strike: string // fragment akapitu do skreślenia
  facts: string
  link: string
  portraitAlt: string
}

export interface FaqItemView {
  id: string
  question: string
  answer: string
}
