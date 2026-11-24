// lib/pricing.ts
// Wyliczenia sekcji „Przykładowe wyceny” (brief 5.7) — czyste funkcje, bez Reacta i Sanity.
// Suma min = Σ(godziny min × stawka), suma max = Σ(godziny max × stawka).
// Zaokrąglenie: min w dół, max w górę, do wielokrotności kroku z Ustawień wycen (domyślnie 100 PLN / 50 EUR).
// Waluta: z Ustawień wycen danego języka; EUR tylko wtedy, gdy każda stawka w przykładzie ma kwotę w EUR
// (inaczej PLN — nie mieszamy walut w jednej sumie). Brak kwoty którejkolwiek stawki = karta pokazuje tylko godziny.

import type { Locale } from '@/lib/locales'
import { DATE_LOCALE } from '@/lib/locales'
import type { PricingData, PricingRate } from '@/lib/queries'

export type Currency = 'PLN' | 'EUR'

export interface PricedItem {
  key: string
  task: string
  hoursMin: number
  hoursMax: number
}

export interface PricedExample {
  id: string
  title: string
  summary: string | null
  items: PricedItem[]
  hoursMin: number
  hoursMax: number
  // null = brak kwoty którejś stawki (karta pokazuje tylko godziny)
  total: { min: number; max: number; currency: Currency } | null
  missingRates: string[] // nazwy stawek bez kwoty (ostrzeżenie w trybie dev)
}

const DEFAULT_ROUNDING: Record<Currency, number> = { PLN: 100, EUR: 50 }

const amountIn = (rate: PricingRate, currency: Currency) => (currency === 'EUR' ? rate.amountEUR : rate.amountPLN)

export function roundDown(value: number, step: number) {
  return Math.floor(value / step) * step
}
export function roundUp(value: number, step: number) {
  return Math.ceil(value / step) * step
}

export function priceExamples(data: PricingData): PricedExample[] {
  const rates = new Map(data.rates.map((r) => [r.id, r]))
  const preferred: Currency = data.settings?.currency === 'EUR' ? 'EUR' : 'PLN'

  return data.examples.flatMap((ex) => {
    const items = (ex.items ?? []).filter(
      (it): it is typeof it & { hoursMin: number; hoursMax: number } => typeof it.hoursMin === 'number' && typeof it.hoursMax === 'number',
    )
    if (!ex.title || items.length === 0) return []

    const used = items.map((it) => (it.rateId ? rates.get(it.rateId) ?? null : null))
    const missingRates = [...new Set(used.flatMap((r, i) => (r && r.amountPLN ? [] : [r?.label ?? items[i].task])))]
    const currency: Currency = preferred === 'EUR' && used.every((r) => r?.amountEUR) ? 'EUR' : 'PLN'
    const step = (currency === 'EUR' ? data.settings?.roundingEUR : data.settings?.roundingPLN) || DEFAULT_ROUNDING[currency]

    let total: PricedExample['total'] = null
    if (missingRates.length === 0) {
      const min = items.reduce((sum, it, i) => sum + it.hoursMin * (amountIn(used[i]!, currency) ?? 0), 0)
      const max = items.reduce((sum, it, i) => sum + it.hoursMax * (amountIn(used[i]!, currency) ?? 0), 0)
      total = { min: roundDown(min, step), max: roundUp(max, step), currency }
    }

    return [
      {
        id: ex.id,
        title: ex.title,
        summary: ex.summary,
        items: items.map((it) => ({ key: it._key, task: it.task ?? '', hoursMin: it.hoursMin, hoursMax: it.hoursMax })),
        hoursMin: items.reduce((s, it) => s + it.hoursMin, 0),
        hoursMax: items.reduce((s, it) => s + it.hoursMax, 0),
        total,
        missingRates,
      },
    ]
  })
}

// Linia stawek: tylko stawki z kwotą w walucie strony (EUR, gdy ustawione i podane; inaczej PLN)
export function rateLine(data: PricingData): { label: string; amount: number; currency: Currency }[] {
  const preferred: Currency = data.settings?.currency === 'EUR' ? 'EUR' : 'PLN'
  return data.rates.flatMap((r) => {
    const currency: Currency = preferred === 'EUR' && r.amountEUR ? 'EUR' : 'PLN'
    const amount = amountIn(r, currency)
    return amount && r.label ? [{ label: r.label, amount, currency }] : []
  })
}

export function formatNumber(value: number, locale: Locale) {
  // useGrouping 'always': w pl-PL także 4 cyfry z separatorem (3 000, jak w briefie), a nie 3000
  return new Intl.NumberFormat(DATE_LOCALE[locale], { maximumFractionDigits: 1, useGrouping: 'always' }).format(value)
}
