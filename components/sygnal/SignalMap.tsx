'use client'

// components/sygnal/SignalMap.tsx
// Koło otwarte: pełny ekran ze spisem strony (sekcje na obręczy), blogiem i rozmową.
// Dialog modalny: fokus na bieżącej sekcji przy otwarciu, Esc zamyka, Tab nie wychodzi poza dialog,
// strzałki ← → / ↑ ↓ przechodzą po sekcjach. Przełącznik „Lista” zamienia koło na zwykłe menu.

import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'
import { Link } from '@/i18n/navigation'
import type { DialSection } from './SignalDial'
import s from './dial.module.css'

interface Props {
  sections: DialSection[]
  current: string
  progress: number
  onClose: () => void
  onNavigate: (id: string) => void
}

const R = 41 // promień etykiet w %

export function SignalMap({ sections, current, progress, onClose, onNavigate }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const [list, setList] = useState(false)
  const cur = sections.find((x) => x.id === current) ?? sections[0]
  const step = 360 / sections.length

  // Wejście: rozkwit z rogu (bez ruchu przy prefers-reduced-motion)
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
    el.querySelector<HTMLElement>('[aria-current="true"]')?.focus()
    return () => ctx.revert()
  }, [])

  // Po przełączeniu koło ↔ lista fokus wraca na bieżącą sekcję
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
      const all = Array.from(
        root.current?.querySelectorAll<HTMLElement>('a[href], button, input') ?? [],
      ).filter((x) => !x.hasAttribute('disabled'))
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

  function go(e: React.MouseEvent, id: string) {
    e.preventDefault()
    onNavigate(id)
  }

  return (
    <div ref={root} className={s.map} role="dialog" aria-modal="true" aria-label="Spis strony" onKeyDown={onKeyDown}>
      <div className={s.mapBar}>
        <span
          style={{ fontSize: 22, fontWeight: 900, fontVariationSettings: "'wdth' 125", color: 'transparent', WebkitTextStroke: '1.2px #F2F2EE' }}
        >
          NEONEON
        </span>
        <button type="button" className={s.pill} aria-pressed={list} onClick={() => setList((v) => !v)} style={{ marginLeft: 'auto' }}>
          {list ? '◎ Koło' : '☰ Lista'}
        </button>
        <button type="button" className={s.pill} onClick={onClose}>
          Esc · Zamknij
        </button>
      </div>

      <div className={`${s.mapSide} ${s.mapLeft}`}>
        <h2>Z bloga</h2>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          <Link href="/blog">Wszystkie artykuły →</Link>
        </p>
        <p style={{ margin: '14px 0 0', fontSize: 14, color: 'rgba(242,242,238,.66)', maxWidth: 280 }}>
          W wersji docelowej: trzy najnowsze wpisy i wyszukiwarka.
        </p>
      </div>

      {list ? (
        <ol className={s.mapList}>
          {sections.map((sec, i) => (
            <li key={sec.id}>
              <a data-sec="" href={`#${sec.id}`} aria-current={sec.id === current ? 'true' : undefined} onClick={(e) => go(e, sec.id)}>
                <small>{String(i + 1).padStart(2, '0')}</small>
                {sec.label}
              </a>
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
            {sections.map((sec, i) => {
              const a = ((-90 + i * step) * Math.PI) / 180
              return (
                <li key={sec.id}>
                  <a
                    data-sec=""
                    href={`#${sec.id}`}
                    aria-current={sec.id === current ? 'true' : undefined}
                    onClick={(e) => go(e, sec.id)}
                    style={{ left: `${50 + R * Math.cos(a)}%`, top: `${50 + R * Math.sin(a)}%` }}
                  >
                    <small>{String(i + 1).padStart(2, '0')}</small>
                    <strong>{sec.label}</strong>
                  </a>
                </li>
              )
            })}
          </ol>
          <div className={s.mapCore}>
            <span className={s.coreLbl} style={{ color: '#CCFF00' }}>
              Tu jesteś · {String(progress).padStart(2, '0')}
            </span>
            <strong>{cur.label}</strong>
            <p>{cur.summary}</p>
          </div>
        </div>
      )}

      <div className={`${s.mapSide} ${s.mapRight}`}>
        <h2>Rozmowa</h2>
        <a
          href="#rozmowa"
          onClick={(e) => go(e, 'rozmowa')}
          style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 22px', borderRadius: 26, background: '#CCFF00', color: '#0A0A0B', textDecoration: 'none', fontFamily: 'var(--font-plex-mono), monospace', fontSize: 11.5, letterSpacing: '.18em', textTransform: 'uppercase', fontWeight: 500 }}
        >
          Umów rozmowę →
        </a>
        <p style={{ margin: '18px 0 0' }}>
          <a href="mailto:web@neoneon.online">web@neoneon.online</a>
        </p>
        <p style={{ margin: '28px 0 0', fontFamily: 'var(--font-plex-mono), monospace', fontSize: 13, letterSpacing: '.2em' }}>
          <span style={{ color: '#CCFF00' }}>PL</span> / <Link href="/" locale="en">EN</Link>
        </p>
      </div>

      <p className={s.mapKeys}>Tab — sekcje · ← → — obrót · Enter — przejdź · Esc — zamknij</p>
    </div>
  )
}
