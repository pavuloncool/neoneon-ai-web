// components/sygnal/ArticleRow.tsx
// Wiersz artykułu w listach „Sygnał” (blog, kategorie, wyszukiwarka). Cały wiersz klikalny
// (link na tytule rozciągnięty na wiersz), bez animacji wejścia.

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { formatDate } from '@/lib/utils'
import { DATE_LOCALE, type Locale } from '@/lib/locales'
import styles from './lists.module.css'

export interface ArticleRowData {
  id: string
  title: string
  slug: string
  category: string
  published_at?: string | null
  created_at?: string | null
  excerpt?: string | null
  cover_image_url?: string | null
}

export function Arrow() {
  return (
    <span className={styles.arrow} aria-hidden="true">
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 8h11M9 4l4 4-4 4" />
      </svg>
    </span>
  )
}

export function ArticleRow({
  article,
  index,
  locale,
  categoryLabel,
  readingLabel,
  showExcerpt = true,
  showThumb = true,
  headingLevel = 'h2',
}: {
  article: ArticleRowData
  index: number
  locale: Locale
  categoryLabel?: string | null
  readingLabel?: string | null
  showExcerpt?: boolean
  showThumb?: boolean
  headingLevel?: 'h2' | 'h3'
}) {
  const dateIso = article.published_at ?? article.created_at ?? null
  const Heading = headingLevel
  return (
    <li className={styles.row}>
      <span className={styles.rowNo} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
      <div>
        <p className={styles.rowMeta}>
          {categoryLabel && <span className={styles.rowCat}>{categoryLabel}</span>}
          {dateIso && <time dateTime={dateIso}>{formatDate(dateIso, DATE_LOCALE[locale])}</time>}
          {readingLabel && <span>{readingLabel}</span>}
        </p>
        <Heading className={styles.rowTitle}>
          <Link href={`/${article.category}/${article.slug}`} className={styles.rowLink}>
            {article.title}
          </Link>
        </Heading>
        {showExcerpt && article.excerpt && <p className={styles.rowExcerpt}>{article.excerpt}</p>}
      </div>
      {showThumb && article.cover_image_url ? (
        <div className={styles.thumb}>
          <Image src={article.cover_image_url} alt="" fill sizes="168px" className="object-cover" />
        </div>
      ) : (
        <span className={styles.noThumb} />
      )}
      <Arrow />
    </li>
  )
}
