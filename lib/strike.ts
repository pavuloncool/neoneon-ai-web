'use client'

// lib/strike.ts
// Skreślenie redakcyjne — wspólne dla „Pustej strony” (zdanie „przed”) i „O mnie” (fragment akapitu 4).
// Kreska SVG (kolor --accent-edit) rysowana po każdej linii skreślanego fragmentu: pozycje linii z
// getClientRects() elementu inline, więc działa także dla fragmentu w środku zdania, łamanego na kilka linii.
// Tekst zostaje w DOM bez zmian (czytnik dostaje pełne zdanie); nakładka SVG jest aria-hidden.
//
// Stan kreski trzyma obiekt `state` (start/koniec 0–1 dla całego fragmentu, rozkładane na linie po kolei),
// więc przy zmianie szerokości (ResizeObserver) ścieżki budowane są od nowa i od razu dostają bieżący stan.
// Bez JS i przy ograniczonym ruchu: przekreślenie CSS (.edit-strike w styles/globals.css).

import { gsap } from '@/lib/gsap'
import '@/lib/gsap-svg'
import { STRIKE } from '@/lib/motion'

const SVG_NS = 'http://www.w3.org/2000/svg'

export interface Strike {
  state: { start: number; end: number }
  build: () => void
  apply: () => void
  draw: (vars?: gsap.TweenVars) => gsap.core.Tween
  retract: (vars?: gsap.TweenVars) => gsap.core.Tween
  destroy: () => void
}

// target — skreślany element inline (<del> albo <span class="edit-strike">) albo funkcja zwracająca jego
// części (SplitText może pociąć fragment na kawałki w kolejnych liniach — czytane przy każdym przeliczeniu);
// container — element z position: relative, w którym leży nakładka SVG (poza elementem dzielonym przez
// SplitText, który przy ponownym podziale odtwarza swoją treść)
export function createStrike(target: HTMLElement | (() => HTMLElement[]), container: HTMLElement): Strike {
  const targets = () => (typeof target === 'function' ? target() : [target])
  const svg = document.createElementNS(SVG_NS, 'svg')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('class', 'strike-overlay')
  container.appendChild(svg)
  const markLive = () => targets().forEach((t) => t.setAttribute('data-strike-live', '')) // CSS: kreskę rysuje SVG
  markLive()

  const state = { start: 0, end: 0 }
  let paths: SVGPathElement[] = []
  const clamp = gsap.utils.clamp(0, 1)

  const apply = () => {
    const n = paths.length
    paths.forEach((p, i) => {
      gsap.set(p, { drawSVG: `${clamp(state.start * n - i) * 100}% ${clamp(state.end * n - i) * 100}%` })
    })
  }

  const build = () => {
    const box = container.getBoundingClientRect()
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`)
    svg.setAttribute('width', String(box.width))
    svg.setAttribute('height', String(box.height))
    paths.forEach((p) => p.remove())
    markLive()
    paths = targets()
      .flatMap((t) => [...t.getClientRects()])
      .filter((r) => r.width > 2)
      .map((r, i) => {
        const x0 = r.left - box.left - 2
        const x1 = r.right - box.left + 2
        const y = r.top - box.top + r.height * STRIKE.lineY
        const w = x1 - x0
        const wob = i % 2 ? 1.4 : -1.2 // lekko nierówna kreska, jak odręczna
        const path = document.createElementNS(SVG_NS, 'path')
        path.setAttribute('d', `M${x0},${y + wob * 0.4} C${x0 + w * 0.3},${y + wob} ${x0 + w * 0.65},${y - wob} ${x1},${y + wob * 0.3}`)
        svg.appendChild(path)
        return path
      })
    apply()
  }

  build()
  const observer = new ResizeObserver(() => build())
  observer.observe(container)

  return {
    state,
    build,
    apply,
    // Przed rysowaniem pozycje linii liczone od nowa (tekst mógł się przesunąć od utworzenia)
    draw: (vars = {}) =>
      // start: 0 także w wartościach docelowych — fromTo animuje tylko właściwości z toVars, a po zwinięciu
      // (retract) start = 1; bez tego kolejne rysowanie w rotacji „Pustej strony” zostawało puste
      gsap.fromTo(state, { start: 0, end: 0 }, { start: 0, end: 1, duration: STRIKE.draw, ease: STRIKE.ease, onStart: build, onUpdate: apply, ...vars }),
    retract: (vars = {}) => gsap.to(state, { start: 1, duration: STRIKE.retract, ease: STRIKE.ease, onUpdate: apply, ...vars }),
    destroy: () => {
      observer.disconnect()
      svg.remove()
      targets().forEach((t) => t.removeAttribute('data-strike-live'))
    },
  }
}
