'use client'

// components/sygnal/SygnalPage.tsx
// Prototyp kierunku „Sygnał” (płótno: S01–S07): kosmiczny neon z NeonEdge + jedno koło jako nawigacja.
// Ruch (GSAP, gsap.matchMedia):
// - hero: logo w mgle rozjaśniane kursorem (CSS mask, zmienne --mx/--my),
// - koło: z miejsca w hero (.dialAnchor) zjeżdża do prawego dolnego rogu (scrub); łuk i liczba sygnału
//   = postęp czytania strony; po kliknięciu — mapa (SignalMap),
// - proces (desktop): sekcja przypięta, etapy przechodzą z rozmycia w ostrość.
// Reduce: koło przeskakuje do rogu bez animacji, proces to zwykła lista, bez omiatania radaru.

import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { Link } from '@/i18n/navigation'
import { ScrollTrigger, refreshAfterFonts } from '@/lib/gsap-scroll'
import { SignalDial, type DialItem } from './SignalDial'
import { SignalMap } from './SignalMap'
import { DIAL_LABELS, MAP_LABELS } from './labels'
import { PUBLIC_CONTACT_EMAIL } from '@/lib/site'
import s from './sygnal.module.css'
import d from './dial.module.css'

const SECTIONS: (DialItem & { id: string })[] = [
  { id: 'start', key: 'start', href: '#start', label: 'Start', summary: 'Wiesz, co oferujesz. Teraz to sprzedaj.' },
  { id: 'rola-ai', key: 'rola-ai', href: '#rola-ai', label: 'Rola AI', summary: 'AI pisze kod. Decyzje zostają po stronie ludzi.' },
  { id: 'proces', key: 'proces', href: '#proces', label: 'Proces', summary: 'Pięć etapów. Jedna droga od mgły do strony.' },
  { id: 'uslugi', key: 'uslugi', href: '#uslugi', label: 'Usługi', summary: 'Trzy sposoby współpracy.' },
  { id: 'rozmowa', key: 'rozmowa', href: '#rozmowa', label: 'Rozmowa', summary: 'Rozmowa, po której wiesz, co dalej.' },
]

const STAGES = [
  { no: '01', name: 'Rozmowa', title: 'Masz ofertę w głowie. Na papierze robi się mgła.', body: 'Pytania o klientów, ofertę, konkurencję — i o to, czego nie chcesz obiecywać.' },
  { no: '02', name: 'Decyzje', title: 'Decyzje przed pierwszym słowem.', body: 'Dla kogo jest strona, jakie ma podstrony i co ma zrobić odwiedzający.' },
  { no: '03', name: 'Tekst', title: 'Twoja strona wylicza funkcje. Klient szuka efektu.', body: 'Teksty, w których klient rozpoznaje własny problem. Akceptujesz je przed budową, nie po.' },
  { no: '04', name: 'Kod — AI', title: '{ budowa z ai }', body: 'Kod powstaje szybko, bo wiadomo, co ma robić. Każda zmiana przechodzi przegląd, a podgląd strony jest online.', ai: true },
  { no: '05', name: 'Wdrożenie', title: 'Strona działa. Klient rozumie ją w pięć sekund.', body: 'Publikacja, metadane, mapa strony, pierwsze pomiary. Uwagi z przeglądu wchodzą przed startem.' },
]

const DOCK = { desktop: 104, mobile: 72, margin: 24 } // margin = --dock-m w dial.module.css

export function SygnalPage() {
  const page = useRef<HTMLDivElement>(null)
  const hero = useRef<HTMLElement>(null)
  const anchor = useRef<HTMLDivElement>(null)
  const dial = useRef<HTMLElement>(null)
  const rim = useRef<HTMLOListElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const arc = useRef<SVGCircleElement>(null)
  const process = useRef<HTMLElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const progressRef = useRef(0)

  const [size, setSize] = useState(480)
  const [docked, setDocked] = useState(false)
  const [current, setCurrent] = useState('start')
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)

  // Tło strony pod spodem (overscroll) też ciemne
  useEffect(() => {
    const prev = document.body.style.background
    document.body.style.background = '#0A0A0B'
    // scroll-behavior: smooth (globals.css) psuje pomiary ScrollTriggera przy pinie — tu przewijamy w JS
    const html = document.documentElement
    const prevBehavior = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    return () => {
      document.body.style.background = prev
      html.style.scrollBehavior = prevBehavior
    }
  }, [])

  // Rozmiar koła = rozmiar miejsca w hero
  useEffect(() => {
    const el = anchor.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize(Math.round(el.getBoundingClientRect().width)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Mgła: maska podąża za kursorem
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const fog = e.currentTarget.querySelector<HTMLElement>('[data-fog]')
    if (!fog) return
    const r = fog.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }, [])

  useGSAP(
    () => {
      const dialEl = dial.current
      const heroEl = hero.current
      const anchorEl = anchor.current
      if (!dialEl || !heroEl || !anchorEl) return

      const dockSize = () => (window.innerWidth >= 1024 ? DOCK.desktop : DOCK.mobile)
      // Przesunięcie z naturalnej pozycji (prawy dolny róg) do miejsca w hero — liczone dla scrollY = 0
      const delta = () => {
        const a = anchorEl.getBoundingClientRect()
        const cx = a.left + a.width / 2
        const cy = a.top + window.scrollY + a.height / 2
        const nx = window.innerWidth - DOCK.margin - size / 2
        const ny = window.innerHeight - DOCK.margin - size / 2
        return { x: cx - nx, y: cy - ny }
      }
      const dockTransform = () => {
        const sc = dockSize() / size
        // naturalny środek zostaje; po skali koło ma się mieścić w rogu z marginesem
        return { x: size / 2 - dockSize() / 2, y: size / 2 - dockSize() / 2, scale: sc }
      }
      document.documentElement.style.setProperty('--dock', `${dockSize()}px`)

      // Postęp czytania → liczba i łuk sygnału
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: 'top top',
        end: 'bottom bottom',
        refreshPriority: -1,
        onUpdate: (self) => {
          const p = Math.min(99, Math.round(self.progress * 99))
          if (num.current) num.current.textContent = String(p).padStart(2, '0')
          arc.current?.setAttribute('stroke-dasharray', `${p} ${100 - p}`)
          progressRef.current = p
          // Bieżąca sekcja: ostatnia, której górna krawędź minęła 55% wysokości okna
          const line = window.innerHeight * 0.55
          let id = SECTIONS[0].id
          for (const sec of SECTIONS) {
            const el = document.getElementById(sec.id)
            if (el && el.getBoundingClientRect().top <= line) id = sec.id
          }
          setCurrent(id)
        },
      })

      const mm = gsap.matchMedia()
      mm.add(
        { motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' },
        (ctx) => {
          const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean }
          const fades = [rim.current, ...Array.from(dialEl.querySelectorAll('[data-dial-fade]'))].filter(Boolean)

          if (motion) {
            gsap.fromTo(
              dialEl,
              { x: () => delta().x, y: () => delta().y, scale: 1 },
              {
                x: () => dockTransform().x,
                y: () => dockTransform().y,
                scale: () => dockTransform().scale,
                ease: 'power2.inOut',
                immediateRender: true,
                scrollTrigger: {
                  trigger: heroEl,
                  start: 'top top',
                  end: 'bottom 30%',
                  scrub: 0.6,
                  invalidateOnRefresh: true,
                  onLeave: () => setDocked(true),
                  onEnterBack: () => setDocked(false),
                },
              },
            )
            gsap.to(fades, {
              opacity: 0,
              ease: 'none',
              scrollTrigger: { trigger: heroEl, start: 'top top', end: '35% top', scrub: true },
            })
          } else {
            // Bez animacji: koło stoi w hero, po jego minięciu przeskakuje do rogu
            const toHero = () => {
              gsap.set(dialEl, { ...delta(), scale: 1 })
              gsap.set(fades, { opacity: 1 })
              setDocked(false)
            }
            const toDock = () => {
              gsap.set(dialEl, dockTransform())
              gsap.set(fades, { opacity: 0 })
              setDocked(true)
            }
            toHero()
            ScrollTrigger.create({ trigger: heroEl, start: 'bottom 30%', onEnter: toDock, onLeaveBack: toHero, onRefresh: (self) => (self.progress > 0 ? toDock() : toHero()) })
          }
          dialEl.setAttribute('data-ready', '')

          // Proces: przypięta scena z rozmyciem (desktop, pełny ruch)
          const procEl = process.current
          if (motion && desktop && procEl) {
            procEl.classList.add(s.pinned)
            const stages = gsap.utils.toArray<HTMLElement>('[data-stage]', procEl)
            const marks = gsap.utils.toArray<HTMLElement>('[data-mark]', procEl)
            const bigNo = procEl.querySelector<HTMLElement>('[data-big-no]')
            const mark = (i: number) => {
              marks.forEach((m, j) => (j <= i ? m.setAttribute('data-on', '') : m.removeAttribute('data-on')))
              if (bigNo) bigNo.textContent = STAGES[i].no
            }
            gsap.set(stages.slice(1), { opacity: 0, filter: 'blur(14px)', y: 50 })
            mark(0)
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: procEl,
                pin: true,
                start: 'top top',
                end: () => `+=${window.innerHeight * (stages.length - 1) * 0.9}`,
                scrub: 0.6,
                invalidateOnRefresh: true,
                onUpdate: (self) => mark(Math.round(self.progress * (stages.length - 1))),
              },
            })
            stages.forEach((st, i) => {
              if (i === 0) return
              tl.to(stages[i - 1], { opacity: 0, filter: 'blur(14px)', y: -50, duration: 1 }).to(
                st,
                { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 },
                '<0.25',
              )
            })
            return () => {
              procEl.classList.remove(s.pinned)
            }
          }
        },
      )
      refreshAfterFonts()
      return () => mm.revert()
    },
    // revertOnUpdate: przy zmianie rozmiaru koła stare triggery (w tym pin procesu) muszą zniknąć przed nowymi
    { scope: page, dependencies: [size], revertOnUpdate: true },
  )

  const openMap = () => {
    opener.current = document.activeElement as HTMLElement
    setProgress(progressRef.current)
    setOpen(true)
  }
  const closeMap = () => {
    setOpen(false)
    requestAnimationFrame(() => opener.current?.focus())
  }
  const navigate = (id: string) => {
    setOpen(false)
    const el = document.getElementById(id)
    if (!el) return
    // Przypięta sekcja siedzi w .pin-spacer — przewijamy do niego, nie do elementu (ten bywa position: fixed)
    const target = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
    window.scrollTo({
      top: target.getBoundingClientRect().top + window.scrollY,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
    el.focus({ preventScroll: true })
  }
  // Kotwice na stronie (#…) przewijamy w JS — globalne scroll-behavior: smooth jest tu wyłączone
  const onPageClick = (e: React.MouseEvent) => {
    if (e.defaultPrevented) return
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]')
    if (!a) return
    const id = a.getAttribute('href')!.slice(1)
    if (!document.getElementById(id)) return
    e.preventDefault()
    navigate(id)
  }

  const curLabel = SECTIONS.find((x) => x.id === current)?.label ?? ''

  return (
    <div ref={page} className={s.page} onClick={onPageClick}>
      <div className={s.grid} aria-hidden="true">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
      <div className={s.dust} aria-hidden="true" />

      <a href="#tresc" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-[#CCFF00] focus:px-4 focus:py-2 focus:text-black">
        Przejdź do treści
      </a>

      {/* ── HERO ── */}
      <header id="start" tabIndex={-1} ref={hero} className={`${s.wrap} ${s.hero}`} onPointerMove={onPointerMove}>
        <div className={s.glow} aria-hidden="true" />
        <div className={s.bar}>
          <a href="#start" className={s.logo} aria-label="neoneon — start">
            NEONEON
          </a>
          <div className={s.lang} role="group" aria-label="Język">
            <span className={s.mono} aria-current="true">
              pl
            </span>
            <Link href="/" locale="en" className={s.mono}>
              en
            </Link>
          </div>
          <a href="#rozmowa" className={`${s.btn} ${s.btnLime}`} style={{ minHeight: 44 }}>
            Umów rozmowę
          </a>
        </div>

        <p className={`${s.mono} ${s.eyebrow}`}>
          Teksty · strategia treści · strony budowane z AI
          <br />
          Dla firm, które sprzedają ludziom — nie działom zakupów
        </p>

        <div className={s.fog} aria-hidden="true" data-fog="">
          <p className={s.fogBlur}>NEONEON</p>
          <p className={s.fogSharp}>NEONEON</p>
        </div>
        <div ref={anchor} className={s.dialAnchor} aria-hidden="true" />

        <div id="tresc" tabIndex={-1}>
          <h1 className={s.h1}>
            Wiesz, co oferujesz.
            <br />
            <span>Teraz to sprzedaj.</span>
          </h1>
          <div className={s.heroFoot}>
            <p className={s.lead}>
              Twoja usługa działa — widać to w każdym projekcie. Trudność zaczyna się przy opisie. Oferta, tekst i strona
              powstają tu w jednym procesie: decyzje zostają po stronie ludzi, kod pisze AI.
            </p>
            <div>
              <div className={s.ctas}>
                <a href="#rozmowa" className={`${s.btn} ${s.btnLime}`}>
                  Umów rozmowę <span aria-hidden="true">→</span>
                </a>
                <a href="#proces" className={`${s.btn} ${s.btnGhost}`}>
                  Zobacz proces
                </a>
              </div>
              <p className={`${s.mono} ${s.facts}`}>
                <b>●</b> 30 minut &nbsp; <b>●</b> bez zobowiązań &nbsp; <b>●</b> plan na wyjście
              </p>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* ── ROLA AI ── */}
        <section id="rola-ai" tabIndex={-1} className={`${s.wrap} ${s.section}`} aria-labelledby="h-rola">
          <p className={`${s.mono} ${s.label}`}>02 · Rola AI</p>
          <h2 id="h-rola" className={s.h2}>
            AI to narzędzie do kodowania. <span style={{ color: '#CCFF00' }}>Nie do decyzji.</span>
          </h2>
          <p className={s.body} style={{ marginTop: 24 }}>
            Budowa strony ma cztery etapy. W pierwszych trzech AI może podpowiadać, ale nie zna Twojego rynku, klientów ani
            tego, co odróżnia Cię od konkurencji.
          </p>
          <div className={s.roles}>
            <div className={s.role}>
              <h3>Decyzje</h3>
              <p>Dla kogo jest strona, co ma sprzedawać, czego nie obiecujemy.</p>
            </div>
            <div className={s.role}>
              <h3>Projekt</h3>
              <p>Struktura, kolejność sekcji, ton i teksty.</p>
            </div>
            <div className={s.role}>
              <h3>Plan</h3>
              <p>Zakres, podstrony, tematy na bloga, terminy.</p>
            </div>
            <div className={`${s.role} ${s.roleAi}`}>
              <h3>{'{ kod }'}</h3>
              <p>Komponenty, animacje, wdrożenie — z AI, z przeglądem każdej zmiany.</p>
            </div>
          </div>
        </section>

        {/* ── PROCES ── */}
        <section id="proces" tabIndex={-1} ref={process} className={`${s.wrap} ${s.section}`} aria-labelledby="h-proces">
          <p className={`${s.mono} ${s.label}`}>03 · Proces</p>
          <h2 id="h-proces" className={s.h2} style={{ fontSize: 'clamp(28px, 2.6vw, 38px)', fontWeight: 600, textTransform: 'none', maxWidth: 'none' }}>
            Pięć etapów. Jedna droga od mgły do strony.
          </h2>
          <ol className={s.stages}>
            {STAGES.map((st) => (
              <li key={st.no} data-stage="" className={`${s.stage} ${st.ai ? s.stageAi : ''}`}>
                <p className={`${s.mono} ${s.stageNo}`}>
                  <b>Etap {st.no}</b> &nbsp;—— {st.name}
                </p>
                <h3>{st.title}</h3>
                <p className={s.body}>{st.body}</p>
              </li>
            ))}
          </ol>
          <p className={s.bigNo} data-big-no="" aria-hidden="true">
            01
          </p>
          <ol className={`${s.track} ${s.mono}`} aria-hidden="true">
            {STAGES.map((st) => (
              <li key={st.no} data-mark="" data-ai={st.ai ? '' : undefined}>
                <i />
                {st.no} {st.name}
              </li>
            ))}
          </ol>
        </section>

        {/* ── USŁUGI ── */}
        <section id="uslugi" tabIndex={-1} className={`${s.wrap} ${s.section}`} aria-labelledby="h-uslugi">
          <p className={`${s.mono} ${s.label}`}>04 · Usługi</p>
          <h2 id="h-uslugi" className={s.h2}>
            Trzy sposoby współpracy.
          </h2>
          <div className={s.services}>
            <details className={s.service}>
              <summary>
                <span className={s.mono} style={{ fontSize: 11, color: 'rgba(242,242,238,.66)' }}>01</span>
                <h3>Tekst na stronę</h3>
                <span className={`${s.mono} tags`} style={{ fontSize: 10.5, color: 'rgba(242,242,238,.66)' }}>Copywriting · redakcja</span>
                <span className={s.plus} aria-hidden="true" />
              </summary>
              <div className={s.serviceBody}>
                <span />
                <p className={s.body} style={{ margin: 0 }}>
                  Rozmowa, z której powstają teksty strony głównej, oferty, zakładki o mnie i FAQ. Albo redakcja tego, co już masz,
                  także tekstów pisanych z AI.
                </p>
                <ul className={s.bul}>
                  <li>Wywiad zamiast briefu do samodzielnego wypełnienia</li>
                  <li>Struktura strony i kolejność argumentów</li>
                  <li>Teksty po polsku i angielsku</li>
                  <li>Metadane SEO i FAQ pod wyszukiwarki i asystentów AI</li>
                </ul>
              </div>
            </details>
            <details className={s.service} open>
              <summary>
                <span className={s.mono} style={{ fontSize: 11, color: 'rgba(242,242,238,.66)' }}>02</span>
                <h3>Strona od decyzji do wdrożenia</h3>
                <span className={`${s.mono} tags`} style={{ fontSize: 10.5, color: 'rgba(242,242,238,.66)' }}>Landing · www · web app</span>
                <span className={s.plus} aria-hidden="true" />
              </summary>
              <div className={s.serviceBody}>
                <span />
                <div>
                  <p className={s.body} style={{ margin: 0 }}>
                    Najpierw decyzja, co strona ma robić. Potem budowa z AI jako narzędziem do kodowania — na Next.js i Sanity, z
                    panelem do samodzielnej zmiany tekstów.
                  </p>
                  <a href="#rozmowa" className={`${s.btn} ${s.btnLime}`} style={{ marginTop: 22 }}>
                    Porozmawiajmy o stronie <span aria-hidden="true">→</span>
                  </a>
                </div>
                <ul className={s.bul}>
                  <li>Landing page pod jedną usługę lub kampanię</li>
                  <li>Strona firmowa z blogiem</li>
                  <li>Prosta aplikacja webowa: formularze, kalkulatory, zapisy</li>
                  <li>Wdrożenie na Vercel i przegląd każdej zmiany przed publikacją</li>
                </ul>
              </div>
            </details>
            <details className={s.service}>
              <summary>
                <span className={s.mono} style={{ fontSize: 11, color: 'rgba(242,242,238,.66)' }}>03</span>
                <h3>Treści, które pracują dalej</h3>
                <span className={`${s.mono} tags`} style={{ fontSize: 10.5, color: 'rgba(242,242,238,.66)' }}>Content · widoczność w AI</span>
                <span className={s.plus} aria-hidden="true" />
              </summary>
              <div className={s.serviceBody}>
                <span />
                <p className={s.body} style={{ margin: 0 }}>
                  Plan bloga i artykuły, które odpowiadają na pytania Twoich klientów i dają asystentom AI powód, żeby Cię cytować.
                </p>
                <ul className={s.bul}>
                  <li>Plan tematów oparty na pytaniach klientów</li>
                  <li>Artykuły eksperckie i advertoriale</li>
                  <li>Aktualizacja starych treści</li>
                  <li>Sprawdzenie, jak Twoja firma wypada w ChatGPT, Perplexity, Gemini i Google</li>
                </ul>
              </div>
            </details>
          </div>
        </section>

        {/* ── ROZMOWA ── */}
        <section id="rozmowa" tabIndex={-1} className={`${s.wrap} ${s.section}`} aria-labelledby="h-rozmowa">
          <p className={`${s.mono} ${s.label}`}>05 · Rozmowa</p>
          <div className={s.talk}>
            <div>
              <h2 id="h-rozmowa" className={s.h2}>
                Rozmowa,
                <br />
                po której wiesz,
                <br />
                co dalej.
              </h2>
              <p className={s.body} style={{ marginTop: 24 }}>
                Pierwsza rozmowa nie jest sprzedażowa. Ustalamy, gdzie gubisz klienta i co naprawić najpierw.
              </p>
              <Link href="/kontakt" className={`${s.btn} ${s.btnLime}`} style={{ marginTop: 18 }}>
                Wybierz termin <span aria-hidden="true">→</span>
              </Link>
              <p className={`${s.mono} ${s.facts}`}>Online · 30 minut · bezpłatnie · kalendarz w kolejnej iteracji</p>
            </div>
            <ol className={s.promises}>
              <li>
                <span className={s.mono}>01</span>Opisujesz ofertę własnymi słowami.
              </li>
              <li>
                <span className={s.mono}>02</span>Widzisz, w którym miejscu klient się gubi.
              </li>
              <li>
                <span className={s.mono}>03</span>Wiesz, czego nie trzeba robić wcale.
              </li>
              <li>
                <span className={s.mono}>04</span>Zostajesz z notatką — nawet bez dalszej współpracy.
              </li>
            </ol>
          </div>
        </section>
      </main>

      <footer className={`${s.foot} ${s.mono}`}>
        <span>© 2026 neoneon</span>
        <a href="mailto:web@neoneon.online">web@neoneon.online</a>
        <span>Prototyp „Sygnał” — noindex</span>
      </footer>

      <SignalDial
        ref={dial}
        items={SECTIONS}
        current={current}
        docked={docked}
        size={size}
        labels={DIAL_LABELS.pl}
        numRef={num}
        arcRef={arc}
        rimRef={rim}
        onOpen={openMap}
      />
      <p className={d.dockLabel} data-on={docked ? '' : undefined} aria-hidden="true">
        {curLabel}
        <span>spis strony</span>
      </p>

      {open && (
        <SignalMap
          items={SECTIONS}
          current={current}
          progress={progress}
          labels={MAP_LABELS.pl}
          talkHref="#rozmowa"
          email={PUBLIC_CONTACT_EMAIL}
          aside={
            <>
              <h2>Blog</h2>
              <p style={{ margin: 0 }}>
                <Link href="/blog">Wszystkie artykuły →</Link>
              </p>
            </>
          }
          onClose={closeMap}
          onNavigate={(item) => navigate(item.key)}
        />
      )}
    </div>
  )
}
