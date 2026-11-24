'use client'

// lib/gsap-scroll.ts
// ScrollTrigger — osobny moduł, importowany tylko przez komponenty artykułu.

import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export { ScrollTrigger }

// Po załadowaniu fontów zmieniają się wysokości tekstu → przeliczamy pozycje triggerów (raz na stronę)
let fontsRefreshQueued = false
export function refreshAfterFonts(): void {
  if (fontsRefreshQueued || typeof document === 'undefined' || !document.fonts) return
  fontsRefreshQueued = true
  document.fonts.ready.then(() => ScrollTrigger.refresh())
}
