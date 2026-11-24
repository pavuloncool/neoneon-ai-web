// lib/motion.ts
// Parametry ruchu one-pagera w jednym miejscu (brief, pkt 3.2: poziom energii +2 w skali −5…+5).
// Po review regulujemy tempo i amplitudę tutaj, bez przebudowy sekcji.
// Zasady: animujemy tylko transform, opacity, clip-path i SVG stroke; bez bounce/elastic;
// pinowanie tylko w „Gdzie AI pomaga” i „Jak pracuję”, wyłącznie na desktopie.

// Warunki gsap.matchMedia() — każda sekcja korzysta z tych trzech
export const MEDIA = {
  desktop: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  mobile: '(max-width: 1023px) and (prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const

export type MediaConditions = { [K in keyof typeof MEDIA]: boolean }

export const EASE = {
  base: 'power3.out', // domyślny
  heading: 'expo.out', // wejścia nagłówków
  inOut: 'power2.inOut', // skreślenia, akordeon
  slot: 'power3.inOut', // rotujące słowo („Dla kogo”)
} as const

// Czasy w sekundach (zakres briefu: 0,4–1,2 s)
export const DURATION = {
  fast: 0.4,
  base: 0.6,
  heading: 0.9,
  slow: 1.1,
  reduceFade: 0.3, // jedyny ruch przy prefers-reduced-motion: krótkie przejście opacity
} as const

export const STAGGER = {
  lines: 0.08, // linie podtytułu (SplitText)
  code: 0.06, // linie „kodu” w oknie promptu
  words: 0.03, // zdanie „po” w demo redakcji
  cards: 0.12, // karty usług
  cardsTight: 0.1, // wyceny, blog
  bars: 0.05, // paski godzin
  gaps: 0.15, // „dwie luki”
} as const

// Wejścia: przesunięcie startowe
export const OFFSET = {
  card: 40, // px, y: 40 → 0
  hoverLift: -4, // px, karta na hover
  hoverArrow: 6, // px, strzałka w CTA
} as const

// Sekcje przypięte (desktop)
export const PIN = {
  subHeroEnd: '+=150%',
  subHeroScrub: 0.6,
  processScrub: 1,
} as const

// Pętle i rotacje
export const LOOP = {
  cursorBlink: 0.5, // s, steps(1)
  editDemoRotate: 6, // s, warianty demo redakcji
  slotInterval: 2.2, // s, rotujące słowo
} as const

// Start animacji wejścia przy scrollu
export const TRIGGER_START = {
  default: 'top 80%',
  editDemo: 'top 65%',
} as const
