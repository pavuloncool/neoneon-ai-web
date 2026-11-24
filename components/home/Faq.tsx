'use client'

// components/home/Faq.tsx
// FAQ strony głównej (brief 5.9) — rdzeń AEO pod „Jak zbudować stronę z AI”. Dane: dokumenty „Pytanie FAQ”
// z Sanity (a gdy żadne nie jest opublikowane — teksty z messages); z tych samych danych powstaje JSON-LD
// FAQPage (app/[locale]/(blog)/page.tsx), więc widok i dane strukturalne są identyczne.
//
// Natywne <details>/<summary>: działa bez JS, odpowiedzi są zawsze w HTML (SEO), stan rozwinięcia
// i dostępność z klawiatury zapewnia przeglądarka. GSAP to warstwa dodatkowa: wysokość 0 → auto
// (0,45 s, power2.inOut) i obrót „+” do „×” (rotation 45). Reduce: bez animacji wysokości (natywne działanie).

import { useRef } from 'react'
import { gsap } from '@/lib/gsap'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { EASE } from '@/lib/motion'

export interface FaqItemView {
  id: string
  question: string
  answer: string
}

const DURATION = 0.45

export function Faq({ id, title, items }: { id: string; title: string; items: FaqItemView[] }) {
  const root = useRef<HTMLElement>(null)

  useSectionMotion(root, ({ reduce }) => {
    const el = root.current
    if (!el || reduce) return

    const entries = gsap.utils.toArray<HTMLDetailsElement>('details', el)
    const cleanups = entries.map((details) => {
      const summary = details.querySelector('summary')!
      const body = details.querySelector<HTMLElement>('[data-faq-answer]')!
      const icon = details.querySelector<HTMLElement>('[data-faq-icon]')!
      gsap.set(icon, { rotation: details.open ? 45 : 0 })

      const onClick = (event: MouseEvent) => {
        event.preventDefault()
        if (details.open) {
          gsap.to(icon, { rotation: 0, duration: DURATION, ease: EASE.inOut })
          gsap.to(body, {
            height: 0,
            duration: DURATION,
            ease: EASE.inOut,
            overwrite: true,
            onComplete: () => {
              details.open = false
              gsap.set(body, { clearProps: 'height,overflow' })
            },
          })
        } else {
          details.open = true
          gsap.to(icon, { rotation: 45, duration: DURATION, ease: EASE.inOut })
          gsap.fromTo(
            body,
            { height: 0, overflow: 'hidden' },
            { height: 'auto', duration: DURATION, ease: EASE.inOut, overwrite: true, onComplete: () => gsap.set(body, { clearProps: 'height,overflow' }) },
          )
        }
      }
      summary.addEventListener('click', onClick)
      return () => summary.removeEventListener('click', onClick)
    })
    return () => cleanups.forEach((c) => c())
  })

  if (items.length === 0) return null

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div className="max-w-4xl mx-auto px-6 py-20 md:py-28">
        <h2 id={`${id}-title`} className="font-display font-light text-4xl md:text-5xl leading-tight">
          {title}
        </h2>
        <div className="mt-10 divide-y divide-border dark:divide-white/10 border-y border-border dark:border-white/10">
          {items.map((item) => (
            <details key={item.id} className="group/faq">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-6 text-lg md:text-xl leading-snug focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 [&::-webkit-details-marker]:hidden">
                <h3 className="font-medium">{item.question}</h3>
                {/* Bez JS i przy ograniczonym ruchu obrót daje CSS (group-open); z GSAP — styl inline go nadpisuje */}
                <span
                  data-faq-icon
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-2xl font-light leading-none text-muted dark:text-white/60 group-open/faq:rotate-45"
                >
                  +
                </span>
              </summary>
              <div data-faq-answer>
                <p className="pb-6 pr-10 whitespace-pre-line text-[17px] leading-relaxed text-muted dark:text-white/70">{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
