'use client'

// components/sygnal/SiteChrome.tsx
// Chrome podstron w kierunku „Sygnał” (blog, strony z page buildera, polityki):
// - SiteBar: logo, wyszukiwarka, PL/EN, „Umów rozmowę” — bez menu, bo nawigacją jest koło,
// - SiteDial: to samo jedno koło, zadokowane w prawym dolnym rogu; liczba i łuk = postęp czytania strony,
//   klik → mapa (SignalMap) z pozycjami menu z Sanity, blogiem i wyszukiwarką.

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Link, usePathname } from '@/i18n/navigation'
import { useLocaleSwitch } from '@/components/layout/LanguageSwitcher'
import { SignalDial, type DialItem } from './SignalDial'
import { SignalMap } from './SignalMap'
import { CHROME_LABELS, DIAL_LABELS, MAP_LABELS } from './labels'
import { useDialOverride } from './dialStore'
import type { Locale } from '@/lib/locales'
import c from './chrome.module.css'
import d from './dial.module.css'

export function SignalLanguage({ labels }: { labels: { pl: string; en: string } }) {
  const { locale, switchTo } = useLocaleSwitch()
  return (
    <div className={c.lang} role="group" aria-label={CHROME_LABELS[locale].language}>
      {(['pl', 'en'] as const).map((l) => (
        <button key={l} type="button" aria-pressed={locale === l} aria-label={`${l.toUpperCase()}, ${labels[l]}`} onClick={() => switchTo(l)}>
          {l}
        </button>
      ))}
    </div>
  )
}

export function SiteBar({
  locale,
  logo,
  contactHref,
  langLabels,
}: {
  locale: Locale
  logo: { src: string; alt: string }
  contactHref: string
  langLabels: { pl: string; en: string }
}) {
  const t = CHROME_LABELS[locale]
  return (
    <header className={c.bar}>
      <Link href="/" className={c.logo}>
        <Image src={logo.src} alt={logo.alt} width={168} height={28} priority className={c.logoImg} />
      </Link>
      <div className={c.barRight}>
        <Link href="/search" className={c.search}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <span>{t.search}</span>
        </Link>
        <SignalLanguage labels={langLabels} />
        <Link href={contactHref} className={c.cta}>
          {t.cta}
        </Link>
      </div>
    </header>
  )
}

// Pozycja menu pasuje do bieżącej ścieżki (kotwice strony głównej → „/”)
function matchKey(items: DialItem[], pathname: string): string | null {
  const exact = items.find((i) => !i.href.includes('#') && i.href === pathname)
  if (exact) return exact.key
  const prefix = items
    .filter((i) => !i.href.includes('#') && i.href !== '/' && pathname.startsWith(i.href))
    .sort((a, b) => b.href.length - a.href.length)[0]
  return prefix?.key ?? null
}

export function SiteDial({ locale, items, contactHref, email, langLabels }: { locale: Locale; items: DialItem[]; contactHref: string; email: string; langLabels: { pl: string; en: string } }) {
  const pathname = usePathname()
  const num = useRef<HTMLSpanElement>(null)
  const arc = useRef<SVGCircleElement>(null)
  const progressRef = useRef(0)
  const opener = useRef<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [progress, setProgress] = useState(0)
  // Artykuł podmienia pozycje na swój spis treści (ArticleDial → dialStore)
  const override = useDialOverride()
  const shown = override?.items ?? items
  const current = override ? override.current : matchKey(items, pathname)
  const t = CHROME_LABELS[locale]

  // Postęp czytania strony → liczba i łuk (bez re-renderu przy każdym przewinięciu)
  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(99, Math.round((window.scrollY / max) * 99)) : 99
      progressRef.current = p
      if (num.current) num.current.textContent = String(p).padStart(2, '0')
      arc.current?.setAttribute('stroke-dasharray', `${p} ${100 - p}`)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [pathname])


  const currentLabel = shown.find((i) => i.key === current)?.label

  return (
    <>
      <SignalDial
        variant="dock"
        items={shown}
        current={current}
        docked
        labels={DIAL_LABELS[locale]}
        numRef={num}
        arcRef={arc}
        onOpen={() => {
          opener.current = document.activeElement as HTMLElement
          setProgress(progressRef.current)
          setOpen(true)
        }}
      />
      <p className={d.dockLabel} data-on="" aria-hidden="true">
        {currentLabel ?? ''}
        <span>{t.contents}</span>
      </p>
      {open && (
        <SignalMap
          items={shown}
          // długie pozycje (śródtytuły artykułu) czytelniej jako lista
          initialList={shown.some((i) => i.label.length > 28)}
          current={current}
          progress={progress}
          labels={MAP_LABELS[locale]}
          talkHref={contactHref}
          email={email}
          language={<SignalLanguage labels={langLabels} />}
          aside={
            <>
              <h2>{t.fromBlog}</h2>
              <p style={{ margin: 0 }}>
                <Link href="/blog" onClick={() => setOpen(false)}>
                  {t.allArticles}
                </Link>
              </p>
              <form action={`/${locale}/search`} role="search">
                <label htmlFor="map-q">{t.search}</label>
                <input id="map-q" name="q" type="search" placeholder={t.searchPlaceholder} />
              </form>
            </>
          }
          onClose={() => {
            setOpen(false)
            requestAnimationFrame(() => opener.current?.focus())
          }}
          onNavigate={(item) => {
            setOpen(false)
            document.getElementById(item.href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      )}
    </>
  )
}
