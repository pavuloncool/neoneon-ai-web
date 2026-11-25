// components/sygnal/ArticleCta.tsx
// CTA pod każdym artykułem: tekst zależny od kategorii (strony z AI / treści), przycisk do formularza
// z zaznaczoną usługą i adres e-mail. Teksty: messages/{locale}.json → articleCta.

import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { contactHrefFor } from '@/lib/onePager'
import { PUBLIC_CONTACT_EMAIL } from '@/lib/site'
import type { Locale } from '@/lib/locales'
import a from './article.module.css'

// Kategoria „Strony zbudowane z AI” / „AI-assisted web development” — po stałym _id dokumentu
// (slug i nazwa kategorii mogą się zmieniać)
const AI_CATEGORY_IDS = ['category-ux-strategies-pl', 'category-ux-strategies-en']

export async function ArticleCta({ locale, categoryId }: { locale: Locale; categoryId?: string | null }) {
  const t = await getTranslations({ locale, namespace: 'articleCta' })
  const ai = Boolean(categoryId && AI_CATEGORY_IDS.includes(categoryId))
  const v = ai ? 'ai' : 'content'
  return (
    <aside className={a.cta} aria-labelledby="article-cta-title">
      <p className={a.ctaLabel}>{t('label')}</p>
      <h2 id="article-cta-title" className={a.ctaTitle}>
        {t(`${v}.title`)}
      </h2>
      <p className={a.ctaText}>{t(`${v}.text`)}</p>
      <div className={a.ctaActions}>
        <Link href={contactHrefFor(locale, ai ? 'website' : 'content')} className={a.ctaButton}>
          {t(`${v}.button`)} <span aria-hidden="true">→</span>
        </Link>
        <span className={a.ctaMail}>
          {t('email')} <a href={`mailto:${PUBLIC_CONTACT_EMAIL}`}>{PUBLIC_CONTACT_EMAIL}</a>
        </span>
      </div>
    </aside>
  )
}
