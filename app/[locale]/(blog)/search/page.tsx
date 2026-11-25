import { searchArticles, getArticles, getAllTags } from '@/lib/queries'
import { TagBadge } from '@/components/blog/TagBadge'
import { ArticleRow } from '@/components/sygnal/ArticleRow'
import styles from '@/components/sygnal/lists.module.css'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import type { Locale } from '@/lib/locales'

interface SearchPageProps {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ q?: string; tag?: string }>
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'search' })
  // Wyniki wyszukiwania poza indeksem — linki do artykułów nadal są śledzone
  return { title: t('heading'), robots: { index: false, follow: true } }
}

export default async function SearchPage({ params, searchParams }: SearchPageProps) {
  const { locale } = await params
  const { q, tag } = await searchParams
  const [t, ta] = await Promise.all([getTranslations('search'), getTranslations('article')])

  const [tags, articles] = await Promise.all([
    getAllTags(),
    q ? searchArticles(q, locale) : getArticles({ tag, locale }),
  ])

  const hasQuery = q || tag
  const resultCount = articles.length

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={`${styles.title} ${styles.titleSmall}`}>{t('heading')}</h1>
        <form method="GET" role="search" className={styles.searchForm}>
          <input
            type="search"
            name="q"
            defaultValue={q ?? ''}
            placeholder={t('placeholder')}
            aria-label={t('placeholder')}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>{t('button')}</button>
        </form>
        {tags.length > 0 && (
          <div className={styles.filters}>
            <p className={styles.filterLabel}>{t('filterByTag')}</p>
            <div className={styles.tagList}>
              {tags.map((tg) => (
                <TagBadge
                  key={tg.id}
                  tag={tg}
                  active={tg.slug === tag}
                  href={tg.slug === tag ? '/search' : `/search?tag=${tg.slug}`}
                />
              ))}
            </div>
          </div>
        )}
      </header>

      {hasQuery && (
        <p className={styles.status} role="status">
          {resultCount === 0 ? t('noResults') : <><b>{String(resultCount).padStart(2, '0')}</b> {resultCount === 1 ? t('result') : t('results')}</>}
          {q && ` · „${q}”`}
          {tag && ` · ${t('taggedWith', { tag })}`}
        </p>
      )}

      {articles.length > 0 ? (
        <ol className={styles.rows} style={{ marginTop: hasQuery ? 16 : 0, borderTop: 0 }}>
          {articles.map((article, i) => (
            <ArticleRow
              key={article.id}
              article={article}
              index={i}
              locale={locale}
              categoryLabel={article.category_title}
              readingLabel={ta('readingTime', { minutes: article.reading_minutes })}
            />
          ))}
        </ol>
      ) : (
        <p className={styles.empty}>{hasQuery ? t('tryDifferent') : t('enterTerm')}</p>
      )}
    </div>
  )
}
