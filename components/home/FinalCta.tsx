'use client'

// components/home/FinalCta.tsx
// CTA końcowe (brief 5.11): domknięcie motywu z hero. Obok nagłówka ten sam kursor co w oknie promptu.
// Przy wejściu sekcji nagłówek „wpisuje się” znak po znaku — tekst jest w DOM od początku, animujemy tylko
// clip-path znaków (SplitText z aria: czytnik dostaje całe zdanie). Potem kursor miga — jedyna pętla
// nieskończona na stronie (brief 3.2); zatrzymuje się, gdy sekcja jest poza ekranem.
// Reduce / bez JS: nagłówek statyczny, kursor stoi bez migania.

import { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { gsap, motionEnabled, markMotionReady } from '@/lib/gsap'
import { SplitText } from '@/lib/gsap-text'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { LOOP, TRIGGER_START } from '@/lib/motion'

const TYPE_STAGGER = 0.05 // s na znak

export function FinalCta({ id, title, text, button, href }: { id: string; title: string; text: string; button: string; href: string }) {
  const root = useRef<HTMLElement>(null)

  useSectionMotion(root, ({ reduce }) => {
    const el = root.current
    if (!el) return
    const finish = () => el.setAttribute('data-cta-done', '')
    if (!motionEnabled() || reduce) {
      finish()
      markMotionReady()
      return
    }

    const heading = el.querySelector<HTMLElement>('[data-cta-heading]')!
    const cursor = el.querySelector<HTMLElement>('[data-cta-cursor]')!
    // words + chars: słowa nie łamią się w środku przy pisaniu
    const split = SplitText.create(heading, { type: 'words,chars', aria: 'none' })
    gsap.set(split.chars, { clipPath: 'inset(0 100% 0 0)' })
    finish()
    markMotionReady()

    const blink = gsap.to(cursor, { opacity: 0, duration: LOOP.cursorBlink / 2, ease: 'steps(1)', repeat: -1, yoyo: true, paused: true })
    let typed = false

    ScrollTrigger.create({
      trigger: el,
      start: TRIGGER_START.default,
      end: 'bottom top',
      onEnter: () => {
        if (!typed) {
          typed = true
          gsap.to(split.chars, { clipPath: 'inset(0 0% 0 0)', duration: 0.01, stagger: TYPE_STAGGER, ease: 'none' })
        }
        blink.play()
      },
      // Pętla kursora tylko na ekranie
      onToggle: (self) => {
        if (self.isActive) blink.play()
        else blink.pause(0)
      },
    })
  })

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} data-cta className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-24 md:py-36">
        <h2 id={`${id}-title`} className="font-display font-light text-5xl md:text-7xl leading-[1.05]">
          {/* Kopia dla czytników + znaki animowane (aria-hidden): czytnik dostaje całe zdanie, nie litery */}
          <span className="sr-only">{title}</span>
          <span data-cta-heading aria-hidden="true">
            {title}
          </span>
          <span data-cta-cursor aria-hidden="true" className="hero-cursor ml-2" />
        </h2>
        <p className="mt-8 text-lg md:text-xl leading-relaxed text-muted max-w-2xl">{text}</p>
        <Link
          href={href}
          className="group mt-10 inline-flex items-center gap-2 rounded-full bg-ink text-paper dark:bg-paper dark:text-ink px-7 py-3.5 text-base font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {button}
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </Link>
      </div>
    </section>
  )
}
