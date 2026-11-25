'use client'

// components/sygnal/SignalDial.tsx
// Jedno koło nawigacji („Sygnał”). Jeden element w DOM, dwa warianty:
// - hero: duże zaćmienie dopasowane do miejsca w hero (położenie i skalę ustawia GSAP w HomeSignal);
//   pozycje (`items`) na obręczy to zwykłe linki,
// - dock: od razu małe koło w prawym dolnym rogu (podstrony, blog) — bez obręczy, tylko liczba sygnału
//   i łuk postępu; całe koło jest przyciskiem otwierającym mapę (SignalMap).
// Pozycje przychodzą z zewnątrz: sekcje strony głównej, menu z Sanity albo śródtytuły artykułu.

import { forwardRef } from 'react'
import s from './dial.module.css'

export interface DialItem {
  key: string
  label: string
  href: string // „#kotwica” na tej stronie albo ścieżka bez prefiksu języka
  summary?: string
}

export interface DialLabels {
  nav: string // nazwa nawigacji (aria-label)
  open: string // „Otwórz spis strony”
  now: string // „Teraz”
}

interface Props {
  items: DialItem[]
  current: string | null
  docked: boolean
  variant?: 'hero' | 'dock'
  size?: number
  labels: DialLabels
  numRef?: React.Ref<HTMLSpanElement>
  arcRef?: React.Ref<SVGCircleElement>
  rimRef?: React.Ref<HTMLOListElement>
  onOpen: () => void
}

const R_LABEL = 45 // promień etykiet w % średnicy koła

export const SignalDial = forwardRef<HTMLElement, Props>(function SignalDial(
  { items, current, docked, variant = 'hero', size, labels, numRef, arcRef, rimRef, onOpen },
  ref,
) {
  const step = 360 / Math.max(items.length, 1)
  const isDock = variant === 'dock'
  const currentLabel = items.find((x) => x.key === current)?.label
  return (
    <nav
      ref={ref}
      aria-label={labels.nav}
      className={`${s.dial} ${isDock ? s.dialDock : ''}`}
      style={isDock ? undefined : { width: size, height: size }}
      data-docked={docked ? '' : undefined}
      data-ready={isDock ? '' : undefined}
    >
      <svg className={s.svg} viewBox="0 0 600 600" fill="none" aria-hidden="true">
        <defs>
          <radialGradient id="sgCorona" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#CCFF00" stopOpacity="0" />
            <stop offset="68%" stopColor="#CCFF00" stopOpacity="0.38" />
            <stop offset="100%" stopColor="#CCFF00" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="sgSweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#CCFF00" stopOpacity="0" />
            <stop offset="1" stopColor="#CCFF00" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle cx="300" cy="300" r="250" fill="url(#sgCorona)" />
        <circle cx="300" cy="300" r="170" fill="#0A0A0B" stroke="#CCFF00" strokeWidth="1.5" />
        <circle cx="300" cy="300" r="214" stroke="rgba(242,242,238,.28)" strokeWidth="8" pathLength={120} strokeDasharray=".12 .88" />
        {/* znaczniki pozycji */}
        <circle
          cx="300"
          cy="300"
          r="214"
          stroke="rgba(242,242,238,.75)"
          strokeWidth="16"
          pathLength={Math.max(items.length, 1)}
          strokeDasharray=".035 .965"
          transform="rotate(-90.6 300 300)"
        />
        {/* łuk sygnału — ile strony przeczytano */}
        <circle
          ref={arcRef}
          cx="300"
          cy="300"
          r="214"
          stroke="#CCFF00"
          strokeWidth={isDock ? 10 : 3}
          pathLength={100}
          strokeDasharray="0 100"
          transform="rotate(-90 300 300)"
        />
        <circle cx="300" cy="300" r="234" stroke="rgba(242,242,238,.12)" />
        <g className={s.sweep}>
          <path d="M300 300 L300 66 A234 234 0 0 1 465 134 Z" fill="url(#sgSweep)" opacity=".45" />
        </g>
      </svg>

      {!isDock && (
        <ol ref={rimRef} className={s.rim}>
          {items.map((item, i) => {
            const a = ((-90 + i * step) * Math.PI) / 180
            return (
              <li key={item.key}>
                <a
                  href={item.href}
                  aria-current={item.key === current ? 'true' : undefined}
                  tabIndex={docked ? -1 : undefined}
                  style={{ left: `${50 + R_LABEL * Math.cos(a)}%`, top: `${50 + R_LABEL * Math.sin(a)}%` }}
                >
                  {item.label}
                </a>
              </li>
            )
          })}
        </ol>
      )}

      <div className={s.core}>
        {!isDock && (
          <span className={s.coreLbl} data-dial-fade="">
            signal
          </span>
        )}
        <span ref={numRef} className={s.num}>
          00
        </span>
        {!isDock && (
          <span className={s.coreSub} data-dial-fade="">
            kod — ai
            <br />
            <b>decyzje — człowiek</b>
          </span>
        )}
      </div>

      <button
        type="button"
        className={s.hit}
        onClick={onOpen}
        aria-haspopup="dialog"
        aria-label={currentLabel ? `${labels.open}. ${labels.now}: ${currentLabel}` : labels.open}
      />
    </nav>
  )
})
