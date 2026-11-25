// components/sections/RecentArticles.tsx
// Sekcja „Najnowsze artykuły” (page builder, strona bloga) — wiersze „Sygnał” z kategorią i czasem czytania.

import { getTranslations } from 'next-intl/server'
import { getArticles } from '@/lib/queries'
import { ArticleRow } from '@/components/sygnal/ArticleRow'
import styles from '@/components/sygnal/lists.module.css'
import type { RecentArticlesSection } from '@/types'
import type { Locale } from '@/lib/locales'

export async function RecentArticles({ section, locale }: { section: RecentArticlesSection; locale: Locale }) {
  const [recent, ta] = await Promise.all([
    getArticles({ limit: section.limit ?? 6, locale }),
    getTranslations('article'),
  ])
  if (recent.length === 0) return null

  const id = `recent-${section._key}`

  return (
    /* SC 1.3.6 — aria-labelledby wskazuje na nagłówek sekcji */
    <section aria-labelledby={id} className={styles.section}>
      <h2 id={id} className={styles.sectionHead}>
        <span>{section.heading}</span>
        <span aria-hidden="true">{String(recent.length).padStart(2, '0')}</span>
      </h2>
      <ol className={styles.rows}>
        {recent.map((article, i) => (
          <ArticleRow
            key={article.id}
            article={article}
            index={i}
            locale={locale}
            categoryLabel={article.category_title}
            readingLabel={ta('readingTime', { minutes: article.reading_minutes })}
            headingLevel="h3"
          />
        ))}
      </ol>
    </section>
  )
}
