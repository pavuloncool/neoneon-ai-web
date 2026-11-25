'use client'

// components/sygnal/home/homeMotion.ts
// Ruch strony głównej „Sygnał” (wywołanie w HomeSignal; przy „Ogranicz ruch” — tryb lite z motionKit).
// Język ruchu: sygnał wyłania się z szumu — rozmycie → ostrość, scramble w napisach mono, limonkowe
// kreski rysowane od lewej, neonowy zapłon. Sekcje są serwerowe; tu wybieramy elementy po klasach modułu.
//
// - hero (przy wejściu): napisy mono scramble, H1 linia po linii z rozmycia, lead i przyciski,
// - etykiety sekcji: scramble; H2: linie z maski i rozmycia; leady: rozmycie → ostrość,
// - rola AI: kreski kart rysowane po kolei, „{ kod }” pisany znak po znaku,
// - pusta strona: zdanie ogólnikowe → skreślenie limonką → notatka (scramble) → konkretne wersje,
// - dla kogo: branże zapalają się po kolei, potem dwa przebiegi „sygnału” po pigułkach i koniec,
// - proces (telefon / węższe ekrany): etapy z rozmycia przy przewijaniu (desktop — pin w HomeSignal),
// - wyceny: paski godzin od lewej, kwoty liczą od zera; O mnie: portret odsłaniany skanem, skreślenie,
// - wiersze usług, FAQ i bloga: wejście po kolei; otwarcie wiersza — treść z rozmycia,
// - rozmowa: nagłówek zapala się jak neon (litery w losowej kolejności, 1–2 błyski na literę).

import { gsap } from '@/lib/gsap'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { SplitText } from '@/lib/gsap-text'
import { IN, accordion, isLite, move, revealBlur, scramble, scrambleIn, sel, splitHeading, staggerIn } from '../motionKit'
import s from '../sygnal.module.css'
import lists from '../lists.module.css'

// Sekwencja „sticky”: blok zatrzymuje się na ekranie, a przewijanie odtwarza animację do ostatniego
// tekstu (scrub). Przypinamy całą sekcję, jeśli mieści się w oknie, inaczej jej kluczowy blok.
// Tryb lite (bez pinu i scrubu): ta sama sekwencja odtwarza się sama przy wejściu.
const fits = (el: HTMLElement) => el.offsetHeight <= window.innerHeight * 0.9
function stage(candidates: (HTMLElement | null)[], tl: gsap.core.Timeline, distance: number) {
  const list = candidates.filter((c): c is HTMLElement => Boolean(c))
  if (!list.length) return
  const block = list.find(fits) ?? list[list.length - 1]
  if (isLite()) {
    ScrollTrigger.create({ trigger: block, start: IN, once: true, onEnter: () => void tl.play() })
    return
  }
  ScrollTrigger.create({
    trigger: block,
    start: () => (fits(block) ? 'center center' : 'top top'),
    end: () => `+=${distance}`,
    pin: true,
    scrub: 0.6,
    animation: tl,
    anticipatePin: 1,
    invalidateOnRefresh: true,
  })
}

export function heroIntro(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>(sel(s.hero))
  if (!hero) return
  const eyebrow = hero.querySelector<HTMLElement>(sel(s.eyebrow))
  const h1 = hero.querySelector<HTMLElement>(sel(s.h1))
  const foot = hero.querySelector<HTMLElement>(sel(s.heroFoot))
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  if (h1 && !isLite()) {
    // Opacity zostaje 1 (element LCP) — tylko rozmycie i przesunięcie
    tl.fromTo(h1, { filter: 'blur(16px)', y: 30, opacity: 1 }, { filter: 'blur(0px)', y: 0, duration: 1.3, clearProps: 'filter,transform' }, 0)
  }
  if (eyebrow) tl.fromTo(eyebrow, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.1).add(scramble(eyebrow, 1.2), 0.1)
  if (foot) {
    tl.fromTo(foot, { opacity: 0, y: move(20), filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, clearProps: 'filter,transform' }, 0.55)
  }
  hero.setAttribute('data-m-done', '')
}

export function sectionsMotion(root: HTMLElement) {
  const cleanups: (() => void)[] = []

  // ── Wspólne: etykiety, nagłówki, leady ──
  root.querySelectorAll<HTMLElement>(`section ${sel(s.label)}`).forEach((el) => scrambleIn(el))
  root.querySelectorAll<HTMLElement>(`section ${sel(s.h2)}`).forEach((el) => splitHeading(el))
  root.querySelectorAll<HTMLElement>(`section ${sel(s.sub)}, section ${sel(s.closing)}`).forEach((el) => revealBlur(el, el, { delay: 0.15 }))

  // ── Rola AI: kreski kart po kolei, potem treść; „{ kod }” w scramble — sekcja stoi, aż skończy ──
  const roles = gsap.utils.toArray<HTMLElement>(sel(s.role), root)
  if (roles.length) {
    const tl = gsap.timeline({ paused: true })
    tl.fromTo(roles, { '--draw': 0 }, { '--draw': 1, duration: 0.7, stagger: 0.25, ease: 'power2.inOut' }, 0)
    tl.fromTo(roles.map((r) => Array.from(r.children)), { opacity: 0, y: move(16), filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.08 }, 0.25)
    const code = root.querySelector<HTMLElement>(`${sel(s.roleAi)} h3`)
    if (code) tl.add(scramble(code, 1), '>-0.1')
    const section = roles[0].closest('section')
    stage([section, roles[0].parentElement], tl, 800)
  }

  // ── Pusta strona: skreślenie na żywo — karta stoi, aż wejdzie ostatnia konkretna wersja ──
  const edit = root.querySelector<HTMLElement>(sel(s.edit))
  if (edit) {
    const del = edit.querySelector('del')
    const note = edit.querySelector<HTMLElement>(sel(s.editNote))
    const after = edit.querySelectorAll(`${sel(s.editAfter)} li`)
    const caption = edit.querySelector(sel(s.editCaption))
    const tl = gsap.timeline({ paused: true })
    tl.fromTo(edit, { opacity: 0.3, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.5 })
    if (del) tl.fromTo(edit, { '--strike': 0 }, { '--strike': 1, duration: 1, ease: 'power2.inOut' }, '+=0.2').to(del, { color: 'rgba(242,242,238,.45)', duration: 0.4 }, '<0.5')
    if (note) tl.fromTo(note, { opacity: 0 }, { opacity: 1, duration: 0.05 }).add(scramble(note, 0.7))
    tl.fromTo(after, { opacity: 0, y: move(20), filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.5, ease: 'power3.out' }, '+=0.1')
    if (caption) tl.fromTo(caption, { opacity: 0 }, { opacity: 1, duration: 0.3 })
    stage([edit.closest('section'), edit], tl, 1500)
  }
  const gaps = gsap.utils.toArray<HTMLElement>(sel(s.gap), root)
  if (gaps.length) {
    gsap.fromTo(gaps, { '--draw': 0 }, { '--draw': 1, duration: 0.7, stagger: 0.2, ease: 'power2.inOut', scrollTrigger: { trigger: gaps[0], start: IN, once: true } })
    revealBlur(gaps.map((g) => Array.from(g.children)).flat(), gaps[0], { stagger: 0.06, delay: 0.2 })
  }

  // ── Dla kogo: branże zapalają się po kolei, na końcu przebieg sygnału — zdanie stoi, aż zapłonie ostatnia ──
  const pills = gsap.utils.toArray<HTMLElement>(sel(s.pill), root)
  if (pills.length) {
    const tl = gsap.timeline({ paused: true })
    tl.fromTo(
      pills,
      { opacity: 0.18, filter: 'blur(4px)', boxShadow: '0 0 0px rgba(204,255,0,0)' },
      {
        keyframes: [
          { opacity: 1, filter: 'blur(0px)', boxShadow: '0 0 22px rgba(204,255,0,.75)', duration: 0.2, ease: 'power2.out' },
          { boxShadow: '0 0 0px rgba(204,255,0,0)', duration: 0.5, ease: 'power1.out' },
        ],
        stagger: 0.3,
      },
    )
    tl.to(
      pills,
      {
        keyframes: [
          { backgroundColor: 'rgba(204,255,0,.95)', color: '#0a0a0b', duration: 0.15 },
          { backgroundColor: 'rgba(204,255,0,0)', color: '#ccff00', duration: 0.4 },
        ],
        stagger: 0.12,
      },
      '+=0.3',
    )
    const sentence = pills[0].closest('p')
    stage([sentence?.closest('section') ?? null, sentence], tl, 1100)
  }

  // ── Usługi, FAQ: wiersze po kolei; otwarcie — treść z rozmycia ──
  root.querySelectorAll<HTMLElement>(sel(s.services)).forEach((list) => {
    const rows = Array.from(list.children) as HTMLElement[]
    staggerIn(rows, list, 'x')
    rows.forEach((row) => {
      if (row instanceof HTMLDetailsElement) cleanups.push(accordion(row, () => row.querySelector<HTMLElement>(sel(s.serviceBody))))
    })
  })

  // ── Proces: przy pełnym ruchu przypięty w HomeSignal (desktop i telefon); w trybie lite — lista,
  //    etapy wyostrzają się przy przewijaniu ──
  if (isLite()) {
    root.querySelectorAll<HTMLElement>('[data-stage]').forEach((st) => {
      gsap.fromTo(st, { opacity: 0.15, filter: 'blur(14px)' }, { opacity: 1, filter: 'blur(0px)', ease: 'none', scrollTrigger: { trigger: st, start: 'top 92%', end: 'top 55%', scrub: 0.5 } })
    })
  }

  // ── Wyceny: paski i liczniki ──
  root.querySelectorAll<HTMLElement>(sel(s.priceCard)).forEach((card, i) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: IN, once: true }, delay: i * 0.1 })
    tl.fromTo(card, { opacity: 0, y: move(30), filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', clearProps: 'filter,transform' })
    tl.fromTo(card.querySelectorAll(`${sel(s.barMax)}, ${sel(s.barMin)}`), { scaleX: 0 }, { scaleX: 1, transformOrigin: 'left center', duration: 0.8, stagger: 0.05, ease: 'power3.out' }, '-=0.3')
    card.querySelectorAll<HTMLElement>('[data-count]').forEach((n) => {
      const end = Number(n.dataset.count)
      const fmt = new Intl.NumberFormat(document.documentElement.lang || 'pl')
      const o = { v: 0 }
      tl.to(o, { v: end, duration: 1, ease: 'power2.out', snap: { v: 10 }, onUpdate: () => (n.textContent = fmt.format(o.v)), onComplete: () => (n.textContent = fmt.format(end)) }, '<')
    })
  })

  // ── O mnie: portret odsłaniany skanem, skreślenie, fakty ──
  const portrait = root.querySelector<HTMLElement>(sel(s.portrait))
  if (portrait) {
    gsap.fromTo(portrait, { clipPath: 'inset(0 0 100% 0)', filter: 'brightness(2) blur(6px)' }, { clipPath: 'inset(0 0 0% 0)', filter: 'brightness(1) blur(0px)', duration: 1.4, ease: 'power3.inOut', clearProps: 'filter', scrollTrigger: { trigger: portrait, start: IN, once: true } })
  }
  const aboutLead = root.querySelector<HTMLElement>(sel(s.aboutLead))
  if (aboutLead) revealBlur(aboutLead, aboutLead)
  root.querySelectorAll<HTMLElement>(sel(s.strike)).forEach((del) => {
    const p = del.closest('p') ?? del
    gsap.set(p, { '--strike': 0 })
    gsap.to(p, { '--strike': 1, duration: 0.8, ease: 'power2.inOut', scrollTrigger: { trigger: p, start: 'top 65%', once: true }, delay: 0.6 })
  })
  root.querySelectorAll<HTMLElement>(`${sel(s.facts2)} li`).forEach((li, i) => scrambleIn(li, i * 0.15))

  // ── Z bloga (wiersze listy) ──
  root.querySelectorAll<HTMLElement>(`section ${sel(lists.rows)}`).forEach((list) => staggerIn(Array.from(list.children), list))

  // ── Rozmowa: nagłówek pisze się litera po literze, a migający kursor jest pchany za ostatnią literą.
  //    Sekcja stoi, aż nagłówek się dopisze i pojawią się tekst i przyciski. ──
  const talk = root.querySelector<HTMLElement>(sel(s.talkTitle))
  if (talk) {
    gsap.set(talk, { minHeight: talk.offsetHeight }) // wysokość docelowa — bez skoków układu przy pisaniu
    // słowa + litery: słowo przechodzi do nowej linii w całości, jak przy pisaniu
    const split = SplitText.create(talk, { type: 'words,chars' })
    const chars = split.chars as HTMLElement[]
    const cursor = document.createElement('span')
    cursor.className = s.cursor
    cursor.setAttribute('aria-hidden', 'true')
    const render = (n: number) => {
      chars.forEach((c, i) => (c.style.display = i < n ? 'inline-block' : 'none'))
      if (n > 0) chars[n - 1].after(cursor)
      else chars[0]?.before(cursor)
      cursor.toggleAttribute('data-typing', n > 0 && n < chars.length)
    }
    render(0)
    const typed = { n: 0 }
    const tl = gsap.timeline({ paused: true })
    tl.to(typed, { n: chars.length, duration: chars.length * 0.07, ease: 'none', onUpdate: () => render(Math.round(typed.n)) })
    tl.fromTo(talk, { textShadow: '0 0 0px rgba(204,255,0,0)' }, { textShadow: '0 0 28px rgba(204,255,0,.4)', duration: 0.6 })
    const foot = root.querySelector<HTMLElement>(sel(s.talkFoot))
    if (foot) tl.fromTo(foot, { opacity: 0, y: move(24), filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 }, '-=0.2')
    cleanups.push(() => {
      cursor.remove()
      split.revert()
    })
    stage([talk.closest('section'), talk.parentElement], tl, chars.length * 45 + 500)
  }

  return () => cleanups.forEach((fn) => fn())
}
