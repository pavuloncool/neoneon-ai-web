// components/sygnal/home/PricingSection.tsx
// Strona główna „Sygnał”: przykładowe wyceny (dane z Sanity, wyliczenia w lib/pricing.ts na serwerze).
// Karty z zadaniami i paskami godzin (pełny do min, przygaszony od min do max) i kwotą. Bez animacji.

import { Link } from '@/i18n/navigation'
import { formatNumber } from '@/lib/pricing'
import type { Locale } from '@/lib/locales'
import type { PricingCard, PricingTexts } from './types'
import s from '../sygnal.module.css'

export function PricingSection({
  id,
  label,
  locale,
  texts,
  cards,
  ctaHref,
}: {
  id: string
  label: string
  locale: Locale
  texts: PricingTexts
  cards: PricingCard[]
  ctaHref: string
}) {
  if (cards.length === 0) {
    // Bez opublikowanych przykładów sekcji nie ma; w dev — informacja zamiast pustego miejsca
    if (process.env.NODE_ENV !== 'development') return null
    return (
      <section id={id} className={`${s.wrap} ${s.section}`}>
        <p className={`${s.mono} ${s.label}`}>{label}</p>
        <h2 className={s.h2}>{texts.title}</h2>
        <p className={`${s.body} ${s.sub}`}>{texts.devEmpty}</p>
      </section>
    )
  }

  return (
    <section id={id} className={`${s.wrap} ${s.section}`} aria-labelledby={`${id}-h`}>
      <p className={`${s.mono} ${s.label}`}>{label}</p>
      <h2 id={`${id}-h`} className={s.h2}>
        {texts.title}
      </h2>
      <p className={`${s.body} ${s.sub}`}>{texts.lead}</p>
      {texts.ratesLine ? <p className={`${s.mono} ${s.rates}`}>{texts.ratesLine}</p> : null}

      <ul className={s.priceGrid}>
        {cards.map((card) => (
          <li key={card.id} className={s.priceCard}>
            <h3>{card.title}</h3>
            {card.summary ? <p className={s.priceSummary}>{card.summary}</p> : <div aria-hidden="true" />}
            <ul className={s.priceItems}>
              {card.items.map((item) => (
                <li key={item.key}>
                  <div className={s.priceRow}>
                    <span>{item.task}</span>
                    <span className={s.mono}>{item.hoursLabel}</span>
                  </div>
                  {/* Pasek: skala = najdłuższe zadanie w przykładzie */}
                  <div className={s.bar} aria-hidden="true">
                    <span className={s.barMax} style={{ width: `${item.maxPct}%` }} />
                    <span className={s.barMin} style={{ width: `${item.minPct}%` }} />
                  </div>
                </li>
              ))}
            </ul>
            <div className={s.priceTotal}>
              {card.total ? (
                <p className={s.priceAmount}>
                  {card.total.before}
                  <span data-count={card.total.min}>{formatNumber(card.total.min, locale)}</span>
                  {card.total.between}
                  <span data-count={card.total.max}>{formatNumber(card.total.max, locale)}</span>
                  {card.total.after}
                </p>
              ) : null}
              <p className={`${s.mono} ${s.priceHours}`}>{card.hoursLabel}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className={`${s.body} ${s.sub}`}>{texts.note}</p>
      <Link href={ctaHref} className={`${s.btn} ${s.btnLime}`} style={{ marginTop: 20 }}>
        {texts.cta} <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
