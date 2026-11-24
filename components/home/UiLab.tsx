'use client'

// components/home/UiLab.tsx
// Sesja UI przed iteracją 1 (brief, pkt 3.4 i 11): warianty --accent-ai, --accent-edit, fontu odręcznego
// i tła okna promptu na fragmentach z briefu. Narzędzie robocze — strona /{locale}/ui-lab działa tylko w dev.
// Po wyborze: wartości trafiają do styles/globals.css, font do styles/fonts/ (self-hosted), a ten plik znika.

import { useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import '@/lib/gsap-svg'
import { SplitText } from '@/lib/gsap-text'
import { DURATION, EASE, LOOP, STAGGER } from '@/lib/motion'
import type { Locale } from '@/lib/locales'

type Pair = { light: string; dark: string }
const COLOR_VARIANTS: { id: string; name: string; note: string; ai: Pair; edit: Pair }[] = [
  {
    id: 'A',
    name: 'Turkus + czerwień korektorska',
    note: 'Chłodny neon kontra ciepłe złoto marki. Czerwień jak długopis redaktora.',
    ai: { light: '#0b7f75', dark: '#3ee6d4' },
    edit: { light: '#c8102e', dark: '#ff5a5f' },
  },
  {
    id: 'B',
    name: 'Fiolet + pomarańcz korekty',
    note: 'Fiolet kojarzy się z „AI” w wielu interfejsach. Korekta cieplejsza, bliżej złota.',
    ai: { light: '#6d28d9', dark: '#b794ff' },
    edit: { light: '#c2410c', dark: '#ff7a45' },
  },
  {
    id: 'C',
    name: 'Zieleń terminala + czerwień ołówka',
    note: 'Najbardziej „kodowa”: zielony fosfor monitora. Czerwień głębsza.',
    ai: { light: '#0a7a3d', dark: '#4dff9a' },
    edit: { light: '#b3261e', dark: '#ff5449' },
  },
]

// Kontrast WCAG na tle strony (paper #fafaf8 / ink #0f0f0f) — wyliczony przy doborze, AA ≥ 4,5:1
const CONTRAST: Record<string, string> = {
  '#0b7f75': '4,67', '#3ee6d4': '12,30', '#c8102e': '5,63', '#ff5a5f': '6,28',
  '#6d28d9': '6,80', '#b794ff': '7,94', '#c2410c': '4,96', '#ff7a45': '7,41',
  '#0a7a3d': '5,20', '#4dff9a': '14,68', '#b3261e': '6,25', '#ff5449': '6,04',
}

const FONT_VARIANTS = [
  { id: 'caveat', name: 'Caveat', family: "'Caveat', cursive", size: '1.6rem', note: 'Szybkie pismo, czytelne; najbliżej notatki długopisem.' },
  { id: 'kalam', name: 'Kalam', family: "'Kalam', cursive", size: '1.3rem', note: 'Spokojniejsze, okrąglejsze; dobrze znosi małe rozmiary.' },
  { id: 'shadows', name: 'Shadows Into Light Two', family: "'Shadows Into Light Two', cursive", size: '1.4rem', note: 'Cienkie, swobodne; najbardziej „odręczne”.' },
] as const

const WINDOW_MODES = [
  { id: 'dark', name: 'Okno zawsze ciemne', note: 'Wygląda jak edytor kodu w obu motywach.' },
  { id: 'theme', name: 'Okno zgodne z motywem', note: 'W jasnym motywie jasne okno, w ciemnym ciemne.' },
] as const

const TEXT = {
  pl: {
    prompt: 'Zbuduj mi stronę dla mojej kancelarii.',
    last: '// Co ma przekonać Twojego klienta? Brak danych.',
    before: 'W dzisiejszym dynamicznym świecie oferujemy kompleksowe, innowacyjne rozwiązania szyte na miarę Twoich potrzeb.',
    note: 'Co konkretnie?',
    after: 'Prowadzimy sprawy spadkowe. Pierwsza konsultacja trwa godzinę i kończy się planem działania na piśmie.',
    cards: [['Decyzje', 'Ty i ja'], ['Kod', 'AI + ja']],
    step: ['04', 'Budowa z AI'],
  },
  en: {
    prompt: 'Build me a website for my law firm.',
    last: '// What should convince your client? No data.',
    before: "In today's fast-paced world, we offer comprehensive, innovative solutions tailored to your needs.",
    note: 'Meaning what?',
    after: 'We handle inheritance cases. The first consultation takes an hour and ends with a written action plan.',
    cards: [['Decisions', 'You and me'], ['Code', 'AI + me']],
    step: ['04', 'Building with AI'],
  },
} as const

// Przykładowy stream kodu (dekoracyjny)
const CODE = [
  'export default function Hero() {',
  '  return (',
  '    <section className="hero">',
  '      <h1>Kancelaria</h1>',
  '      <p>{lead}</p>',
  '      <Button href="/kontakt">Kontakt</Button>',
  '    </section>',
  '  )',
  '}',
]

function Option({ active, onClick, title, note }: { active: boolean; onClick: () => void; title: string; note: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left rounded-md border px-4 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
        active ? 'border-ink dark:border-paper bg-ink/5 dark:bg-white/10' : 'border-border dark:border-white/15 hover:border-muted'
      }`}
    >
      <span className="block text-sm font-medium">{title}</span>
      <span className="block text-xs text-muted mt-1">{note}</span>
    </button>
  )
}

export function UiLab({ locale }: { locale: Locale }) {
  const t = TEXT[locale]
  const [colorId, setColorId] = useState('A')
  const [fontId, setFontId] = useState<(typeof FONT_VARIANTS)[number]['id']>('caveat')
  const [windowMode, setWindowMode] = useState<(typeof WINDOW_MODES)[number]['id']>('dark')
  const [run, setRun] = useState(0)
  const scope = useRef<HTMLDivElement>(null)

  const color = COLOR_VARIANTS.find((c) => c.id === colorId)!
  const font = FONT_VARIANTS.find((f) => f.id === fontId)!

  // Animacja próbna (uproszczona wersja hero i demo redakcji) — odtwarzana po każdej zmianie wariantu
  useGSAP(
    () => {
      // Skreślenie po liniach tekstu: SplitText dzieli zdanie „przed” na linie, każda dostaje własną kreskę SVG
      // dokładnie na swoją szerokość (w iteracji 3 tak samo; linie przeliczane przy zmianie szerokości).
      const del = scope.current?.querySelector<HTMLElement>('[data-lab="before"]')
      if (del) {
        SplitText.create(del, {
          type: 'lines',
          linesClass: 'lab-line',
          aria: 'auto',
          autoSplit: true,
          onSplit: (self) => {
            self.lines.forEach((line, i) => {
              const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
              svg.setAttribute('class', 'lab-strike-svg')
              svg.setAttribute('viewBox', '0 0 100 10')
              svg.setAttribute('preserveAspectRatio', 'none')
              svg.setAttribute('aria-hidden', 'true')
              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
              path.setAttribute('d', i % 2 ? 'M0,6 C30,4 70,7 100,4' : 'M0,5 C35,7 65,3 100,6')
              path.setAttribute('class', 'lab-edit-stroke')
              path.setAttribute('data-lab', 'strike')
              path.setAttribute('fill', 'none')
              path.setAttribute('stroke-width', '2.2')
              path.setAttribute('stroke-linecap', 'round')
              path.setAttribute('vector-effect', 'non-scaling-stroke')
              svg.appendChild(path)
              line.appendChild(svg)
            })
          },
        })
      }

      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline()
        tl.from('[data-lab="prompt"]', { clipPath: 'inset(0 100% 0 0)', duration: 1.2, ease: 'steps(38)' })
          .from('[data-lab="code"]', { opacity: 0, x: -8, duration: DURATION.fast, stagger: STAGGER.code, ease: EASE.base })
          .from('[data-lab="last"]', { opacity: 0, duration: DURATION.slow, ease: 'power1.out' }, '+=0.4')
          .fromTo('[data-lab="strike"]', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7, ease: EASE.inOut, stagger: 0.25 }, 0.2)
          .from('[data-lab="note"]', { opacity: 0, rotation: 0, scale: 0.9, duration: DURATION.base, ease: EASE.base }, '>-0.1')
          .from('[data-lab="after"]', { opacity: 0, y: 8, duration: DURATION.base, ease: EASE.base }, '>')
        gsap.to('[data-lab="cursor"]', { opacity: 0, duration: LOOP.cursorBlink, ease: 'steps(1)', repeat: -1, yoyo: true })
      })
    },
    { scope, dependencies: [run, colorId, fontId, windowMode], revertOnUpdate: true },
  )

  const vars = {
    '--lab-ai-light': color.ai.light,
    '--lab-ai-dark': color.ai.dark,
    '--lab-edit-light': color.edit.light,
    '--lab-edit-dark': color.edit.dark,
    '--lab-hand': font.family,
    '--lab-hand-size': font.size,
  } as React.CSSProperties

  const windowClass =
    windowMode === 'dark'
      ? 'bg-[#161616] text-[#e9e9e4] lab-window-dark'
      : 'bg-[#f1f0ea] text-ink dark:bg-[#161616] dark:text-[#e9e9e4] lab-window-theme'

  return (
    <div className="max-w-5xl mx-auto px-6 py-16" style={vars}>
      {/* Fonty z Google tylko na tej roboczej stronie (dev); wybrany font trafi do styles/fonts/ jak pozostałe */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@500&family=Kalam:wght@400&family=Shadows+Into+Light+Two&display=swap&subset=latin-ext"
        precedence="default"
      />
      <style>{`
        .lab-ai { color: var(--lab-ai-light); } .dark .lab-ai { color: var(--lab-ai-dark); }
        .lab-edit { color: var(--lab-edit-light); } .dark .lab-edit { color: var(--lab-edit-dark); }
        .lab-edit-stroke { stroke: var(--lab-edit-light); } .dark .lab-edit-stroke { stroke: var(--lab-edit-dark); }
        .lab-window-dark .lab-ai { color: var(--lab-ai-dark); } .lab-window-dark .lab-edit { color: var(--lab-edit-dark); }
        .lab-line { position: relative; width: fit-content; }
        .lab-strike-svg { position: absolute; left: 0; right: 0; top: 50%; height: 10px; width: 100%; margin-top: -4px; overflow: visible; pointer-events: none; }
        .lab-hand { font-family: var(--lab-hand); font-size: var(--lab-hand-size); line-height: 1.1; }
        .lab-bg-ai { background: var(--lab-ai-light); } .dark .lab-bg-ai { background: var(--lab-ai-dark); }
        .lab-bg-edit { background: var(--lab-edit-light); } .dark .lab-bg-edit { background: var(--lab-edit-dark); }
      `}</style>

      <p className="text-xs uppercase tracking-widest text-muted">Sesja UI · tylko lokalnie</p>
      <h1 className="font-display font-light text-4xl md:text-5xl mt-2">Warianty kolorów i fontu odręcznego</h1>
      <p className="mt-4 text-muted max-w-2xl">
        Wybierz kombinację i przełącz motyw (ikona w nawigacji), żeby zobaczyć jasną i ciemną wersję. Kontrast podany na tle strony; wszystkie warianty spełniają WCAG AA (≥ 4,5:1).
      </p>

      <div className="mt-10 grid gap-8 md:grid-cols-3">
        <fieldset>
          <legend className="text-sm font-medium mb-3">Kolory</legend>
          <div className="grid gap-2">
            {COLOR_VARIANTS.map((c) => (
              <Option key={c.id} active={c.id === colorId} onClick={() => setColorId(c.id)} title={`${c.id}. ${c.name}`} note={c.note} />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium mb-3">Font odręczny (notatki redaktora)</legend>
          <div className="grid gap-2">
            {FONT_VARIANTS.map((f) => (
              <Option key={f.id} active={f.id === fontId} onClick={() => setFontId(f.id)} title={f.name} note={f.note} />
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm font-medium mb-3">Okno promptu</legend>
          <div className="grid gap-2">
            {WINDOW_MODES.map((w) => (
              <Option key={w.id} active={w.id === windowMode} onClick={() => setWindowMode(w.id)} title={w.name} note={w.note} />
            ))}
          </div>
          <button type="button" onClick={() => setRun((n) => n + 1)} className="mt-4 text-sm underline underline-offset-4">
            Odtwórz animację
          </button>
        </fieldset>
      </div>

      {/* Próbki kolorów z kontrastem */}
      <div className="mt-10 grid grid-cols-2 gap-4 text-xs font-mono">
        {(['ai', 'edit'] as const).map((k) => (
          <div key={k} className="flex items-center gap-3">
            <span className={`inline-block h-8 w-8 rounded ${k === 'ai' ? 'lab-bg-ai' : 'lab-bg-edit'}`} aria-hidden="true" />
            <span>
              --accent-{k}: {color[k].light} ({CONTRAST[color[k].light]}:1) / ciemny {color[k].dark} ({CONTRAST[color[k].dark]}:1)
            </span>
          </div>
        ))}
      </div>

      <div ref={scope} className="mt-12 grid gap-10 lg:grid-cols-2 items-start">
        {/* Hero: okno promptu */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Hero · okno promptu</p>
          <div className={`rounded-lg p-5 font-mono text-[13px] leading-6 shadow-sm ${windowClass}`} aria-hidden="true">
            <div className="flex gap-1.5 mb-4">
              <span className="h-2.5 w-2.5 rounded-full bg-current opacity-20" />
              <span className="h-2.5 w-2.5 rounded-full bg-current opacity-20" />
              <span className="h-2.5 w-2.5 rounded-full bg-current opacity-20" />
            </div>
            <p>
              <span className="opacity-50">&gt; </span>
              <span data-lab="prompt" className="inline-block">{t.prompt}</span>
            </p>
            <div className="mt-3">
              {CODE.map((line, i) => (
                <p key={i} data-lab="code" className="lab-ai whitespace-pre">
                  {line}
                </p>
              ))}
            </div>
            <p className="mt-3">
              <span data-lab="last" className="lab-edit">{t.last}</span>
              <span data-lab="cursor" className="inline-block w-[0.6em] h-[1.1em] align-text-bottom ml-1 bg-current" />
            </p>
          </div>
        </div>

        {/* Problem: demo redakcji */}
        <div>
          <p className="text-xs uppercase tracking-widest text-muted mb-3">Pusta strona · demo redakcji</p>
          <div className="relative rounded-lg border border-border dark:border-white/10 p-6 md:pr-36">
            <p className="text-lg leading-relaxed">
              <del data-lab="before" className="no-underline text-muted">{t.before}</del>
            </p>
            <p data-lab="note" className="lab-hand lab-edit mt-3 md:mt-0 md:absolute md:right-4 md:top-5 md:w-28 -rotate-3">
              {t.note}
            </p>
            <ins data-lab="after" className="block no-underline mt-4 text-lg leading-relaxed">
              {t.after}
            </ins>
          </div>

          {/* Sub-hero: karty i krok procesu */}
          <p className="text-xs uppercase tracking-widest text-muted mt-10 mb-3">Gdzie AI pomaga · Jak pracuję</p>
          <div className="grid grid-cols-2 gap-4">
            {t.cards.map(([title, who], i) => (
              <div key={title} className="rounded-lg border border-border dark:border-white/10 p-4">
                <p className="font-display text-2xl">{title}</p>
                <p className={`mt-2 text-xs uppercase tracking-widest font-mono ${i === 1 ? 'lab-ai' : ''}`}>{who}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-baseline gap-4">
            <span className="font-mono text-sm lab-ai">{t.step[0]}</span>
            <span className="font-display text-2xl">{t.step[1]}</span>
          </div>
          <svg className="mt-1 h-3 w-48 overflow-visible" viewBox="0 0 200 12" aria-hidden="true">
            <path className="lab-edit-stroke" d="M2,8 C50,3 120,11 198,5" fill="none" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  )
}
