'use client'

// components/sygnal/SiteMotion.tsx
// Ruch „Sygnał” na podstronach (blog, kategorie, wyszukiwarka, artykuły, Kontakt, polityki, 404).
// Nic nie renderuje: po każdej zmianie adresu wybiera elementy w <main> po klasach modułów i animuje
// je klockami z motionKit. Strona główna ma własny ruch (HomeSignal) — tu jest pomijana.
// „Ogranicz ruch”: tryb lite (bez przesunięć; przejścia, scramble i rozwijanie zostają).

import { usePathname } from '@/i18n/navigation'
import { gsap, useGSAP, motionEnabled, markMotionReady, FULL_MOTION } from '@/lib/gsap'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { accordion, move, revealBlur, scrambleIn, sel, setLite, splitHeading, staggerIn } from './motionKit'
import lists from './lists.module.css'
import a from './article.module.css'
import legal from './legal.module.css'

export function SiteMotion() {
  const pathname = usePathname()

  useGSAP(
    () => {
      if (pathname === '/' || !motionEnabled()) return
      const main = document.getElementById('main-content')
      if (!main) return
      const mm = gsap.matchMedia()
      mm.add({ motion: FULL_MOTION }, (ctx) => {
        setLite(!(ctx.conditions as { motion: boolean }).motion)
        markMotionReady()
        const cleanups: (() => void)[] = []
        const q = <T extends Element = HTMLElement>(selector: string) => Array.from(main.querySelectorAll<T & Element>(selector)) as T[]

        // ── Nagłówki list i podstron ──
        q<HTMLElement>(`${sel(lists.eyebrow)}, ${sel(lists.sectionHead)}, ${sel(lists.filterLabel)}, ${sel(lists.status)}`).forEach((el) => scrambleIn(el))
        q<HTMLElement>(sel(lists.title)).forEach((el) => splitHeading(el))
        q<HTMLElement>(sel(lists.lead)).forEach((el) => revealBlur(el, el, { delay: 0.2 }))
        q<HTMLElement>(sel(lists.tagList)).forEach((list) => staggerIn(Array.from(list.children), list))
        q<HTMLElement>(sel(lists.tiles)).forEach((list) => staggerIn(Array.from(list.children), list))
        q<HTMLElement>(sel(lists.rows)).forEach((list) => staggerIn(Array.from(list.children), list))
        q<HTMLElement>(sel(lists.featureGrid)).forEach((list) => staggerIn(Array.from(list.children), list))
        q<HTMLElement>(sel(lists.textImage)).forEach((el) => staggerIn(Array.from(el.children), el))
        q<HTMLElement>(sel(lists.searchForm)).forEach((el) => revealBlur(el, el, { delay: 0.2 }))

        // ── Artykuł ──
        q<HTMLElement>(`${sel(a.meta)} > *`).forEach((el, i) => scrambleIn(el, i * 0.12))
        q<HTMLElement>(sel(a.title)).forEach((el) => splitHeading(el))
        q<HTMLElement>(sel(a.lead)).forEach((el) => revealBlur(el, el, { delay: 0.35 }))
        q<HTMLElement>(sel(a.tags)).forEach((list) => staggerIn(Array.from(list.children), list))
        q<HTMLElement>(sel(a.cover)).forEach((el) =>
          gsap.fromTo(el, { clipPath: 'inset(0 0 100% 0)', filter: 'brightness(1.8) blur(8px)' }, { clipPath: 'inset(0 0 0% 0)', filter: 'brightness(1) blur(0px)', duration: 1.3, ease: 'power3.inOut', clearProps: 'filter,clipPath', delay: 0.2 }),
        )
        // Treść: każdy blok wyostrza się przy wejściu; śródtytuły — linie z maski
        q<HTMLElement>('[data-article-body] .article-body > *').forEach((el) => {
          if (el.tagName === 'H2') splitHeading(el)
          else revealBlur(el, el, { duration: 0.8 })
        })
        q<HTMLElement>(`${sel(a.faqTitle)}, ${sel(a.commentsTitle)}`).forEach((el) => splitHeading(el))
        q<HTMLElement>(sel(a.faqList)).forEach((list) => staggerIn(Array.from(list.children), list, 'x'))
        q<HTMLDetailsElement>(`details${sel(a.faqItem)}`).forEach((d) => cleanups.push(accordion(d, () => d.querySelector<HTMLElement>(':scope > p, :scope > div'))))
        q<HTMLElement>(sel(a.commentList)).forEach((list) => staggerIn(Array.from(list.children), list))

        // ── Polityki ──
        q<HTMLElement>(sel(legal.updated)).forEach((el) => scrambleIn(el))
        q<HTMLElement>(sel(legal.sectionTitle)).forEach((el) => splitHeading(el))
        q<HTMLElement>(`${sel(legal.body)} > *`).forEach((el) => revealBlur(el, el, { duration: 0.8 }))

        // ── Kontakt: lead i pola formularza po kolei ──
        q<HTMLElement>('form[novalidate]').forEach((form) => {
          staggerIn(Array.from(form.children).filter((c) => !c.hasAttribute('aria-hidden')), form)
          const aside = form.closest('[data-contact-wrap]')?.previousElementSibling
          if (aside) gsap.fromTo(Array.from(aside.children), { opacity: 0, y: move(20), filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, stagger: 0.12, ease: 'power3.out', clearProps: 'filter,transform', delay: 0.3 })
        })

        ScrollTrigger.sort()
        ScrollTrigger.refresh()
        return () => cleanups.forEach((fn) => fn())
      })
      return () => mm.revert()
    },
    { dependencies: [pathname], revertOnUpdate: true },
  )

  return null
}
