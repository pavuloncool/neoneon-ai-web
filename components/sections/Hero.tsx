// components/sections/Hero.tsx
// Sekcja „Nagłówek strony” w stylu „Sygnał”: wariant `large` (strona bloga) — duży tytuł wersalikami,
// druga linia limonką; `page` — podstrona („O mnie”, „Kontakt”). Bez animacji (dawny HeroNeon usunięty).

import styles from '@/components/sygnal/lists.module.css'
import type { HeroSection } from '@/types'

export function Hero({ section }: { section: HeroSection }) {
  const { variant, eyebrow, heading, headingEmphasis, rotatingPrefix, rotatingWords, _key } = section
  const words = (rotatingWords ?? []).map((w) => w.trim()).filter(Boolean)

  if (variant === 'large') {
    return (
      <header aria-labelledby={`hero-${_key}`} className={styles.head}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 id={`hero-${_key}`} className={styles.title}>
          {heading}
          {headingEmphasis && <span className={styles.emph}>{headingEmphasis}</span>}
        </h1>
        {rotatingPrefix && words.length > 0 && (
          <p className={styles.lead}>{rotatingPrefix} {words.join(' · ')}</p>
        )}
      </header>
    )
  }

  return (
    <header className={styles.head} style={{ marginBottom: 48 }}>
      {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
      <h1 className={`${styles.title} ${styles.titleSmall}`}>{heading}</h1>
    </header>
  )
}
