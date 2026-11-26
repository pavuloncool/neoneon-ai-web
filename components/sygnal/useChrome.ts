'use client'

// components/sygnal/useChrome.ts
// Teksty koła, mapy i paska z Sanity („Teksty interfejsu” → „Koło, pasek i stopka”, namespace `chrome`).

import { useMessages } from 'next-intl'
import type { DialLabels } from './SignalDial'
import type { MapLabels } from './SignalMap'

export interface BarLabels {
  search: string
  searchPlaceholder: string
  cta: string
  language: string
  contents: string
  fromBlog: string
  allArticles: string
}

export function useChrome() {
  const { bar, dial, map, brand } = useMessages().chrome
  return { bar: bar as BarLabels, dial: dial as DialLabels, map: map as MapLabels, brand }
}
