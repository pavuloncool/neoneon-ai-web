'use client'

// components/home/Pricing.tsx
// Przykładowe wyceny (brief 5.7) — dane z Sanity, wyliczenia w lib/pricing.ts (na serwerze).
// Animacja: karty stagger 0,1 s; kwoty liczą od 0 do wartości (0,9 s, power2.out, snap 10) przy pierwszym
// wejściu — wartość końcowa jest w HTML z serwera, animacja tylko nadpisuje wyświetlaną liczbę i kończy
// się dokładnie na niej. Paski godzin (min–max) rysowane scaleX od lewej, stagger 0,05 s.
// Reduce / bez JS: wartości i paski statyczne.

import { useEffect, useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { gsap, motionEnabled, markMotionReady } from '@/lib/gsap'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { DURATION, EASE, OFFSET, STAGGER, TRIGGER_START } from '@/lib/motion'
import { formatNumber } from '@/lib/pricing'
import type { Locale } from '@/lib/locales'

export interface PricingCard {
  id: string
  title: string
  summary: string | null
  hoursLabel: string
  // Kwota: tekst przed / po liczbach i same liczby (do licznika); null = tylko godziny
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

export function Pricing({ id, locale, texts, cards, ctaHref }: { id: string; locale: Locale; texts: PricingTexts; cards: PricingCard[]; ctaHref: string }) {
  const root = useRef<HTMLElement>(null)

  // Brak kwoty stawki — ostrzeżenie w konsoli tylko w trybie dev (brief 5.7)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    cards.forEach((c) => {
      if (c.missingRates.length) console.warn(`Wyceny: „${c.title}” bez kwot stawek (${c.missingRates.join(', ')}) — karta pokazuje tylko godziny.`)
    })
  }, [cards])

  useSectionMotion(root, ({ reduce }) => {
    const el = root.current
    if (!el) return
    const finish = () => el.setAttribute('data-pricing-done', '')
    if (!motionEnabled() || reduce || cards.length === 0) {
      finish()
      markMotionReady()
      return
    }

    const cardEls = gsap.utils.toArray<HTMLElement>('[data-pricing-card]', el)
    const bars = gsap.utils.toArray<HTMLElement>('[data-pricing-bar]', el)
    const counters = gsap.utils.toArray<HTMLElement>('[data-count]', el)

    gsap.set(cardEls, { opacity: 0, y: OFFSET.card })
    gsap.set(bars, { scaleX: 0, transformOrigin: 'left center' })
    finish()
    markMotionReady()

    ScrollTrigger.create({
      trigger: el.querySelector('[data-pricing-grid]'),
      start: TRIGGER_START.default,
      once: true,
      onEnter: () => {
        // Liczniki od zera, zanim karta się pokaże (bez mignięcia wartości końcowej)
        counters.forEach((c) => {
          c.textContent = formatNumber(0, locale)
        })
        const tl = gsap.timeline()
        tl.to(cardEls, { opacity: 1, y: 0, duration: DURATION.base, stagger: STAGGER.cardsTight, ease: EASE.base, clearProps: 'transform' })
          .to(bars, { scaleX: 1, duration: DURATION.base, stagger: STAGGER.bars, ease: EASE.base }, 0.2)
        counters.forEach((c) => {
          const value = Number(c.dataset.count)
          const state = { v: 0 }
          tl.to(
            state,
            {
              v: value,
              duration: 0.9,
              ease: 'power2.out',
              snap: { v: 10 },
              onUpdate: () => {
                c.textContent = formatNumber(state.v, locale)
              },
              onComplete: () => {
                c.textContent = formatNumber(value, locale) // dokładnie wartość z HTML
              },
            },
            0.2,
          )
        })
      },
    })
  })

  if (cards.length === 0) {
    // Bez opublikowanych przykładów sekcja się nie pokazuje; w dev — informacja zamiast pustego miejsca
    if (process.env.NODE_ENV !== 'development') return null
    return (
      <section id={id} className="scroll-mt-20 border-t border-border dark:border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="font-display font-light text-4xl md:text-5xl leading-tight">{texts.title}</h2>
          <p className="mt-6 text-sm text-accent-edit">{texts.devEmpty}</p>
        </div>
      </section>
    )
  }

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} data-pricing className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <h2 id={`${id}-title`} className="font-display font-light text-4xl md:text-5xl leading-tight">
          {texts.title}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-muted max-w-3xl">{texts.lead}</p>
        {texts.ratesLine ? <p className="mt-6 font-mono text-sm">{texts.ratesLine}</p> : null}

        {/* Wspólne wiersze kart w rzędzie (subgrid, jak w Usługach): tytuł, opis, zadania, suma */}
        <ul data-pricing-grid className="mt-12 grid gap-6 md:gap-y-0 md:grid-cols-2 md:grid-rows-[auto_auto_1fr_auto] md:[&>li]:mb-6">
          {cards.map((card) => (
            <li key={card.id} data-pricing-card className="flex flex-col md:grid md:grid-rows-subgrid md:row-span-4 rounded-xl border border-border dark:border-white/10 bg-paper dark:bg-[#141414] p-7">
              <h3 className="font-display text-2xl md:text-3xl leading-tight md:self-end">{card.title}</h3>
              {/* Pusty element trzyma wiersz siatki, gdy przykład nie ma opisu */}
              {card.summary ? <p className="mt-3 text-[15px] leading-relaxed text-muted">{card.summary}</p> : <div aria-hidden="true" />}

              <ul className="mt-6 space-y-4 flex-1 md:self-start">
                {card.items.map((item) => (
                  <li key={item.key}>
                    <div className="flex items-baseline justify-between gap-4 text-[15px] leading-snug">
                      <span>{item.task}</span>
                      <span className="shrink-0 font-mono text-xs text-muted">{item.hoursLabel}</span>
                    </div>
                    {/* Pasek: pełny do min, jaśniejszy od min do max (skala: najdłuższe zadanie w przykładzie) */}
                    <div className="mt-2 h-1.5 rounded-full bg-border/60 dark:bg-white/10 overflow-hidden" aria-hidden="true">
                      <div data-pricing-bar className="relative h-full" style={{ width: `${item.maxPct}%` }}>
                        <span className="absolute inset-y-0 left-0 rounded-full bg-ink/70 dark:bg-paper/80" style={{ width: `${(item.minPct / item.maxPct) * 100}%` }} />
                        <span className="absolute inset-0 rounded-full bg-ink/25 dark:bg-paper/30" />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-8 border-t border-border dark:border-white/10 pt-5">
                {card.total ? (
                  <p className="font-display text-2xl md:text-3xl leading-tight">
                    {card.total.before}
                    <span data-count={card.total.min} className="tabular-nums">
                      {formatNumber(card.total.min, locale)}
                    </span>
                    {card.total.between}
                    <span data-count={card.total.max} className="tabular-nums">
                      {formatNumber(card.total.max, locale)}
                    </span>
                    {card.total.after}
                  </p>
                ) : null}
                <p className={`font-mono text-sm text-muted ${card.total ? 'mt-1' : ''}`}>{card.hoursLabel}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-[15px] leading-relaxed text-muted max-w-3xl">{texts.note}</p>
        <Link
          href={ctaHref}
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink px-6 py-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {texts.cta}
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </Link>
      </div>
    </section>
  )
}
