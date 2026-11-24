'use client'

// components/home/Audience.tsx
// Dla kogo (brief 5.4): zdanie z rotującym słowem — efekt „slot”.
// Słowo w maskowanym polu przewija się pionowo (yPercent −100 na kolejną pozycję) co 2,2 s,
// power3.inOut 0,6 s; szerokość pola płynnie dopasowuje się do słowa (zmierzona przed animacją).
//
// Brak CLS: „Prowadzisz [słowo]” jest osobną linią, reszta zdania zaczyna się w następnej — zmiana
// szerokości pola nie przesuwa żadnego tekstu. Słowa przesuwa transform.
// SEO i czytniki: w HTML pełne zdanie z pierwszym wariantem; pozostałe warianty aria-hidden;
// pod zdaniem lista wszystkich branż (sr-only; przy ograniczonym ruchu i bez JS — widoczna).
// Rotacja: tylko gdy sekcja jest na ekranie; przycisk pauzy (WCAG 2.2.2 — ruch dłuższy niż 5 s).

import { useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { gsap, motionEnabled, markMotionReady } from '@/lib/gsap'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { DURATION, EASE, LOOP } from '@/lib/motion'

export interface AudienceTexts {
  title: string
  lead: string
  industries: string[]
  rest: string
  text: string
  pause: string
  resume: string
}

type SlotState = 'idle' | 'running' | 'paused'

export function Audience({ id, texts }: { id: string; texts: AudienceTexts }) {
  const root = useRef<HTMLElement>(null)
  const loopRef = useRef<gsap.core.Timeline | null>(null)
  const inViewRef = useRef(false)
  const [state, setState] = useState<SlotState>('idle')
  const stateRef = useRef<SlotState>('idle')
  const setSlotState = (s: SlotState) => {
    stateRef.current = s
    setState(s)
  }

  const words = texts.industries

  useSectionMotion(root, ({ reduce }) => {
    const el = root.current
    if (!el) return
    const finish = () => el.setAttribute('data-audience-done', '')

    if (!motionEnabled() || reduce || words.length < 2) {
      finish()
      markMotionReady()
      return
    }

    const slot = el.querySelector<HTMLElement>('[data-slot]')!
    const track = el.querySelector<HTMLElement>('[data-slot-track]')!
    const items = gsap.utils.toArray<HTMLElement>('[data-slot-word]', el)

    // Szerokości słów (z kopią pierwszego na końcu — płynne przejście ostatni → pierwszy)
    const measure = () => items.map((w) => w.getBoundingClientRect().width)
    let widths = measure()
    gsap.set(slot, { width: widths[0] })
    el.classList.add('slot-animated')
    finish()
    markMotionReady()

    const loop = gsap.timeline({ repeat: -1, paused: true, defaults: { duration: DURATION.base, ease: EASE.slot } })
    for (let i = 1; i < items.length; i++) {
      loop
        .to(track, { yPercent: -100 * i }, `+=${LOOP.slotInterval - DURATION.base}`)
        .to(slot, { width: () => widths[i] }, '<')
    }
    // Ostatnia pozycja to kopia pierwszego słowa → skok do początku bez ruchu
    loop.set(track, { yPercent: 0 })
    loopRef.current = loop

    const sync = () => {
      if (inViewRef.current && stateRef.current !== 'paused') loop.resume()
      else loop.pause()
    }
    setSlotState('running')

    ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => {
        inViewRef.current = self.isActive
        sync()
      },
    })

    // Zmiana fontów lub szerokości okna: nowe szerokości słów
    const onResize = () => {
      widths = measure()
      loop.invalidate()
      gsap.set(slot, { width: widths[Math.round(-(gsap.getProperty(track, 'yPercent') as number) / 100)] ?? widths[0] })
    }
    document.fonts?.ready.then(onResize)
    ScrollTrigger.addEventListener('refreshInit', onResize)

    return () => {
      ScrollTrigger.removeEventListener('refreshInit', onResize)
      el.classList.remove('slot-animated')
      loopRef.current = null
      setSlotState('idle')
    }
  })

  const togglePause = () => {
    const loop = loopRef.current
    if (!loop) return
    if (stateRef.current === 'paused') {
      setSlotState('running')
      if (inViewRef.current) loop.resume()
    } else {
      setSlotState('paused')
      loop.pause()
    }
  }

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} data-audience className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <h2 id={`${id}-title`} className="font-display font-light text-4xl md:text-5xl leading-tight">
          {texts.title}
        </h2>

        <p className="mt-10 font-display font-light text-[1.7rem] sm:text-4xl md:text-5xl leading-[1.2]">
          {texts.lead}{' '}
          {/* Poniżej md pole zawsze w osobnej linii — krótkie słowo nie „podskakuje” do linii wyżej (CLS) */}
          <br className="md:hidden" />
          {/* Pole „slot”: pierwsze słowo w przepływie (wyznacza szerokość i wysokość), kolejne pod nim */}
          {/* py/-my 0,2em: zapas na polskie znaki i wydłużenia liter — sąsiednie słowa nie prześwitują przez maskę */}
          <span data-slot className="slot relative inline-block align-bottom overflow-hidden whitespace-nowrap max-w-full -my-[0.2em]">
            <span data-slot-track className="relative block italic">
              {[...words, words[0]].map((word, i) => (
                <span
                  key={i}
                  data-slot-word
                  aria-hidden={i > 0 ? true : undefined}
                  className={i === 0 ? 'block w-max py-[0.2em]' : 'slot-extra absolute left-0 block w-max py-[0.2em]'}
                  style={i === 0 ? undefined : { top: `${i * 100}%` }}
                >
                  {word}
                </span>
              ))}
            </span>
            <span aria-hidden="true" className="absolute left-0 right-0 bottom-[0.24em] h-px bg-current opacity-30" />
          </span>
          <br />
          {texts.rest}
        </p>

        {/* Lista branż: dla czytników zawsze; widoczna bez JS i przy ograniczonym ruchu */}
        <ul className="slot-list mt-6 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
          {words.map((word, i) => (
            <li key={word}>
              {word}
              {i < words.length - 1 ? <span aria-hidden="true"> ·</span> : null}
            </li>
          ))}
        </ul>

        {state !== 'idle' ? (
          <button
            type="button"
            onClick={togglePause}
            aria-pressed={state === 'paused'}
            className="mt-4 inline-flex items-center gap-2 text-xs text-muted hover:text-ink dark:hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {state === 'paused' ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
            {state === 'paused' ? texts.resume : texts.pause}
          </button>
        ) : null}

        <p className="mt-12 text-lg leading-relaxed text-muted max-w-3xl">{texts.text}</p>
      </div>
    </section>
  )
}
