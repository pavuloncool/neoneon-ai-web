// Strona główna /{locale} — one-pager usługowy (brief neoneon-AI-web). Sekcje powstają po kolei,
// po jednej na iterację (lib/onePager.ts). Teksty: messages/{locale}.json, przestrzeń „onePager”.
// Lista bloga (dawna strona główna z page buildera) jest pod /{locale}/blog.
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { HomeSection } from '@/components/home/HomeSection'
import { TranslationStore } from '@/components/layout/TranslationStore'
import { seoMetadata } from '@/lib/metadata'
import { ONE_PAGER_SECTIONS, sectionAnchor } from '@/lib/onePager'
import { SITE_NAME, SITE_URL, localeUrl } from '@/lib/site'
import type { Metadata } from 'next'
import type { Locale } from '@/lib/locales'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'onePager' })
  return seoMetadata({ locale, path: '', altPath: '', title: t('heroTitle'), description: t('metaDescription') })
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'onePager' })

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: localeUrl(locale),
          inLanguage: locale,
          description: t('metaDescription'),
          publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        }}
      />
      {/* Przełącznik języka: strona główna drugiego języka */}
      <TranslationStore path="/" />

      {/* Hero (iteracja 1) — jedyny H1 strony */}
      <section id={sectionAnchor('hero', locale)} aria-labelledby="hero-title" className="scroll-mt-20">
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-20 md:pt-28 md:pb-28">
          <h1 id="hero-title" className="font-display font-light text-5xl md:text-7xl leading-[1.05]">
            {t('heroTitle')}
          </h1>
          <p className="mt-6 text-sm text-muted">{t('placeholder', { iteration: 1 })}</p>
        </div>
      </section>

      {ONE_PAGER_SECTIONS.filter((s) => s.key !== 'hero').map((s) => (
        <HomeSection key={s.key} id={s.anchor[locale]} title={t(`${s.key}Title`)}>
          <p className="mt-6 text-sm text-muted">{t('placeholder', { iteration: s.iteration })}</p>
        </HomeSection>
      ))}
    </>
  )
}
