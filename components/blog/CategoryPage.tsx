// components/blog/CategoryPage.tsx
// Strona kategorii /{locale}/{slug} (trasa [...segments]) — lista artykułów z filtrem tagów,
// w stylu „Sygnał” (wiersze jak lista usług, bez animacji wejścia).

import { getArticles, getAllTags } from '@/lib/queries'
import { TagBadge } from '@/components/blog/TagBadge'
import { ArticleRow } from '@/components/sygnal/ArticleRow'
import styles from '@/components/sygnal/lists.module.css'
import { getTranslations } from 'next-intl/server'
import { TranslationStore } from '@/components/layout/TranslationStore'
import type { ResolvedCategory } from '@/lib/categoryRoute'
import type { Locale } from '@/lib/locales'

interface CategoryPageProps {
  category: ResolvedCategory
  locale: Locale
  tag?: string
}

export async function CategoryPage({ category, locale, tag }: CategoryPageProps) {
  const [tc, ta] = await Promise.all([getTranslations('category'), getTranslations('article')])
  const path = `/${category.slug}`

  const [articles, tags] = await Promise.all([
    getArticles({ category: category.slug, locale, tag }),
    getAllTags(),
  ])

  return (
    <div className={styles.page}>
      {/* Przełącznik języka: odpowiednik kategorii z powiązania tłumaczeń (slugi PL/EN mogą się różnić) */}
      {category.altSlug !== null && <TranslationStore path={`/${category.altSlug}`} />}
      <header className={styles.head}>
        <p className={styles.eyebrow}>
          {tc('label')} · <b>{String(articles.length).padStart(2, '0')}</b>
        </p>
        <h1 className={styles.title}>{category.title}</h1>
        {tags.length > 0 && (
          <div className={styles.filters}>
            <p className={styles.filterLabel}>{tc('filterByTag')}</p>
            <div className={styles.tagList}>
              {tags.map((tg) => (
                <TagBadge
                  key={tg.id}
                  tag={tg}
                  active={tg.slug === tag}
                  href={tg.slug === tag ? path : `${path}?tag=${tg.slug}`}
                />
              ))}
            </div>
          </div>
        )}
      </header>
      {articles.length > 0 ? (
        <ol className={styles.rows} style={{ borderTop: 0 }}>
          {articles.map((article, i) => (
            <ArticleRow
              key={article.id}
              article={article}
              index={i}
              locale={locale}
              readingLabel={ta('readingTime', { minutes: article.reading_minutes })}
            />
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>{tc('noArticles')}</p>
      )}
    </div>
  )
}
