// components/sections/CategoryTiles.tsx
// Sekcja „Kafelki kategorii” (page builder, strona bloga) — karty „Sygnał” z numerem i strzałką.

import { Link } from '@/i18n/navigation'
import { Arrow } from '@/components/sygnal/ArticleRow'
import styles from '@/components/sygnal/lists.module.css'
import type { CategoryTilesSection } from '@/types'

export function CategoryTiles({ section }: { section: CategoryTilesSection }) {
  const tiles: { _key: string; category: string; title: string }[] = section.tiles ?? []
  if (tiles.length === 0) return null

  return (
    /* SC 1.3.6 — aria-label dla sekcji kategorii */
    <section aria-label={section.ariaLabel ?? undefined} className={styles.tiles}>
      {tiles.map((tile, i) => (
        <Link key={tile._key} href={`/${tile.category}`} className={styles.tile}>
          <span className={styles.tileTop}>
            <span className={styles.tileNo}>
              {String(i + 1).padStart(2, '0')}
              {section.eyebrow ? ` · ${section.eyebrow}` : ''}
            </span>
            <Arrow />
          </span>
          <h2 className={styles.tileTitle}>{tile.title}</h2>
        </Link>
      ))}
    </section>
  )
}
