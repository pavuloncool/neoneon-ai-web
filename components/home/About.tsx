'use client'

// components/home/About.tsx
// O mnie (brief 5.8 w wersji z aktualizacji): nie CV — problem klienta → sposób pracy → cel → jedna linijka faktów.
// Portret odsłania się od dołu (clip-path inset(100% 0 0 0) → inset(0), 1,1 s, expo.out), wokół rysują się
// DrawSVG znaczniki cięcia jak na korekcie drukarskiej (cztery narożniki). Tekst: SplitText po liniach z maską,
// stagger 0,06 s. Jedyny efekt związany z treścią: w akapicie 4 fragment „wypełnić stronę” / „fill a website”
// zostaje skreślony (wspólny komponent z „Pustej strony”, lib/strike.ts), raz, przy wejściu akapitu.
// Skreślony fragment zostaje w DOM i jest czytelny (zwykły <span>, nie <del> — treść zdania się nie zmienia).
// Mobile: to samo. Reduce / bez JS: statycznie, skreślenie narysowane (przekreślenie CSS).

import { Fragment, useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { gsap, motionEnabled, markMotionReady } from '@/lib/gsap'
import { SplitText } from '@/lib/gsap-text'
import '@/lib/gsap-svg'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { createStrike } from '@/lib/strike'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { DURATION, EASE, STAGGER, STRIKE, TRIGGER_START } from '@/lib/motion'
import type { AboutData } from '@/lib/queries'

export interface AboutTexts {
  eyebrow: string
  title: string
  paragraphs: string[]
  strike: string // fragment akapitu 4 do skreślenia
  facts: string
  link: string
  portraitAlt: string
}

const STRIKE_PARAGRAPH = 3 // akapit 4 (indeks od 0)

// Znacznik cięcia w narożniku: dwie krótkie kreski odsunięte od rogu (SVG 24×24 przy rogu portretu)
const CORNERS = [
  { pos: '-left-6 -top-6', d: 'M0,18 H11 M18,0 V11' },
  { pos: '-right-6 -top-6', d: 'M24,18 H13 M6,0 V11' },
  { pos: '-left-6 -bottom-6', d: 'M0,6 H11 M18,24 V13' },
  { pos: '-right-6 -bottom-6', d: 'M24,6 H13 M6,24 V13' },
]

// Akapit z fragmentem do skreślenia: tekst przed — <span class="edit-strike"> — tekst po
function WithStrike({ text, fragment }: { text: string; fragment: string }) {
  const at = text.indexOf(fragment)
  if (at < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <span data-about-strike className="edit-strike">
        {fragment}
      </span>
      {text.slice(at + fragment.length)}
    </>
  )
}

export function About({ id, texts, portrait, postHref }: { id: string; texts: AboutTexts; portrait: AboutData['portrait']; postHref: string | null }) {
  const root = useRef<HTMLElement>(null)

  useSectionMotion(root, ({ reduce }) => {
    const el = root.current
    if (!el) return
    const finish = () => el.setAttribute('data-about-done', '')
    if (!motionEnabled() || reduce) {
      finish()
      markMotionReady()
      return
    }

    const photo = el.querySelector<HTMLElement>('[data-about-photo]')
    const marks = gsap.utils.toArray<SVGPathElement>('[data-about-mark]', el)
    const paragraphs = gsap.utils.toArray<HTMLElement>('[data-about-p]', el)
    const strikeWrap = el.querySelector<HTMLElement>('[data-about-strike-wrap]')!
    const splits = paragraphs.map((p) => SplitText.create(p, { type: 'lines', mask: 'lines', aria: 'auto', autoSplit: true }))
    const lines = () => splits.flatMap((s) => s.lines)

    // Skreślenie: części fragmentu po podziale na linie czytane przy każdym przeliczeniu
    const strike = createStrike(() => gsap.utils.toArray<HTMLElement>('[data-about-strike]', strikeWrap), strikeWrap)

    if (photo) gsap.set(photo, { clipPath: 'inset(100% 0 0 0)' })
    gsap.set(marks, { drawSVG: '0%' })
    gsap.set(lines(), { yPercent: 100 })
    finish()
    markMotionReady()

    const reveal = gsap.timeline({ paused: true })
    if (photo) reveal.to(photo, { clipPath: 'inset(0% 0 0 0)', duration: DURATION.slow, ease: EASE.heading }, 0)
    reveal
      .to(marks, { drawSVG: '100%', duration: DURATION.base, stagger: 0.08, ease: EASE.inOut }, 0.5)
      .to(lines(), { yPercent: 0, duration: DURATION.heading, stagger: STAGGER.code, ease: EASE.heading }, 0.15)

    ScrollTrigger.create({
      trigger: el.querySelector('[data-about-grid]'),
      start: TRIGGER_START.default,
      once: true,
      onEnter: () => reveal.play(),
    })

    // Skreślenie raz, przy wejściu akapitu 4 — dopiero gdy jego linie już stoją na miejscu
    ScrollTrigger.create({
      trigger: strikeWrap,
      start: STRIKE.aboutStart,
      once: true,
      onEnter: () => {
        const run = () => strike.draw()
        if (reveal.progress() < 1) reveal.eventCallback('onComplete', run)
        else run()
      },
    })

    return () => strike.destroy()
  })

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} data-about className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div data-about-grid className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 items-start">
        {portrait ? (
          <figure className="relative mx-6 mt-6 max-w-sm">
            <div data-about-photo className="overflow-hidden rounded-sm">
              <Image
                src={portrait.url}
                alt={portrait.alt ?? texts.portraitAlt}
                width={portrait.width}
                height={portrait.height}
                sizes="(min-width: 768px) 24rem, 90vw"
                placeholder={portrait.lqip ? 'blur' : 'empty'}
                blurDataURL={portrait.lqip ?? undefined}
                className="block h-auto w-full"
              />
            </div>
            {/* Znaczniki cięcia (dekoracja) */}
            {CORNERS.map((c, i) => (
              <svg key={i} aria-hidden="true" viewBox="0 0 24 24" className={`absolute h-6 w-6 overflow-visible ${c.pos}`}>
                <path data-about-mark d={c.d} fill="none" stroke="var(--accent-edit)" strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            ))}
          </figure>
        ) : null}

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{texts.eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-4 font-display font-light text-4xl md:text-5xl leading-tight">
            {texts.title}
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed">
            {texts.paragraphs.map((text, i) => (
              <Fragment key={i}>
                {i === STRIKE_PARAGRAPH ? (
                  // Nakładka kreski leży w opakowaniu, nie w akapicie dzielonym przez SplitText
                  <div data-about-strike-wrap className="relative">
                    <p data-about-p>
                      <WithStrike text={text} fragment={texts.strike} />
                    </p>
                  </div>
                ) : (
                  <p data-about-p className={i === 0 ? 'font-display text-2xl md:text-[1.7rem] leading-snug' : undefined}>
                    {text}
                  </p>
                )}
              </Fragment>
            ))}
          </div>
          {/* Linijka faktów — zwykły akapit (nie lista) */}
          <p className="mt-8 text-sm text-muted">{texts.facts}</p>
          {postHref ? (
            <Link
              href={postHref}
              className="group mt-8 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 decoration-border hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {texts.link}
              <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
