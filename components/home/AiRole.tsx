'use client'

// components/home/AiRole.tsx
// Sub-hero (brief 5.2): „Gdzie AI pomaga, a gdzie nie” — efekt „AI? → Ty i ja”.
// Każda karta startuje wyszarzona z etykietą „AI?”; po aktywacji ScrambleText zamienia ją na „Ty i ja”
// (karta 4: „AI + ja” w --accent-ai, w tle przewija się półprzezroczysty kod — jedyne miejsce
// z kolorem AI w tej sekcji).
//
// Desktop: sekcja przypięta (pin, end +=150%, scrub 0.6), karty aktywują się kolejno przy scrollu.
// Scramble trwa 0,8 s w czasie rzeczywistym (nie zależy od tempa scrollu): uruchamia go przekroczenie
// progu postępu, a przy cofaniu etykieta wraca do „AI?”.
// Mobile: bez pinu, każda karta aktywuje się raz przy wejściu (top 80%). Reduce: stan końcowy od razu.
//
// Dostępność i SEO: w HTML jest docelowa etykieta („Kto: Ty i ja”) dla czytników (sr-only);
// animowana etykieta jest aria-hidden. Stan startowy (wyszarzenie, ukryta etykieta) ustawia CSS
// pod html.js — bez mignięcia przed hydracją.

import { useRef } from 'react'
import { gsap, motionEnabled, markMotionReady } from '@/lib/gsap'
import '@/lib/gsap-text'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { DURATION, EASE, PIN, TRIGGER_START } from '@/lib/motion'

export interface AiRoleCard {
  title: string
  text: string
  who: string
}

export interface AiRoleTexts {
  title: string
  lead: string
  whoLabel: string
  unknown: string
  cards: AiRoleCard[]
}

const DIM = 0.35 // krycie wyszarzonej karty
const SCRAMBLE = 0.8 // s

// Kod w tle karty 4 (dekoracyjny)
const BG_CODE = [
  'const page = await build({ sections })',
  'export function Services() {',
  '  return <Grid items={services} />',
  '}',
  'gsap.from(".card", { y: 40, stagger: 0.12 })',
  '<Link href={contactHref}>…</Link>',
  'await deploy({ preview: true })',
  'await review(changes)',
  'export const revalidate = 3600',
  'const faq = await sanity.fetch(query)',
  '<section id={anchor}>',
  'npm run build && npm run lint',
]

export function AiRole({ id, texts }: { id: string; texts: AiRoleTexts }) {
  const root = useRef<HTMLElement>(null)
  const last = texts.cards.length - 1

  useSectionMotion(root, ({ desktop, reduce }) => {
    const el = root.current
    if (!el) return
    const finish = () => el.setAttribute('data-airole-done', '')

    if (!motionEnabled() || reduce) {
      finish()
      markMotionReady()
      return
    }

    const cards = gsap.utils.toArray<HTMLElement>('[data-airole-card]', el)
    const labels = cards.map((c) => c.querySelector<HTMLElement>('[data-airole-label]')!)
    const bodies = cards.map((c) => c.querySelector<HTMLElement>('[data-airole-body]')!)
    const bgCode = el.querySelector<HTMLElement>('[data-airole-bg]')

    // Stan startowy przejmuje GSAP: „AI?” i wyszarzenie
    labels.forEach((l) => {
      l.textContent = texts.unknown
      l.classList.remove('text-accent-ai')
    })
    gsap.set(bodies, { opacity: DIM })
    gsap.set(labels, { opacity: 1 })
    if (bgCode) gsap.set(bgCode, { opacity: 0, yPercent: 0 })
    finish()
    markMotionReady()

    const active = cards.map(() => false)
    const setActive = (i: number, on: boolean) => {
      if (active[i] === on) return
      active[i] = on
      const label = labels[i]
      gsap.killTweensOf([label, bodies[i]])
      gsap.to(bodies[i], { opacity: on ? 1 : DIM, duration: DURATION.base, ease: EASE.base })
      // Kolor AI na karcie 4 dopiero po aktywacji
      if (i === last) {
        label.classList.toggle('text-accent-ai', on)
        if (bgCode) gsap.to(bgCode, { opacity: on ? 1 : 0, duration: DURATION.base, ease: EASE.base })
      }
      gsap.to(label, {
        duration: SCRAMBLE,
        ease: 'none',
        scrambleText: { text: on ? texts.cards[i].who : texts.unknown, chars: 'upperAndLowerCase', revealDelay: 0.15, speed: 0.6 },
      })
    }

    if (desktop) {
      // Przypięcie: progi aktywacji kart (pierwsza zapala się tuż po przypięciu, ostatnia ma ~30% pinu
      // na przeczytanie, zanim sekcja odjedzie)
      const pinned = el.querySelector<HTMLElement>('[data-airole-pin]')!
      const thresholds = cards.map((_, i) => 0.05 + i * 0.22)
      ScrollTrigger.create({
        trigger: pinned,
        start: 'top top',
        end: PIN.subHeroEnd,
        pin: true,
        scrub: PIN.subHeroScrub,
        onUpdate: (self) => {
          cards.forEach((_, i) => setActive(i, self.progress >= thresholds[i]))
        },
      })
      // Kod w tle karty 4 przewija się razem ze scrollem (bez pętli)
      if (bgCode) {
        gsap.to(bgCode, {
          yPercent: -35,
          ease: 'none',
          scrollTrigger: { trigger: pinned, start: 'top top', end: PIN.subHeroEnd, scrub: PIN.subHeroScrub },
        })
      }
    } else {
      cards.forEach((card, i) => {
        ScrollTrigger.create({ trigger: card, start: TRIGGER_START.default, once: true, onEnter: () => setActive(i, true) })
      })
      if (bgCode) {
        ScrollTrigger.create({
          trigger: cards[last],
          start: TRIGGER_START.default,
          once: true,
          onEnter: () => gsap.to(bgCode, { yPercent: -35, duration: 3, ease: 'power1.out' }),
        })
      }
    }

    return () => {
      // Powrót do stanu z HTML (np. zmiana desktop ↔ mobile)
      labels.forEach((l, i) => {
        l.textContent = texts.cards[i].who
        l.classList.toggle('text-accent-ai', i === last)
      })
    }
  })

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} data-airole className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div data-airole-pin className="lg:min-h-screen lg:flex lg:items-center">
        <div className="max-w-6xl w-full mx-auto px-6 py-20 md:py-24">
          <h2 id={`${id}-title`} className="font-display font-light text-4xl md:text-5xl leading-tight max-w-3xl">
            {texts.title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted max-w-3xl">{texts.lead}</p>

          <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {texts.cards.map((card, i) => (
              <li
                key={card.title}
                data-airole-card
                className="relative overflow-hidden rounded-xl border border-border dark:border-white/10 bg-paper dark:bg-[#141414] p-6 flex flex-col min-h-[15rem]"
              >
                {i === last ? (
                  <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
                    <pre
                      data-airole-bg
                      className="font-mono text-[11px] leading-5 text-accent-ai opacity-100 whitespace-pre px-6 pt-24 [mask-image:linear-gradient(to_bottom,transparent,black_35%,black_70%,transparent)]"
                    >
                      <span className="block opacity-[0.08] dark:opacity-[0.12]">{[...BG_CODE, ...BG_CODE].join('\n')}</span>
                    </pre>
                  </div>
                ) : null}
                <div data-airole-body className="relative flex flex-col flex-1">
                  <span className="font-mono text-xs text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 font-display text-3xl">{card.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-muted flex-1">{card.text}</p>
                </div>
                <p className="relative mt-6 font-mono text-xs uppercase tracking-[0.14em]">
                  <span className="sr-only">
                    {texts.whoLabel} {card.who}
                  </span>
                  <span aria-hidden="true" className="text-muted">
                    {texts.whoLabel}{' '}
                  </span>
                  <span aria-hidden="true" data-airole-label className={i === last ? 'text-accent-ai' : ''}>
                    {card.who}
                  </span>
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
