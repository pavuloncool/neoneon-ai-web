'use client'

// components/home/About.tsx
// O mnie (brief 5.8). Portret odsłania się od dołu (clip-path inset(100% 0 0 0) → inset(0), 1,1 s, expo.out),
// wokół rysują się DrawSVG znaczniki cięcia jak na korekcie drukarskiej (cztery narożniki).
// Tekst: SplitText po liniach z maską, stagger 0,06 s. Reduce / bez JS: statycznie.
// Portret pochodzi z Sanity (sekcja „tekst + obraz” strony „O mnie”), link — z wpisu o budowie strony.

import { useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { gsap, motionEnabled, markMotionReady } from '@/lib/gsap'
import { SplitText } from '@/lib/gsap-text'
import '@/lib/gsap-svg'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { DURATION, EASE, STAGGER, TRIGGER_START } from '@/lib/motion'
import type { AboutData } from '@/lib/queries'

export interface AboutTexts {
  title: string
  caption: string
  text: string
  facts: string[]
  link: string
}

// Znacznik cięcia w narożniku: dwie krótkie kreski odsunięte od rogu (SVG 24×24 przy rogu portretu)
const CORNERS = [
  { pos: '-left-6 -top-6', d: 'M0,18 H11 M18,0 V11' },
  { pos: '-right-6 -top-6', d: 'M24,18 H13 M6,0 V11' },
  { pos: '-left-6 -bottom-6', d: 'M0,6 H11 M18,24 V13' },
  { pos: '-right-6 -bottom-6', d: 'M24,6 H13 M6,24 V13' },
]

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
    const text = el.querySelector<HTMLElement>('[data-about-text]')!
    const split = SplitText.create(text, { type: 'lines', mask: 'lines', aria: 'auto', autoSplit: true })

    if (photo) gsap.set(photo, { clipPath: 'inset(100% 0 0 0)' })
    gsap.set(marks, { drawSVG: '0%' })
    gsap.set(split.lines, { yPercent: 100 })
    finish()
    markMotionReady()

    ScrollTrigger.create({
      trigger: el.querySelector('[data-about-grid]'),
      start: TRIGGER_START.default,
      once: true,
      onEnter: () => {
        const tl = gsap.timeline()
        if (photo) tl.to(photo, { clipPath: 'inset(0% 0 0 0)', duration: DURATION.slow, ease: EASE.heading }, 0)
        tl.to(marks, { drawSVG: '100%', duration: DURATION.base, stagger: 0.08, ease: EASE.inOut }, 0.5)
          .to(split.lines, { yPercent: 0, duration: DURATION.heading, stagger: STAGGER.code, ease: EASE.heading }, 0.15)
      },
    })
  })

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} data-about className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div data-about-grid className="max-w-6xl mx-auto px-6 py-20 md:py-28 grid gap-14 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 items-start">
        {portrait ? (
          <figure className="relative mx-6 md:mx-6 mt-6 max-w-sm">
            <div data-about-photo className="overflow-hidden rounded-sm">
              <Image
                src={portrait.url}
                alt={portrait.alt ?? texts.title}
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
          <h2 id={`${id}-title`} className="font-display font-light text-4xl md:text-5xl leading-tight">
            {texts.title}
          </h2>
          <p className="mt-3 font-display italic text-xl md:text-2xl text-muted">{texts.caption}</p>
          <p data-about-text className="mt-8 text-lg leading-relaxed">
            {texts.text}
          </p>
          <ul className="mt-8 space-y-2 text-[15px] text-muted">
            {texts.facts.map((fact) => (
              <li key={fact} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.65em] h-px w-3 shrink-0 bg-current opacity-60" />
                <span>{fact}</span>
              </li>
            ))}
          </ul>
          {postHref ? (
            <Link
              href={postHref}
              className="group mt-10 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 decoration-border hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
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
