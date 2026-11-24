'use client'

// components/home/Problem.tsx
// Problem (brief 5.3): „Najtrudniejszy moment to pusta strona” — główny efekt strony, „redakcja na żywo”.
//
// Demo redakcji: zdanie „przed” (<del>) zostaje skreślone kreską SVG (DrawSVG, --accent-edit), na marginesie
// wpisuje się odręczna notatka, pod spodem wchodzi zdanie „po” (<ins>) słowo po słowie.
// Desktop: warianty „po” (kancelaria, szkoła jogi, wydawnictwo) zmieniają się co ok. 6 s — kreska się zwija
// (DrawSVG 100% → 100% 100%), stare słowa gasną, kreska rysuje się od nowa, wchodzą nowe słowa.
// Rotacja działa tylko, gdy sekcja jest na ekranie. Mobile: jeden wariant (kancelaria), bez rotacji.
// Reduce / bez JS: statyczne <del> (przekreślenie CSS w --accent-edit) i <ins>, bez animacji.
//
// Brak CLS: warianty „po” leżą w jednej komórce siatki — wysokość = najdłuższy wariant, stała przez
// cały czas (dlatego zamiana bez Flip: nie ma zmiany układu do animowania).
// Kreska: SplitText dzieli „przed” na linie (autoSplit przelicza je przy zmianie szerokości), każda linia
// dostaje własną ścieżkę SVG. Postęp kreski trzyma obiekt `strike` (start/koniec 0–1 dla całego zdania),
// więc po ponownym podziale linii nowe ścieżki od razu dostają bieżący stan.

import { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { gsap, motionEnabled, markMotionReady } from '@/lib/gsap'
import { SplitText } from '@/lib/gsap-text'
import '@/lib/gsap-svg'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { DURATION, EASE, LOOP, STAGGER, TRIGGER_START } from '@/lib/motion'

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

const SVG_NS = 'http://www.w3.org/2000/svg'
const STRIKE_PATHS = ['M0,5 C30,7 65,3 100,5.5', 'M0,6 C35,4 70,7 100,4.5']

export function Problem({ id, texts, contactHref }: { id: string; texts: ProblemTexts; contactHref: string }) {
  const root = useRef<HTMLElement>(null)

  useSectionMotion(root, ({ desktop, reduce }) => {
    const el = root.current
    if (!el) return
    const finish = () => el.setAttribute('data-problem-done', '')

    if (!motionEnabled() || reduce) {
      finish()
      markMotionReady()
      return
    }

    const q = gsap.utils.selector(el)
    const before = q('[data-problem-before]')[0] as HTMLElement
    const note = q('[data-problem-note]')[0] as HTMLElement
    const noteTyped = q('[data-problem-note-typed]')[0] as HTMLElement
    const afters = (q('[data-problem-after]') as HTMLElement[]).slice(0, desktop ? texts.after.length : 1)
    const gapItems = q('[data-problem-gap]') as HTMLElement[]

    // ── Kreska skreślenia: stan dla całego zdania, rozkładany na linie po kolei
    const strike = { start: 0, end: 0 }
    let paths: SVGPathElement[] = []
    const clamp = gsap.utils.clamp(0, 1)
    const applyStrike = () => {
      const n = paths.length
      paths.forEach((p, i) => {
        const s = clamp(strike.start * n - i) * 100
        const e = clamp(strike.end * n - i) * 100
        gsap.set(p, { drawSVG: `${s}% ${e}%` })
      })
    }

    SplitText.create(before, {
      type: 'lines',
      linesClass: 'problem-line',
      aria: 'auto',
      autoSplit: true,
      onSplit: (self) => {
        paths = self.lines.map((line, i) => {
          const svg = document.createElementNS(SVG_NS, 'svg')
          svg.setAttribute('class', 'problem-strike')
          svg.setAttribute('viewBox', '0 0 100 10')
          svg.setAttribute('preserveAspectRatio', 'none')
          svg.setAttribute('aria-hidden', 'true')
          const path = document.createElementNS(SVG_NS, 'path')
          path.setAttribute('d', STRIKE_PATHS[i % STRIKE_PATHS.length])
          path.setAttribute('vector-effect', 'non-scaling-stroke')
          svg.appendChild(path)
          line.appendChild(svg)
          return path
        })
        applyStrike()
      },
    })

    // ── Zdania „po”: słowa (każdy wariant osobno)
    const words = afters.map((a) => SplitText.create(a, { type: 'words', aria: 'auto' }).words as HTMLElement[])

    // Stan startowy przejmuje GSAP (CSS ukrywał elementy pod html.js do tej pory)
    gsap.set(afters, { autoAlpha: 0 })
    gsap.set(afters[0], { autoAlpha: 1 })
    gsap.set(words.flat(), { opacity: 0, y: 8 })
    gsap.set(note, { opacity: 1 })
    noteTyped.textContent = ''
    gsap.set(gapItems.map((g) => g.querySelectorAll('[data-problem-gap-anim]')), { opacity: 0, x: -24 })
    el.classList.add('problem-animated') // CSS: bez przekreślenia tekstowego, kreskę rysuje SVG
    finish()
    markMotionReady()

    const drawStrike = (vars: gsap.TweenVars = {}) =>
      gsap.fromTo(strike, { start: 0, end: 0 }, { end: 1, duration: 0.7, ease: EASE.inOut, onUpdate: applyStrike, ...vars })
    const retractStrike = () => gsap.to(strike, { start: 1, duration: 0.5, ease: EASE.inOut, onUpdate: applyStrike })
    const wordsIn = (i: number) =>
      gsap.fromTo(words[i], { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: DURATION.fast, stagger: STAGGER.words, ease: EASE.base })
    const typeNote = () => {
      const state = { n: 0 }
      return gsap.to(state, {
        n: texts.note.length,
        duration: 0.6,
        ease: 'none',
        onUpdate: () => {
          noteTyped.textContent = texts.note.slice(0, Math.round(state.n))
        },
      })
    }

    // ── Rotacja wariantów (desktop): pętla zatrzymywana poza ekranem
    let loop: gsap.core.Timeline | null = null
    if (desktop && afters.length > 1) {
      loop = gsap.timeline({ repeat: -1, paused: true })
      afters.forEach((_, i) => {
        const next = (i + 1) % afters.length
        loop!
          .add(retractStrike(), `+=${LOOP.editDemoRotate}`)
          .to(words[i], { opacity: 0, duration: 0.3, stagger: 0.01, ease: 'power1.in' }, '<')
          .set(afters[i], { autoAlpha: 0 })
          .set(afters[next], { autoAlpha: 1 })
          .add(drawStrike())
          .add(wordsIn(next), '-=0.2')
      })
    }

    // ── Wejście: skreślenie → notatka → zdanie „po”, potem rotacja
    const intro = gsap.timeline({ paused: true })
    intro
      .add(drawStrike({ delay: 0.2 }))
      .add(typeNote(), '-=0.1')
      .add(wordsIn(0), '-=0.1')
      .call(() => loop?.play())

    ScrollTrigger.create({ trigger: q('[data-problem-demo]')[0], start: TRIGGER_START.editDemo, once: true, onEnter: () => intro.play() })
    if (loop) {
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
          if (intro.progress() < 1) return
          if (self.isActive) loop!.resume()
          else loop!.pause()
        },
      })
    }

    // ── Dwie luki: numer i krótka linia wchodzą z lewej
    ScrollTrigger.create({
      trigger: q('[data-problem-gaps]')[0],
      start: TRIGGER_START.default,
      once: true,
      onEnter: () =>
        gsap.to(
          gapItems.map((g) => g.querySelectorAll('[data-problem-gap-anim]')),
          { opacity: 1, x: 0, duration: DURATION.base, stagger: STAGGER.gaps, ease: EASE.base },
        ),
    })

    return () => {
      el.classList.remove('problem-animated')
      noteTyped.textContent = texts.note
    }
  })

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} data-problem className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <h2 id={`${id}-title`} className="font-display font-light text-4xl md:text-5xl leading-tight max-w-3xl">
          {texts.title}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-muted max-w-3xl">{texts.lead}</p>

        {/* Demo redakcji: kartka z marginesem na notatkę */}
        <figure data-problem-demo className="mt-12 rounded-xl border border-border dark:border-white/10 bg-white/60 dark:bg-[#141414] p-6 md:p-10">
          {/* Kolejność w DOM: „przed” → notatka → „po” (tak czyta czytnik i tak układa się mobile);
              na desktopie notatka przechodzi na margines obok zdania „przed”. */}
          <div className="grid gap-x-10 lg:grid-cols-[1fr_11rem]">
            <p className="text-xl md:text-2xl leading-relaxed text-muted lg:col-start-1 lg:row-start-1">
              <del data-problem-before className="problem-del">
                {texts.before}
              </del>
            </p>
            {/* Notatka na marginesie: niewidoczna kopia trzyma wymiary, warstwa nad nią „pisze” */}
            <p data-problem-note className="mt-5 lg:mt-1 font-hand text-accent-edit text-3xl leading-none -rotate-3 origin-left lg:col-start-2 lg:row-start-1">
              <span className="relative inline-grid">
                <span className="invisible col-start-1 row-start-1">{texts.note}</span>
                <span data-problem-note-typed className="col-start-1 row-start-1">
                  {texts.note}
                </span>
              </span>
            </p>
            <div className="mt-6 grid lg:col-start-1 lg:row-start-2">
              {texts.after.map((text, i) => (
                <ins
                  key={i}
                  data-problem-after={i}
                  aria-hidden={i > 0 ? true : undefined}
                  className={`col-start-1 row-start-1 block no-underline text-xl md:text-2xl leading-relaxed ${i > 0 ? 'max-lg:hidden invisible' : ''}`}
                >
                  {text}
                </ins>
              ))}
            </div>
          </div>
          <figcaption className="mt-8 text-xs text-muted">{texts.caption}</figcaption>
        </figure>

        {/* Dwie luki */}
        <ul data-problem-gaps className="mt-16 grid gap-10 md:grid-cols-2">
          {texts.gaps.map((gap, i) => (
            <li key={gap.title} data-problem-gap>
              <div className="flex items-center gap-4">
                <span data-problem-gap-anim className="font-mono text-lg leading-none text-accent-edit">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span data-problem-gap-anim aria-hidden="true" className="h-px w-12 bg-current opacity-40" />
              </div>
              <h3 className="mt-4 font-display text-3xl">{gap.title}</h3>
              <p className="mt-2 text-[17px] leading-relaxed text-muted">{gap.text}</p>
            </li>
          ))}
        </ul>

        <p className="mt-16 text-xl md:text-2xl leading-relaxed max-w-3xl">{texts.closing}</p>
        <Link
          href={contactHref}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink px-6 py-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {texts.cta}
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </Link>
      </div>
    </section>
  )
}
