'use client'

// components/layout/AnalyticsClient.tsx
// Vercel Web Analytics — liczba odwiedzin i źródła wejść, bez cookies (brief 3.3). Renderowane tylko poza
// trybem podglądu, jak Speed Insights. Do Vercel trafia sama ścieżka: bez parametrów zapytania (?q= z wyszukiwarki,
// ?usluga=) i bez kotwicy. Zbieranie danych trzeba włączyć w panelu Vercel: projekt → Analytics → Enable.
import { Analytics } from '@vercel/analytics/next'
import type { ComponentProps } from 'react'

type BeforeSend = NonNullable<ComponentProps<typeof Analytics>['beforeSend']>

const stripQuery: BeforeSend = (event) => {
  try {
    const url = new URL(event.url)
    url.search = ''
    url.hash = ''
    return { ...event, url: url.toString() }
  } catch {
    return null
  }
}

export function AnalyticsClient() {
  return <Analytics beforeSend={stripQuery} />
}
