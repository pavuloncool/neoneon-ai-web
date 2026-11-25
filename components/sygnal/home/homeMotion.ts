'use client'

// components/sygnal/home/homeMotion.ts
// Ruch strony głównej „Sygnał” (tylko pełny ruch; wywołanie w HomeSignal, w gsap.matchMedia).
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
import { SplitText, scrambleChars } from '@/lib/gsap-text'
import s from '../sygnal.module.css'
import lists from '../lists.module.css'

const IN = 'top 82%'
const sel = (cls: string) => `.${cls}`

function scramble(el: HTMLElement, duration = 0.9) {
  const text = el.textContent ?? ''
  return gsap.to(el, { duration, ease: 'none', scrambleText: { text, chars: scrambleChars(text.toUpperCase()), revealDelay: 0.15, speed: 0.6 } })
}

function revealBlur(targets: gsap.TweenTarget, trigger: Element, extra: gsap.TweenVars = {}) {
  return gsap.fromTo(
    targets,
    { opacity: 0, y: 28, filter: 'blur(12px)' },
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

// Nagłówek: linie wyjeżdżają z maski i wyostrzają się. Animacja w onSplit — przy ponownym podziale
// (fonty, zmiana szerokości) GSAP przenosi postęp.
function splitHeading(el: HTMLElement, trigger: Element = el) {
  return SplitText.create(el, {
    type: 'lines',
    mask: 'lines',
    autoSplit: true,
    onSplit(self) {
      return gsap.from(self.lines, {
        yPercent: 105,
        filter: 'blur(8px)',
        duration: 1,
        stagger: 0.09,
        ease: 'power4.out',
        scrollTrigger: { trigger, start: IN, once: true },
      })
    },
  })
}

export function heroIntro(root: HTMLElement) {
  const hero = root.querySelector<HTMLElement>(sel(s.hero))
  if (!hero) return
  const eyebrow = hero.querySelector<HTMLElement>(sel(s.eyebrow))
  const h1 = hero.querySelector<HTMLElement>(sel(s.h1))
  const foot = hero.querySelector<HTMLElement>(sel(s.heroFoot))
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
  if (h1) {
    // Opacity zostaje 1 (element LCP) — tylko rozmycie i przesunięcie
    tl.fromTo(h1, { filter: 'blur(16px)', y: 30, opacity: 1 }, { filter: 'blur(0px)', y: 0, duration: 1.3, clearProps: 'filter,transform' }, 0)
  }
  if (eyebrow) tl.fromTo(eyebrow, { opacity: 0 }, { opacity: 1, duration: 0.2 }, 0.1).add(scramble(eyebrow, 1.2), 0.1)
  if (foot) {
    tl.fromTo(foot, { opacity: 0, y: 20, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, clearProps: 'filter,transform' }, 0.55)
  }
  hero.setAttribute('data-m-done', '')
}

export function sectionsMotion(root: HTMLElement, { wide }: { wide: boolean }) {
  const cleanups: (() => void)[] = []

  // ── Wspólne: etykiety, nagłówki, leady ──
  root.querySelectorAll<HTMLElement>(`section ${sel(s.label)}`).forEach((el) => {
    gsap.set(el, { opacity: 0 })
    ScrollTrigger.create({
      trigger: el,
      start: IN,
      once: true,
      onEnter: () => {
        gsap.set(el, { opacity: 1 })
        scramble(el, 0.8)
      },
    })
  })
  root.querySelectorAll<HTMLElement>(`section ${sel(s.h2)}`).forEach((el) => splitHeading(el))
  root.querySelectorAll<HTMLElement>(`section ${sel(s.sub)}, section ${sel(s.closing)}`).forEach((el) => revealBlur(el, el, { delay: 0.15 }))

  // ── Rola AI: kreski kart po kolei, potem treść; „{ kod }” pisany ──
  const roles = gsap.utils.toArray<HTMLElement>(sel(s.role), root)
  if (roles.length) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: roles[0], start: IN, once: true } })
    tl.fromTo(roles, { '--draw': 0 }, { '--draw': 1, duration: 0.7, stagger: 0.18, ease: 'power2.inOut' }, 0)
    tl.fromTo(roles.map((r) => Array.from(r.children)), { opacity: 0, y: 16, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.05, clearProps: 'filter,transform' }, 0.25)
    const code = root.querySelector<HTMLElement>(`${sel(s.roleAi)} h3`)
    if (code) tl.add(scramble(code, 1), '>-0.2')
  }

  // ── Pusta strona: skreślenie na żywo ──
  const edit = root.querySelector<HTMLElement>(sel(s.edit))
  if (edit) {
    const del = edit.querySelector('del')
    const note = edit.querySelector<HTMLElement>(sel(s.editNote))
    const after = edit.querySelectorAll(`${sel(s.editAfter)} li`)
    const caption = edit.querySelector(sel(s.editCaption))
    gsap.set(edit, { '--strike': 0 })
    if (note) gsap.set(note, { opacity: 0 })
    gsap.set(after, { opacity: 0, y: 20, filter: 'blur(10px)' })
    if (caption) gsap.set(caption, { opacity: 0 })
    const tl = gsap.timeline({ scrollTrigger: { trigger: edit, start: 'top 70%', once: true } })
    tl.fromTo(edit, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
    if (del) tl.to(edit, { '--strike': 1, duration: 0.9, ease: 'power2.inOut' }, '+=0.5').to(del, { color: 'rgba(242,242,238,.45)', duration: 0.4 }, '<0.4')
    if (note) tl.set(note, { opacity: 1 }).add(scramble(note, 0.7))
    tl.to(after, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.35, ease: 'power3.out', clearProps: 'filter,transform' }, '+=0.1')
    if (caption) tl.to(caption, { opacity: 1, duration: 0.4 })
  }
  const gaps = gsap.utils.toArray<HTMLElement>(sel(s.gap), root)
  if (gaps.length) {
    gsap.fromTo(gaps, { '--draw': 0 }, { '--draw': 1, duration: 0.7, stagger: 0.2, ease: 'power2.inOut', scrollTrigger: { trigger: gaps[0], start: IN, once: true } })
    revealBlur(gaps.map((g) => Array.from(g.children)).flat(), gaps[0], { stagger: 0.06, delay: 0.2 })
  }

  // ── Dla kogo: branże zapalają się po kolei, potem dwa przebiegi sygnału ──
  const pills = gsap.utils.toArray<HTMLElement>(sel(s.pill), root)
  if (pills.length) {
    gsap.set(pills, { opacity: 0.18, filter: 'blur(4px)' })
    const tl = gsap.timeline({ scrollTrigger: { trigger: pills[0], start: 'top 75%', once: true } })
    tl.to(pills, {
      keyframes: [
        { opacity: 1, filter: 'blur(0px)', boxShadow: '0 0 22px rgba(204,255,0,.75)', duration: 0.18, ease: 'power2.out' },
        { boxShadow: '0 0 0px rgba(204,255,0,0)', duration: 0.5, ease: 'power1.out' },
      ],
      stagger: 0.14,
    })
    // Dwa przebiegi, potem cisza (bez ruchu dłuższego niż 5 s — SC 2.2.2)
    tl.to(
      pills,
      {
        keyframes: [
          { backgroundColor: 'rgba(204,255,0,.95)', color: '#0a0a0b', duration: 0.14 },
          { backgroundColor: 'rgba(204,255,0,0)', color: '#ccff00', duration: 0.4 },
        ],
        stagger: { each: 0.12, repeat: 1, repeatDelay: pills.length * 0.12 },
        clearProps: 'backgroundColor,color,boxShadow',
      },
      '+=0.4',
    )
  }

  // ── Usługi, FAQ: wiersze po kolei; otwarcie — treść z rozmycia ──
  root.querySelectorAll<HTMLElement>(sel(s.services)).forEach((list) => {
    const rows = Array.from(list.children) as HTMLElement[]
    gsap.fromTo(rows, { opacity: 0, x: -24, filter: 'blur(8px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.7, stagger: 0.1, ease: 'power3.out', clearProps: 'filter,transform', scrollTrigger: { trigger: list, start: IN, once: true } })
    rows.forEach((row) => {
      if (!(row instanceof HTMLDetailsElement)) return
      const onToggle = () => {
        if (!row.open) return
        const body = row.querySelector(sel(s.serviceBody))
        if (body) gsap.fromTo(Array.from(body.children), { opacity: 0, y: 14, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, stagger: 0.08, ease: 'power3.out', clearProps: 'filter,transform' })
      }
      row.addEventListener('toggle', onToggle)
      cleanups.push(() => row.removeEventListener('toggle', onToggle))
    })
  })

  // ── Proces bez pinu (węższe ekrany): etapy z rozmycia, numer etapu scramble ──
  if (!wide) {
    root.querySelectorAll<HTMLElement>('[data-stage]').forEach((st) => {
      gsap.fromTo(st, { opacity: 0.15, filter: 'blur(14px)', y: 40 }, { opacity: 1, filter: 'blur(0px)', y: 0, ease: 'none', scrollTrigger: { trigger: st, start: 'top 92%', end: 'top 55%', scrub: 0.5 } })
    })
  }

  // ── Wyceny: paski i liczniki ──
  root.querySelectorAll<HTMLElement>(sel(s.priceCard)).forEach((card, i) => {
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: IN, once: true }, delay: i * 0.1 })
    tl.fromTo(card, { opacity: 0, y: 30, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', clearProps: 'filter,transform' })
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
  root.querySelectorAll<HTMLElement>(`${sel(s.facts2)} li`).forEach((li, i) => {
    gsap.set(li, { opacity: 0 })
    ScrollTrigger.create({ trigger: li, start: IN, once: true, onEnter: () => gsap.delayedCall(i * 0.15, () => { gsap.set(li, { opacity: 1 }); scramble(li, 0.9) }) })
  })

  // ── Z bloga (wiersze listy) ──
  root.querySelectorAll<HTMLElement>(`section ${sel(lists.rows)}`).forEach((list) => {
    gsap.fromTo(Array.from(list.children), { opacity: 0, y: 30, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.12, ease: 'power3.out', clearProps: 'filter,transform', scrollTrigger: { trigger: list, start: IN, once: true } })
  })

  // ── Rozmowa: neonowy zapłon nagłówka ──
  const talk = root.querySelector<HTMLElement>(sel(s.talkTitle))
  if (talk) {
    SplitText.create(talk, {
      // słowa + litery: słowo nie łamie się w środku przy podziale na litery
      type: 'words,chars',
      autoSplit: true,
      onSplit(self) {
        const tl = gsap.timeline({ scrollTrigger: { trigger: talk, start: 'top 75%', once: true } })
        tl.fromTo(
          self.chars,
          { opacity: 0.08 },
          {
            keyframes: [
              { opacity: 1, duration: 0.08 },
              { opacity: 0.3, duration: 0.08 },
              { opacity: 1, duration: 0.2 },
            ],
            stagger: { each: 0.035, from: 'random' },
          },
        )
        tl.fromTo(talk, { textShadow: '0 0 0px rgba(204,255,0,0)' }, { textShadow: '0 0 28px rgba(204,255,0,.45)', duration: 0.8 }, '-=0.2')
        return tl
      },
    })
    const foot = root.querySelector<HTMLElement>(sel(s.talkFoot))
    if (foot) revealBlur(foot, talk, { delay: 0.8 })
  }

  return () => cleanups.forEach((fn) => fn())
}
