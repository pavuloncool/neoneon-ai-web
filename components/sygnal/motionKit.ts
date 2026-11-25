'use client'

// components/sygnal/motionKit.ts
// Wspólne klocki ruchu „Sygnał” (strona główna, blog, artykuły, podstrony).
// Język ruchu: sygnał wyłania się z szumu — rozmycie → ostrość, scramble w napisach mono, kreski od lewej.
//
// Tryb „lite” (systemowe „Ogranicz ruch”): zostają przejścia przezroczystości i rozmycia, scramble,
// skreślenia i rozwijanie list; znikają przesunięcia, wjazdy z maski, przypinanie i scrub z ruchem.

import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { SplitText, scrambleChars } from '@/lib/gsap-text'

export const IN = 'top 85%'
export const sel = (cls: string) => `.${cls}`

let LITE = false
export function setLite(lite: boolean) {
  LITE = lite
}
export const isLite = () => LITE
// Przesunięcie w px — w trybie lite zero
export const move = (px: number) => (LITE ? 0 : px)

// Wysokość zablokowana na czas scramble — losowe znaki mają inną szerokość i łamałyby linie (CLS)
export function scramble(el: HTMLElement, duration = 0.9) {
  const text = el.textContent ?? ''
  return gsap.to(el, {
    duration,
    ease: 'none',
    scrambleText: { text, chars: scrambleChars(text.toUpperCase()), revealDelay: 0.15, speed: 0.6 },
    onStart: () => void (el.style.minHeight = `${el.offsetHeight}px`),
    onComplete: () => void (el.style.minHeight = ''),
  })
}

// Napis mono: ukryty do wejścia, potem scramble
export function scrambleIn(el: HTMLElement, delay = 0) {
  gsap.set(el, { opacity: 0 })
  ScrollTrigger.create({
    trigger: el,
    start: IN,
    once: true,
    onEnter: () =>
      gsap.delayedCall(delay, () => {
        gsap.set(el, { opacity: 1 })
        scramble(el, 0.8)
      }),
  })
}

export function revealBlur(targets: gsap.TweenTarget, trigger: Element, extra: gsap.TweenVars = {}) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: move(28), filter: 'blur(12px)' },
    {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      duration: 0.9,
      ease: 'power3.out',
      clearProps: 'filter,transform',
      scrollTrigger: { trigger, start: IN, once: true },
      ...extra,
    },
  )
}

// Lista: elementy po kolei z rozmycia
export function staggerIn(items: Element[], trigger: Element, axis: 'x' | 'y' = 'y') {
  if (!items.length) return
  return gsap.fromTo(
    items,
    { opacity: 0, [axis]: move(axis === 'x' ? -24 : 26), filter: 'blur(10px)' },
    { opacity: 1, [axis]: 0, filter: 'blur(0px)', duration: 0.75, stagger: 0.1, ease: 'power3.out', clearProps: 'filter,transform', scrollTrigger: { trigger, start: IN, once: true } },
  )
}

// Nagłówek: linie wyjeżdżają z maski i wyostrzają się (lite: tylko rozmycie). Animacja w onSplit —
// przy ponownym podziale (fonty, zmiana szerokości) GSAP przenosi postęp.
// Nagłówek: linie wyjeżdżają z maski i wyostrzają się (lite: tylko rozmycie). Podział na linie dopiero
// przy wejściu nagłówka na ekran (SplitText mierzy układ — robiony dla wszystkich naraz blokował start
// strony), a po animacji cofnięty: zostaje zwykły tekst.
export function splitHeading(el: HTMLElement, trigger: Element = el) {
  if (LITE) return revealBlur(el, trigger)
  gsap.set(el, { opacity: 0 })
  return ScrollTrigger.create({
    trigger,
    start: IN,
    once: true,
    onEnter: () => {
      const split = SplitText.create(el, { type: 'lines', mask: 'lines' })
      gsap.set(el, { opacity: 1 })
      gsap.from(split.lines, {
        yPercent: 105,
        filter: 'blur(8px)',
        duration: 1,
        stagger: 0.09,
        ease: 'power4.out',
        onComplete: () => split.revert(),
      })
    },
  })
}

// Rozwijany wiersz (<details>): płynne otwieranie i zamykanie (wysokość + rozmycie treści).
// Klik i klawiatura (Enter/Spacja na <summary> wywołują click). Zwraca funkcję sprzątającą.
export function accordion(details: HTMLDetailsElement, getBody: () => HTMLElement | null) {
  const summary = details.querySelector('summary')
  if (!summary) return () => {}
  let busy = false
  const onClick = (e: MouseEvent) => {
    const body = getBody()
    if (!body || busy) return
    e.preventDefault()
    busy = true
    if (!details.open) {
      details.open = true
      const cs = getComputedStyle(body)
      const pb = cs.paddingBottom
      const mb = cs.marginBottom
      gsap.fromTo(
        body,
        { height: 0, paddingBottom: 0, marginBottom: 0, opacity: 0, filter: 'blur(10px)', overflow: 'hidden' },
        {
          height: 'auto',
          paddingBottom: pb,
          marginBottom: mb,
          opacity: 1,
          filter: 'blur(0px)',
          duration: 0.6,
          ease: 'power3.out',
          clearProps: 'height,paddingBottom,marginBottom,opacity,filter,overflow',
          onComplete: () => void (busy = false),
        },
      )
      gsap.fromTo(Array.from(body.children), { y: move(12) }, { y: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out', clearProps: 'transform' })
    } else {
      gsap.to(body, {
        height: 0,
        paddingBottom: 0,
        marginBottom: 0,
        opacity: 0,
        filter: 'blur(8px)',
        overflow: 'hidden',
        duration: 0.42,
        ease: 'power2.in',
        onComplete: () => {
          details.open = false
          gsap.set(body, { clearProps: 'height,paddingBottom,marginBottom,opacity,filter,overflow' })
          busy = false
        },
      })
    }
  }
  summary.addEventListener('click', onClick)
  return () => summary.removeEventListener('click', onClick)
}
