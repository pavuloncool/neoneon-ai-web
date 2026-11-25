// app/[locale]/(blog)/not-found.tsx
// Strona 404 w stylu „Sygnał” (w chrome bloga: pasek, koło, stopka) — dla notFound() z tras bloga.

import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { BLOG_PATH } from '@/lib/links'
import { Arrow } from '@/components/sygnal/ArticleRow'
import styles from '@/components/sygnal/lists.module.css'

export default async function NotFound() {
  const t = await getTranslations('notFound')
  const links = [
    { href: BLOG_PATH, label: t('blog') },
    { href: '/search', label: t('search') },
    { href: '/', label: t('home') },
  ]
  return (
    <div className={`${styles.page} ${styles.mid}`}>
      <header className={styles.head}>
        <p className={styles.eyebrow}><b>{t('eyebrow')}</b></p>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.lead}>{t('lead')}</p>
      </header>
      <ul className={styles.rows} style={{ borderTop: 0 }}>
        {links.map((l, i) => (
          <li key={l.href} className={styles.row} style={{ gridTemplateColumns: '56px minmax(0, 1fr) 44px' }}>
            <span className={styles.rowNo} aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <p className={styles.rowTitle}>
              <Link href={l.href} className={styles.rowLink}>{l.label}</Link>
            </p>
            <Arrow />
          </li>
        ))}
      </ul>
    </div>
  )
}
