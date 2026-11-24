'use client'

// lib/useSectionMotion.ts
// Wspólny szkielet animacji sekcji one-pagera: useGSAP (sprzątanie przy odmontowaniu)
// + gsap.matchMedia() z trzema warunkami z lib/motion.ts (desktop / mobile / reduce).
// Przy `reduce` sekcja nie rusza się ani nie pinuje — dozwolone tylko krótkie przejścia opacity.

import type { RefObject } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { refreshAfterFonts } from '@/lib/gsap-scroll'
import { MEDIA, type MediaConditions } from '@/lib/motion'

export function useSectionMotion(
  scope: RefObject<HTMLElement | null>,
  setup: (conditions: MediaConditions, context: gsap.Context) => void | (() => void),
  dependencies: unknown[] = [],
) {
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MEDIA, (ctx) => setup(ctx.conditions as MediaConditions, ctx))
      refreshAfterFonts()
      return () => mm.revert()
    },
    { scope, dependencies },
  )
}
