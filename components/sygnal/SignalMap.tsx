'use client'

// components/sygnal/SignalMap.tsx
// Koło otwarte: pełny ekran z pozycjami nawigacji na obręczy (sekcje strony, menu z Sanity albo śródtytuły
// artykułu), lewą kolumną (np. blog, wyszukiwarka) i rozmową po prawej.
// Dialog modalny: fokus na bieżącej pozycji przy otwarciu, Esc zamyka, Tab nie wychodzi poza dialog,
// strzałki ← → / ↑ ↓ przechodzą po pozycjach. Przełącznik „Lista” zamienia koło na zwykłe menu.
// Kotwice „#…” obsługuje onNavigate (przewijanie na tej stronie); ścieżki — Link z next-intl.

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { Link } from '@/i18n/navigation'
import { linkHref } from '@/lib/links'
import type { DialItem } from './SignalDial'
import s from './dial.module.css'

export interface MapLabels {
  dialog: string // „Spis strony”
  list: string // „☰ Lista”
  wheel: string // „◎ Koło”
  close: string // „Esc · Zamknij”
  here: string // „Tu jesteś”
  talk: string // „Rozmowa”
  talkCta: string // „Umów rozmowę →”
  keys: string // podpowiedź klawiszy
}

interface Props {
  items: DialItem[]
  current: string | null
  progress: number
  labels: MapLabels
  talkHref: string
  email: string
  aside?: React.ReactNode // lewa kolumna
  language?: React.ReactNode // przełącznik języka
  initialList?: boolean // start w widoku listy
  onClose: () => void
  onNavigate: (item: DialItem) => void
}

const R = 41 // promień etykiet w %

// Jedna pozycja: kotwica na tej stronie albo link do innej strony
function ItemLink({
  item,
  current,
  onNavigate,
  onClose,
  style,
  children,
}: {
  item: DialItem
  current: string | null
  onNavigate: (item: DialItem) => void
  onClose: () => void
  style?: React.CSSProperties
  children: React.ReactNode
}) {
  const common = { 'data-sec': '', 'aria-current': item.key === current ? ('true' as const) : undefined, style }
  if (item.href.startsWith('#')) {
    return (
      <a
        {...common}
        href={item.href}
        onClick={(e) => {
          e.preventDefault()
          onNavigate(item)
        }}
      >
        {children}
      </a>
    )
  }
  return (
    <Link {...common} href={linkHref(item.href)} onClick={onClose}>
      {children}
    </Link>
  )
}

export function SignalMap({ items, current, progress, labels, talkHref, email, aside, language, initialList = false, onClose, onNavigate }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [list, setList] = useState(initialList)
  const cur = items.find((x) => x.key === current)
  const step = 360 / Math.max(items.length, 1)
  const link = { current, onNavigate, onClose }

  // Wejście: rozkwit (bez ruchu przy prefers-reduced-motion)
  useEffect(() => {
    const el = root.current
    if (!el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const wheel = el.querySelector('[data-map-wheel]')
    // fromTo + context.revert: w StrictMode efekt startuje dwa razy — „from” zapamiętałby opacity 0 jako stan końcowy
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: reduce ? 0.2 : 0.35, ease: 'power2.out' })
      if (!reduce && wheel) {
        gsap.fromTo(wheel, { scale: 0.4, rotate: -40, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 0.7, ease: 'expo.out' })
      }
    })
    const first = el.querySelector<HTMLElement>('[data-sec][aria-current="true"]') ?? el.querySelector<HTMLElement>('[data-sec]')
    first?.focus()
    return () => ctx.revert()
  }, [])

  // Po przełączeniu koło ↔ lista fokus wraca na bieżącą pozycję
  useEffect(() => {
    root.current?.querySelector<HTMLElement>('[data-sec][aria-current="true"]')?.focus()
  }, [list])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }
    const links = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-sec]') ?? [])
    const i = links.indexOf(document.activeElement as HTMLElement)
    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key) && i >= 0) {
      e.preventDefault()
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1
      links[(i + d + links.length) % links.length].focus()
      return
    }
    // Pułapka fokusu
    if (e.key === 'Tab') {
      const all = Array.from(root.current?.querySelectorAll<HTMLElement>('a[href], button, input') ?? []).filter(
        (x) => !x.hasAttribute('disabled'),
      )
      if (!all.length) return
      const first = all[0]
      const last = all[all.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
  }

  return (
    <div ref={root} className={s.map} role="dialog" aria-modal="true" aria-label={labels.dialog} onKeyDown={onKeyDown}>
      <div className={s.mapBar}>
        <span className={s.mapLogo} aria-hidden="true">
          NEONEON
        </span>
        <button type="button" className={s.pill} aria-pressed={list} onClick={() => setList((v) => !v)} style={{ marginLeft: 'auto' }}>
          {list ? labels.wheel : labels.list}
        </button>
        <button type="button" className={s.pill} onClick={onClose}>
          {labels.close}
        </button>
      </div>

      <div className={`${s.mapSide} ${s.mapLeft}`}>{aside}</div>

      {list ? (
        <ol className={s.mapList}>
          {items.map((item, i) => (
            <li key={item.key}>
              <ItemLink item={item} {...link}>
                <small>{String(i + 1).padStart(2, '0')}</small>
                {item.label}
              </ItemLink>
            </li>
          ))}
        </ol>
      ) : (
        <div className={s.mapWheel} data-map-wheel="">
          <svg className={s.svg} viewBox="0 0 600 600" fill="none" aria-hidden="true">
            <circle cx="300" cy="300" r="292" fill="url(#sgCorona)" opacity=".55" />
            <circle cx="300" cy="300" r="166" fill="#050506" stroke="#CCFF00" strokeWidth="1.5" />
            <circle cx="300" cy="300" r="196" stroke="rgba(242,242,238,.28)" strokeWidth="8" pathLength={120} strokeDasharray=".14 .86" />
            <circle cx="300" cy="300" r="196" stroke="#CCFF00" strokeWidth="3" pathLength={100} strokeDasharray={`${progress} ${100 - progress}`} transform="rotate(-90 300 300)" />
            <circle cx="300" cy="300" r="290" stroke="rgba(242,242,238,.1)" />
          </svg>
          <ol>
            {items.map((item, i) => {
              const a = ((-90 + i * step) * Math.PI) / 180
              return (
                <li key={item.key}>
                  <ItemLink item={item} {...link} style={{ left: `${50 + R * Math.cos(a)}%`, top: `${50 + R * Math.sin(a)}%` }}>
                    <small>{String(i + 1).padStart(2, '0')}</small>
                    <strong>{item.label}</strong>
                  </ItemLink>
                </li>
              )
            })}
          </ol>
          <div className={s.mapCore}>
            <span className={s.coreLbl} style={{ color: '#CCFF00' }}>
              {labels.here} · {String(progress).padStart(2, '0')}
            </span>
            {cur ? (
              <>
                <strong>{cur.label}</strong>
                {cur.summary ? <p>{cur.summary}</p> : null}
              </>
            ) : null}
          </div>
        </div>
      )}

      <div className={`${s.mapSide} ${s.mapRight}`}>
        <h2>{labels.talk}</h2>
        {talkHref.startsWith('#') ? (
          <a
            href={talkHref}
            className={s.mapCta}
            onClick={(e) => {
              e.preventDefault()
              onNavigate({ key: talkHref.slice(1), label: labels.talk, href: talkHref })
            }}
          >
            {labels.talkCta}
          </a>
        ) : (
          <Link href={linkHref(talkHref)} onClick={onClose} className={s.mapCta}>
            {labels.talkCta}
          </Link>
        )}
        <p style={{ margin: '18px 0 0' }}>
          <a href={`mailto:${email}`}>{email}</a>
        </p>
        {language ? <div style={{ marginTop: 28 }}>{language}</div> : null}
      </div>

      <p className={s.mapKeys}>{labels.keys}</p>
    </div>
  )
}
