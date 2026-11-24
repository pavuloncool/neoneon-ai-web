'use client'

// components/home/Services.tsx
// Usługi (brief 5.5): trzy karty. Wejście kart stagger 0,12 s (y 40 → 0, opacity), po wejściu karty
// DrawSVG rysuje pod tytułem odręczne podkreślenie (--accent-edit).
// Hover / fokus (desktop): karta y −4, strzałka w CTA x 6, 0,3 s. Karty 1 i 3: podkreślenie się pogrubia;
// karta 2 (strona = kod): podkreślenie krótko błyska --accent-ai.
// Reduce / bez JS: bez ruchu, podkreślenia narysowane statycznie.
// CTA prowadzi do formularza z parametrem usługi (?usluga= / ?service=), który zaznacza ją w formularzu.

import { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { gsap, motionEnabled, markMotionReady } from '@/lib/gsap'
import '@/lib/gsap-svg'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { DURATION, EASE, OFFSET, STAGGER, TRIGGER_START } from '@/lib/motion'

export interface ServiceItem {
  key: 'copy' | 'website' | 'content'
  title: string
  tags: string[]
  text: string
  points: string[]
  cta: string
  href: string
}

// Odręczne podkreślenie (lekko falujące); drugi wariant dla urozmaicenia
const UNDERLINES = ['M2,7 C40,3 90,10 140,5 S190,6 198,4', 'M2,5 C50,9 100,2 150,7 S192,4 198,6', 'M2,6 C45,2 95,9 145,4 S188,8 198,5']
const HOVER = 0.3 // s
const STROKE = 2.2
const STROKE_BOLD = 3.6

export function Services({ id, title, items }: { id: string; title: string; items: ServiceItem[] }) {
  const root = useRef<HTMLElement>(null)

  useSectionMotion(root, ({ desktop, reduce }) => {
    const el = root.current
    if (!el) return
    const finish = () => el.setAttribute('data-services-done', '')

    if (!motionEnabled() || reduce) {
      finish()
      markMotionReady()
      return
    }

    const cards = gsap.utils.toArray<HTMLElement>('[data-service-card]', el)
    const lines = cards.map((c) => c.querySelector<SVGPathElement>('[data-service-underline]')!)
    const flashes = cards.map((c) => c.querySelector<SVGPathElement>('[data-service-flash]'))

    gsap.set(cards, { opacity: 0, y: OFFSET.card })
    gsap.set(lines, { drawSVG: '0%' })
    finish()
    markMotionReady()

    // Wejście kart, potem podkreślenia (każde po wejściu swojej karty)
    ScrollTrigger.create({
      trigger: el.querySelector('[data-services-grid]'),
      start: TRIGGER_START.default,
      once: true,
      onEnter: () => {
        const tl = gsap.timeline()
        tl.to(cards, { opacity: 1, y: 0, duration: DURATION.base, stagger: STAGGER.cards, ease: EASE.base, clearProps: 'transform' })
        lines.forEach((line, i) => {
          tl.to(line, { drawSVG: '100%', duration: 0.7, ease: EASE.inOut }, i * STAGGER.cards + DURATION.base * 0.7)
        })
      },
    })

    if (!desktop) return

    // Hover i fokus klawiatury (desktop)
    const cleanups = cards.map((card, i) => {
      const arrow = card.querySelector<HTMLElement>('[data-service-arrow]')
      const flash = flashes[i]
      const enter = () => {
        gsap.to(card, { y: OFFSET.hoverLift, duration: HOVER, ease: EASE.base, overwrite: 'auto' })
        if (arrow) gsap.to(arrow, { x: OFFSET.hoverArrow, duration: HOVER, ease: EASE.base, overwrite: 'auto' })
        if (flash) {
          // Karta „strona”: krótki błysk koloru AI na podkreśleniu
          gsap.fromTo(flash, { opacity: 1 }, { opacity: 0, duration: 0.6, ease: 'power1.in', overwrite: 'auto' })
        } else {
          gsap.to(lines[i], { attr: { 'stroke-width': STROKE_BOLD }, duration: HOVER, ease: EASE.base, overwrite: 'auto' })
        }
      }
      const leave = () => {
        if (card.matches(':hover') || card.contains(document.activeElement)) return
        gsap.to(card, { y: 0, duration: HOVER, ease: EASE.base, overwrite: 'auto' })
        if (arrow) gsap.to(arrow, { x: 0, duration: HOVER, ease: EASE.base, overwrite: 'auto' })
        if (!flash) gsap.to(lines[i], { attr: { 'stroke-width': STROKE }, duration: HOVER, ease: EASE.base, overwrite: 'auto' })
      }
      card.addEventListener('mouseenter', enter)
      card.addEventListener('mouseleave', leave)
      card.addEventListener('focusin', enter)
      const blur = () => requestAnimationFrame(leave)
      card.addEventListener('focusout', blur)
      return () => {
        card.removeEventListener('mouseenter', enter)
        card.removeEventListener('mouseleave', leave)
        card.removeEventListener('focusin', enter)
        card.removeEventListener('focusout', blur)
      }
    })
    return () => cleanups.forEach((c) => c())
  })

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} data-services className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <h2 id={`${id}-title`} className="font-display font-light text-4xl md:text-5xl leading-tight">
          {title}
        </h2>

        {/* Desktop: wspólne wiersze dla wszystkich kart (subgrid) — etykiety, tytuł, opis, punkty i CTA
            zaczynają się na tej samej wysokości; tytuł przy dolnej krawędzi wiersza, więc podkreślenia
            leżą w jednej linii niezależnie od liczby wersów tytułu. */}
        <ul data-services-grid className="mt-12 grid gap-6 lg:gap-y-0 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_1fr_auto]">
          {items.map((item, i) => (
            <li
              key={item.key}
              data-service-card
              className="flex flex-col lg:grid lg:grid-rows-subgrid lg:row-span-5 rounded-xl border border-border dark:border-white/10 bg-paper dark:bg-[#141414] p-7"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">
                {/* Etykiety łamią się tylko między sobą, nigdy w środku */}
                {item.tags.map((tag, j) => (
                  <span key={tag}>
                    <span className="whitespace-nowrap">{tag}</span>
                    {j < item.tags.length - 1 ? <span aria-hidden="true"> · </span> : null}
                  </span>
                ))}
              </p>
              <h3 className="mt-5 lg:self-end font-display text-3xl leading-tight">
                <span className="relative inline-block pb-3">
                  {item.title}
                  <svg
                    aria-hidden="true"
                    className="absolute left-0 bottom-0 h-3 w-full overflow-visible"
                    viewBox="0 0 200 12"
                    preserveAspectRatio="none"
                  >
                    <path
                      data-service-underline
                      d={UNDERLINES[i % UNDERLINES.length]}
                      fill="none"
                      stroke="var(--accent-edit)"
                      strokeWidth={STROKE}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                    {item.key === 'website' ? (
                      <path
                        data-service-flash
                        d={UNDERLINES[i % UNDERLINES.length]}
                        fill="none"
                        stroke="var(--accent-ai)"
                        strokeWidth={STROKE_BOLD}
                        strokeLinecap="round"
                        vectorEffect="non-scaling-stroke"
                        opacity={0}
                      />
                    ) : null}
                  </svg>
                </span>
              </h3>
              <p className="mt-5 text-[16px] leading-relaxed text-muted">{item.text}</p>
              <ul className="mt-6 space-y-2.5 text-[15px] leading-snug flex-1 lg:self-start">
                {item.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.6em] h-px w-3 shrink-0 bg-current opacity-50" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={item.href}
                className="mt-8 inline-flex items-center gap-2 self-start text-sm font-medium underline underline-offset-4 decoration-border hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {item.cta}
                <span data-service-arrow aria-hidden="true" className="inline-block">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
