'use client'

// components/home/Hero.tsx
// Hero one-pagera (brief 5.1): „prompt, który się zatrzymuje”.
// Po lewej H1, podtytuł, lead i CTA; po prawej (desktop) albo pod spodem (mobile) okno promptu.
//
// SEO/LCP: H1, eyebrow, lead i CTA są widoczne od pierwszego malowania — nie animujemy ich.
// Ukryte do startu animacji są tylko: podtytuł (wchodzi liniami spod maski) i treść okna promptu
// (dekoracyjna, aria-hidden). Stan startowy ustawia CSS pod html.js (styles/globals.css, „Hero one-pagera”);
// siatka bezpieczeństwa (app/[locale]/layout.tsx) pokazuje wszystko, jeśli GSAP nie wystartuje w 3 s.
// Brak CLS: pełna treść okna jest w DOM od początku; pisanie znak po znaku odbywa się w warstwie nad
// niewidoczną kopią tekstu, więc wysokość linii nie zmienia się w trakcie.
//
// Timeline (desktop i mobile): podtytuł liniami → kursor miga → prompt się wpisuje → szybki stream kodu
// (--accent-ai, ScrambleText na początku linii) → pauza → wolna ostatnia linia (--accent-edit), kursor
// przestaje migać po „Brak danych.” i zostaje. Desktop: przy scrollu okno lekko się oddala (scrub).
// Mobile: krótszy stream (4 linie), bez efektu scrollu. Reduce: statyczne okno z pełną treścią.

import { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { gsap, motionEnabled, markMotionReady } from '@/lib/gsap'
import { SplitText } from '@/lib/gsap-text'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { DURATION, EASE, LOOP, STAGGER } from '@/lib/motion'

export interface HeroTexts {
  eyebrow: string
  title: string
  subtitle: string
  lead: string
  ctaPrimary: string
  ctaSecondary: string
  prompt: string
  lastLine: string
}

// Stream kodu (dekoracyjny). Nazwy pól neutralne językowo; zmienia się tylko adres kontaktu.
function codeLines(contactHref: string) {
  const desktop = [
    'export default function Hero({ firm }) {',
    '  return (',
    '    <section className="hero">',
    '      <h1>{firm.name}</h1>',
    '      <p className="lead">{firm.tagline}</p>',
    `      <a className="cta" href="${contactHref}">{firm.cta}</a>`,
    '    </section>',
    '  )',
    '}',
  ]
  const mobile = ['<section className="hero">', '  <h1>{firm.name}</h1>', '  <p>{firm.tagline}</p>', '</section>']
  return { desktop, mobile }
}

// Linia kodu: wcięcie, „głowa” (pierwsze znaki — ScrambleText) i reszta
function CodeLine({ line, variant }: { line: string; variant: 'desktop' | 'mobile' }) {
  const indent = line.match(/^\s*/)![0]
  const head = line.slice(indent.length, indent.length + 4)
  const rest = line.slice(indent.length + 4)
  return (
    <span data-hero-line={variant} className={`whitespace-pre ${variant === 'desktop' ? 'hidden lg:block' : 'block lg:hidden'}`}>
      {indent}
      <span data-hero-head>{head}</span>
      {rest}
    </span>
  )
}

// Tekst „pisany”: niewidoczna kopia trzyma wymiary, warstwa nad nią dostaje kolejne znaki, kursor za nią
function TypedText({ text, id, cursor }: { text: string; id: string; cursor?: boolean }) {
  return (
    <span className="relative inline-grid align-top">
      <span className="invisible col-start-1 row-start-1">{text}</span>
      <span className="col-start-1 row-start-1">
        <span data-hero-typed={id}>{text}</span>
        {cursor ? <span data-hero-cursor={id} className="hero-cursor" /> : null}
      </span>
    </span>
  )
}

export function Hero({ id, texts, contactHref, processHref }: { id: string; texts: HeroTexts; contactHref: string; processHref: string }) {
  const root = useRef<HTMLElement>(null)
  const { desktop, mobile } = codeLines(contactHref)

  useSectionMotion(root, ({ desktop: isDesktop, reduce }) => {
    const el = root.current
    if (!el) return
    const finish = () => el.setAttribute('data-hero-done', '')

    // Siatka bezpieczeństwa już zadziałała albo użytkownik ogranicza ruch — stan końcowy bez animacji
    if (!motionEnabled() || reduce) {
      finish()
      markMotionReady()
      return
    }

    const q = gsap.utils.selector(el)
    const windowEl = q('[data-hero-window]')[0] as HTMLElement
    const subtitle = q('[data-hero-subtitle]')[0] as HTMLElement
    const prompt = q('[data-hero-typed="prompt"]')[0] as HTMLElement
    const last = q('[data-hero-typed="last"]')[0] as HTMLElement
    const cursorPrompt = q('[data-hero-cursor="prompt"]')[0] as HTMLElement
    const cursorLast = q('[data-hero-cursor="last"]')[0] as HTMLElement
    const lines = q(`[data-hero-line="${isDesktop ? 'desktop' : 'mobile'}"]`) as HTMLElement[]
    const heads = lines.map((l) => l.querySelector<HTMLElement>('[data-hero-head]')!)

    // Pisanie znak po znaku: licznik → podciąg tekstu (warstwa nad niewidoczną kopią)
    const typeText = (target: HTMLElement, text: string, duration: number) => {
      const state = { n: 0 }
      return gsap.to(state, {
        n: text.length,
        duration,
        ease: 'none',
        onStart: () => {
          target.textContent = ''
        },
        onUpdate: () => {
          target.textContent = text.slice(0, Math.round(state.n))
        },
      })
    }

    // Podtytuł: linie spod maski (SplitText z aria: czytnik dostaje pełne zdanie)
    const split = SplitText.create(subtitle, { type: 'lines', mask: 'lines', aria: 'auto', autoSplit: true })

    // Stan startowy elementów okna (CSS ukrywał je do tej pory pod html.js) — przejmuje GSAP
    gsap.set([prompt, last], { opacity: 1 })
    prompt.textContent = ''
    last.textContent = ''
    gsap.set(lines, { opacity: 0, x: -6 })
    gsap.set(cursorLast, { opacity: 0 })
    el.setAttribute('data-hero-done', '') // od teraz stan elementów trzyma GSAP, nie CSS

    const tl = gsap.timeline({ defaults: { ease: EASE.base } })
    tl.from(split.lines, { yPercent: 100, duration: DURATION.heading, stagger: STAGGER.lines, ease: EASE.heading }, 0)
      // 1. kursor miga (0,5 s), 2. prompt się wpisuje (ok. 1,2 s)
      .to(cursorPrompt, { opacity: 0, duration: LOOP.cursorBlink / 2, ease: 'steps(1)', repeat: 1, yoyo: true }, 0.2)
      .add(typeText(prompt, texts.prompt, 1.2), '>')
      .set(cursorPrompt, { opacity: 0 }, '+=0.15')
      // 3. stream kodu: szybko, ScrambleText na pierwszych znakach linii
      .to(lines, { opacity: 1, x: 0, duration: DURATION.fast, stagger: STAGGER.code }, '<')
      .addLabel('stream', '<')
    heads.forEach((head, i) => {
      tl.to(
        head,
        { duration: DURATION.fast, scrambleText: { text: head.textContent ?? '', chars: 'upperAndLowerCase', revealDelay: 0.1 } },
        `stream+=${i * STAGGER.code}`,
      )
    })
    tl
      // 4. pauza 0,4 s → ostatnia linia wolno, kursor miga, a po „Brak danych.” staje i zostaje
      .set(cursorLast, { opacity: 1 }, '+=0.4')
      .add(typeText(last, texts.lastLine, 1.6))

    const blink = gsap.to(cursorLast, { opacity: 0, duration: LOOP.cursorBlink / 2, ease: 'steps(1)', repeat: -1, yoyo: true, paused: true })
    tl.call(() => blink.play(), [], '<').call(() => {
      blink.kill()
      gsap.set(cursorLast, { opacity: 1 })
    })

    markMotionReady()

    // 5. Desktop: okno lekko się oddala przy scrollu
    if (isDesktop) {
      gsap.to(windowEl, {
        scale: 0.96,
        opacity: 0.6,
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      })
    }

    return () => {
      blink.kill()
      // Treść okna wraca do pełnej (np. przy przejściu desktop ↔ mobile albo na reduce)
      prompt.textContent = texts.prompt
      last.textContent = texts.lastLine
      ScrollTrigger.refresh()
    }
  })

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} data-home-hero className="scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{texts.eyebrow}</p>
          <h1 id={`${id}-title`} className="mt-5 font-display font-light text-5xl md:text-6xl xl:text-7xl leading-[1.05]">
            {texts.title}
          </h1>
          <p data-hero-subtitle className="mt-6 font-display italic font-light text-2xl md:text-3xl leading-snug">
            {texts.subtitle}
          </p>
          <p className="mt-6 text-lg leading-relaxed text-muted max-w-xl">{texts.lead}</p>
          <div className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Link
              href={contactHref}
              className="group inline-flex items-center gap-2 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink px-6 py-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {texts.ctaPrimary}
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </Link>
            <a
              href={processHref}
              className="group inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 decoration-border hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {texts.ctaSecondary}
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-0.5">↓</span>
            </a>
          </div>
        </div>

        {/* Okno promptu — dekoracja (aria-hidden), zawsze ciemne (.surface-dark: kolory z ciemnego motywu) */}
        <div
          data-hero-window
          aria-hidden="true"
          className="surface-dark rounded-xl bg-[#161616] text-[#e9e9e4] shadow-[0_20px_60px_-25px_rgba(0,0,0,0.45)] ring-1 ring-black/5 dark:ring-white/10 font-mono text-[12.5px] sm:text-[13px] leading-6 origin-center"
        >
          <div className="flex items-center gap-1.5 border-b border-white/10 px-5 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          </div>
          <div className="px-5 py-5 overflow-x-auto">
            <p className="flex gap-2">
              <span className="opacity-50 select-none">&gt;</span>
              <TypedText text={texts.prompt} id="prompt" cursor />
            </p>
            <div data-hero-code className="mt-4 text-accent-ai">
              {desktop.map((line, i) => (
                <CodeLine key={`d${i}`} line={line} variant="desktop" />
              ))}
              {mobile.map((line, i) => (
                <CodeLine key={`m${i}`} line={line} variant="mobile" />
              ))}
            </div>
            <p className="mt-4 text-accent-edit">
              <TypedText text={texts.lastLine} id="last" cursor />
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
