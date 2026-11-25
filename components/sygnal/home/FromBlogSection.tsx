// components/sygnal/home/FromBlogSection.tsx
// Strona główna „Sygnał”: trzy najnowsze wpisy jako wiersze listy bloga (ArticleRow) i link do bloga.

import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { ArticleRow } from '@/components/sygnal/ArticleRow'
import lists from '@/components/sygnal/lists.module.css'
import type { ArticleListItem } from '@/types'
import type { Locale } from '@/lib/locales'
import s from '../sygnal.module.css'

export async function FromBlogSection({
  id,
  label,
  locale,
  title,
  lead,
  cta,
  ctaHref,
  posts,
}: {
  id: string
  label: string
  locale: Locale
  title: string
  lead: string
  cta: string
  ctaHref: string
  posts: ArticleListItem[]
}) {
  if (posts.length === 0) return null
  const ta = await getTranslations({ locale, namespace: 'article' })
  return (
    <section id={id} className={`${s.wrap} ${s.section}`} aria-labelledby={`${id}-h`}>
      <p className={`${s.mono} ${s.label}`}>{label}</p>
      <div className={s.blogHead}>
        <div>
          <h2 id={`${id}-h`} className={s.h2}>
            {title}
          </h2>
          <p className={`${s.body} ${s.sub}`}>{lead}</p>
        </div>
        <Link href={ctaHref} className={`${s.btn} ${s.btnGhost}`}>
          {cta} <span aria-hidden="true">→</span>
        </Link>
      </div>
      <ol className={lists.rows} style={{ marginTop: 40 }}>
        {posts.map((post, i) => (
          <ArticleRow
            key={post.id}
            article={post}
            index={i}
            locale={locale}
            categoryLabel={post.category_title}
            readingLabel={ta('readingTime', { minutes: post.reading_minutes })}
            headingLevel="h3"
          />
        ))}
      </ol>
    </section>
  )
}
