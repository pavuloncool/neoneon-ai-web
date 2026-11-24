'use client'

// components/home/Process.tsx
// Jak pracuję (brief 5.6): efekt „pióro”.
//
// Desktop (≥1024 px, bez ograniczenia ruchu): sekcja przypięta, kroki przesuwają się poziomo (scrub 1,
// długość = szerokość treści). Przez wszystkie kroki biegnie jedna linia jak pociągnięcie pióra — DrawSVG
// zsynchronizowany ze scrollem; po ścieżce jedzie znacznik (MotionPath). Przy kroku 4 („Budowa z AI”)
// fragment linii zamienia się w krótki ciąg znaków kodu w --accent-ai — jedyne miejsce w kolorze AI,
// spójnie z sub-hero. Numer kroku przy wejściu do środka ekranu: ScrambleText cyfr, 0,4 s.
// Mobile: kroki pionowo, linia rysowana w dół po lewej stronie (scrub), bez pinu.
// Reduce / bez JS: pionowa lista, linia narysowana, kroki statyczne.
//
// Układ poziomy ustawia CSS (styles/globals.css, „Jak pracuję”) pod html.js + media query — od pierwszego
// malowania, bez przeskoku po hydracji. Geometrię linii poziomej liczy JS z pozycji kroków
// (i liczy ponownie przy każdym odświeżeniu ScrollTriggera, np. po zmianie szerokości okna).

import { useRef } from 'react'
import { gsap, motionEnabled, markMotionReady } from '@/lib/gsap'
import '@/lib/gsap-text'
import '@/lib/gsap-svg'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { PIN } from '@/lib/motion'

export interface ProcessStep {
  title: string
  text: string
}

const AI_STEP = 3 // krok 4 (indeks od 0)
const LINE_Y = 34 // wysokość linii w SVG toru (px)
const CODE = '{ build: ai(), review: me }'

// Pozioma ścieżka „pióra” przez podane punkty x: łagodne fale na przemian w górę i w dół
function penPath(xs: number[], startUp: boolean): string {
  let d = `M${xs[0]},${LINE_Y}`
  for (let i = 1; i < xs.length; i++) {
    const a = xs[i - 1]
    const b = xs[i]
    const dy = ((i + (startUp ? 0 : 1)) % 2 ? -1 : 1) * 9
    d += ` C${a + (b - a) * 0.35},${LINE_Y + dy} ${a + (b - a) * 0.65},${LINE_Y - dy} ${b},${LINE_Y}`
  }
  return d
}

export function Process({ id, title, lead, steps }: { id: string; title: string; lead: string; steps: ProcessStep[] }) {
  const root = useRef<HTMLElement>(null)

  useSectionMotion(root, ({ desktop, reduce }) => {
    const el = root.current
    if (!el) return
    if (!motionEnabled() || reduce) {
      markMotionReady()
      return
    }
    markMotionReady()

    const q = gsap.utils.selector(el)
    const stepEls = q('[data-process-step]') as HTMLElement[]
    const nums = q('[data-process-num]') as HTMLElement[]

    if (!desktop) {
      // Mobile: linia pionowa rysowana w dół razem ze scrollem
      const vpath = el.querySelector<SVGPathElement>('[data-process-vline] path')!
      gsap.fromTo(
        vpath,
        { drawSVG: '0%' },
        { drawSVG: '100%', ease: 'none', scrollTrigger: { trigger: q('[data-process-track]')[0], start: 'top 70%', end: 'bottom 70%', scrub: true } },
      )
      return
    }

    const pinEl = q('[data-process-pin]')[0] as HTMLElement
    const viewport = q('[data-process-viewport]')[0] as HTMLElement
    const track = q('[data-process-track]')[0] as HTMLElement
    const svg = el.querySelector<SVGSVGElement>('[data-process-hline]')!
    const segA = el.querySelector<SVGPathElement>('[data-process-seg="a"]')!
    const segB = el.querySelector<SVGPathElement>('[data-process-seg="b"]')!
    const guide = el.querySelector<SVGPathElement>('[data-process-guide]')!
    const marker = el.querySelector<SVGCircleElement>('[data-process-marker]')!
    const code = q('[data-process-code]')[0] as HTMLElement

    const distance = () => Math.max(0, track.scrollWidth - viewport.clientWidth)
    const share = { a: 0.6, c: 0.1, b: 0.3 } // udział odcinków w długości linii (liczony w build)

    // Geometria linii z bieżących pozycji kroków
    const build = () => {
      const W = track.scrollWidth
      svg.setAttribute('width', String(W))
      svg.setAttribute('viewBox', `0 0 ${W} ${LINE_Y * 2}`)
      const xs = stepEls.map((s) => s.offsetLeft)
      const last = stepEls[stepEls.length - 1]
      const end = last.offsetLeft + last.offsetWidth * 0.55
      const codeStart = xs[AI_STEP] - 12
      const codeEnd = codeStart + code.offsetWidth + 24
      const before = [...xs.slice(0, AI_STEP), codeStart]
      const after = [codeEnd, ...xs.slice(AI_STEP + 1), end]
      const dA = penPath(before, true)
      const dB = penPath(after, AI_STEP % 2 === 0)
      segA.setAttribute('d', dA)
      segB.setAttribute('d', dB)
      guide.setAttribute('d', `${dA} L${codeEnd},${LINE_Y} ${dB.replace(/^M[^C]+/, '')}`)
      gsap.set(code, { left: codeStart + 12, top: LINE_Y - 11 })
      const la = segA.getTotalLength()
      const lb = segB.getTotalLength()
      const lc = codeEnd - codeStart
      const total = la + lb + lc
      share.a = la / total
      share.c = lc / total
      share.b = lb / total
    }
    build()

    gsap.set([segA, segB], { drawSVG: '0%' })
    gsap.set(code, { clipPath: 'inset(0 100% 0 0)' })

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: pinEl,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: PIN.processScrub,
        invalidateOnRefresh: true,
        onRefreshInit: build,
      },
    })
    tl.to(track, { x: () => -distance(), duration: 1 }, 0)
      // Udziały odcinków z pierwszego pomiaru (po zmianie szerokości proporcje zmieniają się minimalnie;
      // długości ścieżek DrawSVG i tak przelicza przy odświeżeniu)
      .fromTo(segA, { drawSVG: '0%' }, { drawSVG: '100%', duration: share.a }, 0)
      .fromTo(code, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: share.c }, share.a)
      .fromTo(segB, { drawSVG: '0%' }, { drawSVG: '100%', duration: share.b }, share.a + share.c)
      .to(marker, { motionPath: { path: guide, align: guide, alignOrigin: [0.5, 0.5] }, duration: 1 }, 0)

    // Numer kroku: ScrambleText cyfr, gdy krok wjeżdża do środka ekranu
    stepEls.forEach((step, i) => {
      ScrollTrigger.create({
        trigger: step,
        containerAnimation: tl,
        start: 'left 60%',
        onEnter: () =>
          gsap.to(nums[i], { duration: 0.4, scrambleText: { text: nums[i].dataset.n ?? '', chars: '0123456789' }, overwrite: 'auto' }),
      })
    })
  })

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} data-process className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div data-process-pin className="process-pin py-20 md:py-28">
        <div className="w-full max-w-6xl mx-auto px-6">
          <h2 id={`${id}-title`} className="font-display font-light text-4xl md:text-5xl leading-tight">
            {title}
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted max-w-3xl">{lead}</p>
        </div>

        <div data-process-viewport className="process-viewport mt-14">
          <ol data-process-track className="process-track relative max-w-6xl mx-auto px-6">
            {/* Linia pionowa (mobile, reduce, bez JS) */}
            <svg
              data-process-vline
              aria-hidden="true"
              className="process-vline absolute left-[1.9rem] top-2 bottom-2 w-4 h-[calc(100%-1rem)] overflow-visible"
              viewBox="0 0 16 1000"
              preserveAspectRatio="none"
            >
              <path d="M8,0 C13,140 3,280 8,420 S13,700 8,840 S4,960 8,1000" fill="none" stroke="var(--accent-edit)" strokeWidth={2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>

            {/* Linia pozioma (desktop): odcinki „pióra”, ścieżka prowadząca znacznika, ciąg kodu przy kroku 4 */}
            <svg data-process-hline aria-hidden="true" className="process-hline absolute left-0 top-0 h-[68px] overflow-visible pointer-events-none">
              <path data-process-seg="a" fill="none" stroke="var(--accent-edit)" strokeWidth={2.2} strokeLinecap="round" />
              <path data-process-seg="b" fill="none" stroke="var(--accent-edit)" strokeWidth={2.2} strokeLinecap="round" />
              <path data-process-guide fill="none" stroke="none" />
              <circle data-process-marker r={5} cx={0} cy={0} className="fill-ink dark:fill-paper" />
            </svg>
            <span data-process-code aria-hidden="true" className="process-code absolute whitespace-nowrap font-mono text-[13px] leading-[22px] text-accent-ai">
              {CODE}
            </span>

            {steps.map((step, i) => {
              const n = String(i + 1).padStart(2, '0')
              return (
                <li key={step.title} data-process-step className="process-step relative pl-16 pb-12 last:pb-0">
                  <span data-process-num data-n={n} className={`font-mono text-lg leading-none ${i === AI_STEP ? 'text-accent-ai' : 'text-muted'}`}>
                    {n}
                  </span>
                  <h3 className="mt-3 font-display text-3xl leading-tight">{step.title}</h3>
                  <p className="mt-3 text-[16px] leading-relaxed text-muted max-w-md">{step.text}</p>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
