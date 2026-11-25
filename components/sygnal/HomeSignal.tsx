'use client'

// components/sygnal/HomeSignal.tsx
// Strona główna „Sygnał”: hero (mgła z logo rozjaśniana kursorem, nagłówek) i jedno koło jako nawigacja.
// Koło startuje duże w hero (.dialAnchor) i zjeżdża do prawego dolnego rogu (scrub); łuk i liczba =
// postęp czytania; kliknięcie — mapa z pełną listą sekcji. Sekcje strony (serwerowe) przychodzą jako children.
// Proces (pełny ruch): sekcja [data-process] przypięta, etapy przechodzą z rozmycia w ostrość.
// Reduce: koło przeskakuje do rogu bez animacji, proces to zwykła lista. Na tej stronie nie ma koła
// z layoutu (SiteDial zwraca null dla „/”).

import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap, useGSAP, motionEnabled, markMotionReady, FULL_MOTION } from '@/lib/gsap'
import { Link } from '@/i18n/navigation'
import { ScrollTrigger, refreshAfterFonts } from '@/lib/gsap-scroll'
import { SignalDial, type DialItem } from './SignalDial'
import { SignalMap } from './SignalMap'
import { MapAside, SignalLanguage } from './SiteChrome'
import { heroIntro, sectionsMotion } from './home/homeMotion'
import { setLite } from './motionKit'
import { CHROME_LABELS, DIAL_LABELS, MAP_LABELS } from './labels'
import type { Locale } from '@/lib/locales'
import s from './sygnal.module.css'
import d from './dial.module.css'

// Pozycja koła: grupa sekcji (ids) — przejście do pierwszej z `href`, podświetlenie przy każdej z grupy
export type HomeDialItem = DialItem & { ids: string[] }

export interface HomeHeroTexts {
  eyebrow: string
  subtitle: string
  headline: [string, string]
  lead: string
  ctaPrimary: string
  ctaSecondary: string
}

const DOCK = { desktop: 104, mobile: 72, margin: 24 } // margin = --dock-m w dial.module.css

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

export function HomeSignal({
  locale,
  heroId,
  processId,
  hero: texts,
  dialItems,
  mapItems,
  contactHref,
  email,
  langLabels,
  children,
}: {
  locale: Locale
  heroId: string
  processId: string
  hero: HomeHeroTexts
  dialItems: HomeDialItem[]
  mapItems: DialItem[]
  contactHref: string
  email: string
  langLabels: { pl: string; en: string }
  children: React.ReactNode
}) {
  const page = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)
  const anchor = useRef<HTMLDivElement>(null)
  const dial = useRef<HTMLElement>(null)
  const rim = useRef<HTMLOListElement>(null)
  const num = useRef<HTMLSpanElement>(null)
  const arc = useRef<SVGCircleElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const progressRef = useRef(0)

  const [size, setSize] = useState(480)
  const [docked, setDocked] = useState(false)
  const [section, setSection] = useState(heroId) // bieżąca sekcja (id kotwicy)
  const [open, setOpen] = useState(false)
  const openRef = useRef(false) // stan mapy dla obsługi zdarzeń w useGSAP (bez nieaktualnych domknięć)
  useEffect(() => {
    openRef.current = open
  }, [open])
  const [progress, setProgress] = useState(0)

  // scroll-behavior: smooth (globals.css) psuje pomiary ScrollTriggera przy pinie — tu przewijamy w JS
  useEffect(() => {
    const html = document.documentElement
    const prev = html.style.scrollBehavior
    html.style.scrollBehavior = 'auto'
    return () => {
      html.style.scrollBehavior = prev
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

  // Mgła: maska podąża za kursorem (w trybie pływającego koła — za kołem, ustawia to ticker w useGSAP)
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.currentTarget.hasAttribute('data-floating')) return
    const fog = e.currentTarget.querySelector<HTMLElement>('[data-fog]')
    if (!fog) return
    const r = fog.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }, [])

  useGSAP(
    () => {
      const dialEl = dial.current
      const heroEl = heroRef.current
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
        return { x: size / 2 - dockSize() / 2, y: size / 2 - dockSize() / 2, scale: sc }
      }
      document.documentElement.style.setProperty('--dock', `${dockSize()}px`)

      // Postęp czytania → liczba i łuk; bieżąca sekcja — ostatnia, której górna krawędź minęła 55% okna
      const ids = mapItems.map((i) => i.href.slice(1))
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
          const line = window.innerHeight * 0.55
          let id = ids[0]
          for (const sid of ids) {
            const el = document.getElementById(sid)
            if (el && el.getBoundingClientRect().top <= line) id = sid
          }
          setSection(id)
        },
      })

      const mm = gsap.matchMedia()
      mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px)' }, (ctx) => {
        // desktop w warunkach: przy zmianie progu układ (i pin procesu) budujemy od nowa
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean }
        const fades = [rim.current, ...Array.from(dialEl.querySelectorAll('[data-dial-fade]'))].filter(Boolean)

        if (motion) {
          // EKSPERYMENT „pływające koło”: na górze strony koło płynie za kursorem i oświetla napis NEONEON;
          // ucieka do rogu dopiero z pierwszym przewinięciem — z miejsca, w którym akurat jest (origin).
          const origin = { x: 0, y: 0, set: false }
          const fly = gsap.fromTo(
            dialEl,
            { x: () => (origin.set ? origin.x : delta().x), y: () => (origin.set ? origin.y : delta().y), scale: 1 },
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

          const floating = desktop && window.matchMedia('(pointer: fine)').matches
          if (floating) {
            const fog = heroEl.querySelector<HTMLElement>('[data-fog]')
            const foot = heroEl.querySelector<HTMLElement>(`.${s.heroFoot}`)
            const qx = gsap.quickTo(dialEl, 'x', { duration: 1.1, ease: 'power3.out' })
            const qy = gsap.quickTo(dialEl, 'y', { duration: 1.1, ease: 'power3.out' })
            // Lot zawsze z bieżącego położenia koła (quickTo pamięta start z poprzedniego lotu — bez tego
            // koło przeskakiwało pod kursor zamiast przylecieć z rogu)
            const glide = (x: number, y: number) => {
              qx(x, Number(gsap.getProperty(dialEl, 'x')))
              qy(y, Number(gsap.getProperty(dialEl, 'y')))
            }
            let dockTween: gsap.core.Tween | null = null
            let atTop = window.scrollY < 2
            heroEl.setAttribute('data-floating', '')
            heroEl.style.setProperty('--lr', `${Math.round(size * 0.62)}px`)

            // Środek koła = kursor, w pasie między górą hero a przyciskami (koło nie zasłania CTA)
            const follow = (e: PointerEvent) => {
              if (!atTop) return
              const r = size / 2
              const heroTop = heroEl.getBoundingClientRect().top
              const footTop = foot ? foot.getBoundingClientRect().top : window.innerHeight
              const minY = heroTop + r * 0.7
              const maxY = Math.max(minY, footTop - r - 12)
              const cx = gsap.utils.clamp(r * 0.6, window.innerWidth - r * 0.6, e.clientX)
              const cy = gsap.utils.clamp(minY, maxY, e.clientY)
              glide(cx - (window.innerWidth - DOCK.margin - size / 2), cy - (window.innerHeight - DOCK.margin - size / 2))
            }
            // Światło spod koła: środek maski mgły i poświaty = środek koła (co klatkę)
            const light = () => {
              const b = dialEl.getBoundingClientRect()
              const h = heroEl.getBoundingClientRect()
              const cx = b.left + b.width / 2
              const cy = b.top + b.height / 2
              if (fog) {
                const f = fog.getBoundingClientRect()
                heroEl.style.setProperty('--mx', `${cx - f.left}px`)
                heroEl.style.setProperty('--my', `${cy - f.top}px`)
              }
              heroEl.style.setProperty('--lx', `${cx - h.left}px`)
              heroEl.style.setProperty('--ly', `${cy - h.top}px`)
              // Póki koło płynie, start lotu do rogu = jego bieżące położenie
              if (atTop) {
                origin.x = Number(gsap.getProperty(dialEl, 'x'))
                origin.y = Number(gsap.getProperty(dialEl, 'y'))
                origin.set = true
                fly.invalidate()
              }
            }
            // ── Poniżej hero — cztery fazy:
            //    1) na górze koło płynie za kursorem (wyżej), 2) przewijanie → koło ucieka do rogu,
            //    3) przewijanie stoi (czytanie, rozwijanie FAQ) → koło ZOSTAJE w rogu,
            //    4) kursor sam podjeżdża do koła w rogu (potwierdzona intencja) → koło rośnie w rogu wokół
            //       kursora (etykiety sekcji na obręczy) i towarzyszy mu obok, nie pod nim. Koło staje, gdy
            //       kursor się do niego zbliży (można kliknąć); kolejne przewinięcie — koło wraca do rogu.
            const MID = Math.min(size, 380)
            const midScale = MID / size
            const pointer = { x: 0, y: 0, known: false }
            let floatingMid = false
            const natural = () => ({ x: window.innerWidth - DOCK.margin - size / 2, y: window.innerHeight - DOCK.margin - size / 2 })
            const companion = () => {
              const R = MID / 2
              const gap = R + 28
              // Domyślnie po prawej i niżej od kursora; przy krawędzi — po drugiej stronie
              const right = pointer.x + gap + R <= window.innerWidth - 12
              const below = pointer.y + gap * 0.6 + R <= window.innerHeight - 12
              const cx = gsap.utils.clamp(R + 12, window.innerWidth - R - 12, pointer.x + (right ? gap : -gap))
              const cy = gsap.utils.clamp(R + 12, window.innerHeight - R - 12, pointer.y + (below ? gap * 0.6 : -gap * 0.6))
              const n = natural()
              return { x: cx - n.x, y: cy - n.y }
            }
            // Kursor zbliża się do koła → koło staje (żeby nie uciekało); rusza, gdy kursor wyraźnie odejdzie
            let frozen = false
            const holdStill = () => {
              const b = dialEl.getBoundingClientRect()
              const R = b.width / 2
              const d = Math.hypot(pointer.x - (b.left + R), pointer.y - (b.top + R))
              if (frozen) frozen = d < R * 1.9
              else frozen = d < R * 1.2
              return frozen
            }
            // Faza 4: kursor dotarł do koła w rogu → koło rośnie w rogu (kursor zostaje na kole, więc stoi)
            const pickUp = () => {
              if (openRef.current) return
              floatingMid = true
              frozen = true
              setDocked(false)
              dockTween?.kill()
              const R = MID / 2
              const n = natural()
              glide(window.innerWidth - R - 16 - n.x, window.innerHeight - R - 16 - n.y)
              gsap.to(dialEl, { scale: midScale, duration: 0.8, ease: 'power3.out' })
              gsap.to(fades, { opacity: 1, duration: 0.4, delay: 0.25 })
            }
            // Czy kursor jest przy kole zadokowanym w rogu
            const atDock = () => {
              if (floatingMid || atTop || dockTween?.isActive()) return false
              if (!fly.scrollTrigger || fly.scrollTrigger.progress < 1) return false
              const b = dialEl.getBoundingClientRect()
              const r = b.width / 2
              return Math.hypot(pointer.x - (b.left + r), pointer.y - (b.top + r)) < r * 1.35
            }
            const leaveMid = () => {
              floatingMid = false
              qx.tween.pause()
              qy.tween.pause()
              gsap.to(fades, { opacity: 0, duration: 0.25 })
              dockTween = gsap.to(dialEl, { ...dockTransform(), duration: 0.6, ease: 'power3.inOut', onComplete: () => setDocked(true) })
            }
            const trackPointer = (e: PointerEvent) => {
              pointer.x = e.clientX
              pointer.y = e.clientY
              pointer.known = true
              if (!floatingMid) {
                if (atDock()) pickUp()
                return
              }
              if (holdStill()) return
              const t = companion()
              glide(t.x, t.y)
            }

            const onScroll = () => {
              const top = window.scrollY < 2
              // Faza 2: przewijanie → koło (jeśli towarzyszyło kursorowi) wraca do rogu i tam zostaje
              if (floatingMid) leaveMid()
              if (atTop && !top) {
                // Pierwsze przewinięcie: koniec pływania, koło ucieka do rogu ze swojego miejsca
                // tylko tweeny podążania (lot do rogu też animuje x/y — tego nie ruszamy)
                qx.tween.pause()
                qy.tween.pause()
                heroEl.removeAttribute('data-lit')
              }
              if (!atTop && top) heroEl.setAttribute('data-lit', '')
              atTop = top
            }
            if (atTop) heroEl.setAttribute('data-lit', '')
            heroEl.addEventListener('pointermove', follow)
            window.addEventListener('pointermove', trackPointer, { passive: true })
            window.addEventListener('scroll', onScroll, { passive: true })
            gsap.ticker.add(light)
            ctx.add(() => () => {
              heroEl.removeEventListener('pointermove', follow)
              window.removeEventListener('pointermove', trackPointer)
              window.removeEventListener('scroll', onScroll)
              gsap.ticker.remove(light)
              heroEl.removeAttribute('data-floating')
              heroEl.removeAttribute('data-lit')
            })
          }
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
          ScrollTrigger.create({
            trigger: heroEl,
            start: 'bottom 30%',
            onEnter: toDock,
            onLeaveBack: toHero,
            onRefresh: (self) => (self.progress > 0 ? toDock() : toHero()),
          })
        }
        dialEl.setAttribute('data-ready', '')

        // Proces: przypięta scena z rozmyciem (desktop i telefon, pełny ruch)
        const procEl = page.current?.querySelector<HTMLElement>('[data-process]')
        if (motion && procEl) {
          procEl.classList.add(s.pinned)
          const stages = gsap.utils.toArray<HTMLElement>('[data-stage]', procEl)
          const marks = gsap.utils.toArray<HTMLElement>('[data-mark]', procEl)
          const bigNo = procEl.querySelector<HTMLElement>('[data-big-no]')
          const mark = (i: number) => {
            marks.forEach((m, j) => (j <= i ? m.setAttribute('data-on', '') : m.removeAttribute('data-on')))
            if (bigNo) bigNo.textContent = stages[i]?.dataset.stage ?? ''
          }
          gsap.set(stages.slice(1), { opacity: 0, filter: 'blur(14px)', y: 50 })
          mark(0)
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: procEl,
              pin: true,
              start: 'top top',
              end: () => `+=${window.innerHeight * (stages.length - 1) * 1.1}`,
              scrub: 0.6,
              invalidateOnRefresh: true,
              onUpdate: (self) => mark(Math.min(stages.length - 1, Math.floor(self.progress * stages.length))),
            },
          })
          // Każdy etap chwilę stoi ostry (postój), dopiero potem przechodzi w następny
          tl.to({}, { duration: 0.6 })
          stages.forEach((st, i) => {
            if (i === 0) return
            if (i > 1) tl.to({}, { duration: 0.6 })
            tl.to(stages[i - 1], { opacity: 0, filter: 'blur(14px)', y: -50, duration: 1 }).to(
              st,
              { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1 },
              '<0.25',
            )
          })
          // Ostatni etap też stoi ostry, zanim sekcja puści
          tl.to({}, { duration: 0.8 })
          return () => {
            procEl.classList.remove(s.pinned)
          }
        }
      })
      // Triggery ruchu sekcji (drugi useGSAP) mogły powstać przed pinem procesu — kolejność wg pozycji
      ScrollTrigger.sort()
      ScrollTrigger.refresh()
      refreshAfterFonts()
      return () => mm.revert()
    },
    // revertOnUpdate: przy zmianie rozmiaru koła stare triggery (w tym pin procesu) muszą zniknąć przed nowymi
    { scope: page, dependencies: [size], revertOnUpdate: true },
  )

  // Ruch wejścia: hero i sekcje (homeMotion), także przy „Ogranicz ruch” (lżejszy). Osobno od koła —
  // zmiana rozmiaru koła nie powtarza intro.
  useGSAP(
    () => {
      const root = page.current
      if (!root) return
      if (!motionEnabled()) {
        heroRef.current?.setAttribute('data-m-done', '')
        return
      }
      const mm = gsap.matchMedia()
      mm.add({ motion: FULL_MOTION, wide: '(min-width: 1024px)' }, (ctx) => {
        const { motion } = ctx.conditions as { motion: boolean; wide: boolean }
        markMotionReady()
        // „Ogranicz ruch”: bez przesunięć i wjazdów, przejścia i rozwijanie zostają (motionKit, tryb lite)
        setLite(!motion)
        heroIntro(root)
        const cleanup = sectionsMotion(root)
        ScrollTrigger.sort()
        return cleanup
      })
      return () => mm.revert()
    },
    { scope: page },
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
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY, behavior: reduced() ? 'auto' : 'smooth' })
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
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

  const currentGroup = dialItems.find((i) => i.ids.includes(section))?.key ?? null
  const curLabel = dialItems.find((i) => i.key === currentGroup)?.label ?? ''
  const t = CHROME_LABELS[locale]

  return (
    <div ref={page} className={s.home} onClick={onPageClick}>
      <div className={s.dust} aria-hidden="true" />

      {/* ── HERO — jedyny H1 strony ── */}
      <header id={heroId} ref={heroRef} className={`${s.wrap} ${s.hero}`} onPointerMove={onPointerMove}>
        <div className={s.glow} aria-hidden="true" />
        <div className={s.dialLight} aria-hidden="true" />
        <p className={`${s.mono} ${s.eyebrow}`}>
          {texts.eyebrow}
          <br />
          {texts.subtitle}
        </p>

        <div className={s.fog} aria-hidden="true" data-fog="">
          <p className={s.fogBlur}>NEONEON</p>
          <p className={s.fogSharp}>NEONEON</p>
        </div>
        <div ref={anchor} className={s.dialAnchor} aria-hidden="true" />

        <div>
          <h1 className={s.h1}>
            {texts.headline[0]}
            <br />
            <span>{texts.headline[1]}</span>
          </h1>
          <div className={s.heroFoot}>
            <p className={s.lead}>{texts.lead}</p>
            <div className={s.ctas}>
              <Link href={contactHref} className={`${s.btn} ${s.btnLime}`}>
                {texts.ctaPrimary} <span aria-hidden="true">→</span>
              </Link>
              <a href={`#${processId}`} className={`${s.btn} ${s.btnGhost}`}>
                {texts.ctaSecondary}
              </a>
            </div>
          </div>
        </div>
      </header>

      {children}

      <SignalDial
        ref={dial}
        items={dialItems}
        current={currentGroup}
        docked={docked}
        size={size}
        labels={DIAL_LABELS[locale]}
        numRef={num}
        arcRef={arc}
        rimRef={rim}
        onOpen={openMap}
      />
      <p className={d.dockLabel} data-on={docked ? '' : undefined} aria-hidden="true">
        {curLabel}
        <span>{t.contents}</span>
      </p>

      {open && (
        <SignalMap
          items={mapItems}
          initialList
          current={section}
          progress={progress}
          labels={MAP_LABELS[locale]}
          talkHref={contactHref}
          email={email}
          language={<SignalLanguage labels={langLabels} />}
          aside={<MapAside locale={locale} onLeave={() => setOpen(false)} />}
          onClose={closeMap}
          onNavigate={(item) => navigate(item.href.slice(1))}
        />
      )}
    </div>
  )
}
