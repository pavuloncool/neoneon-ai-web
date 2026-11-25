// components/sections/PageSectionsBase.tsx
// Renderuje sekcje strony z page buildera (dokument `page` w Sanity) w zadanej kolejności.

import { Fragment } from 'react'
import { ContactForm } from '@/components/blog/lazy'
import { PortableTextRenderer } from '@/components/blog/PortableTextRenderer'
import { TranslationStore } from '@/components/layout/TranslationStore'
import { getPageTranslation } from '@/lib/queries'
import { pagePath } from '@/lib/links'
import { CategoryTiles } from './CategoryTiles'
import { FeatureGrid } from './FeatureGrid'
import { Hero } from './Hero'
import { RecentArticles } from './RecentArticles'
import { TextImage } from './TextImage'
import lists from '@/components/sygnal/lists.module.css'
import type { Page, Section } from '@/types'
import { otherLocale, type Locale } from '@/lib/locales'

function renderSection(section: Section, locale: Locale) {
  switch (section._type) {
    case 'hero':
      return <Hero section={section} />
    case 'categoryTiles':
      return <CategoryTiles section={section} />
    case 'recentArticles':
      return <RecentArticles section={section} locale={locale} />
    case 'textImage':
      return <TextImage section={section} />
    case 'featureGrid':
      return <FeatureGrid section={section} />
    case 'contactForm':
      // Tekst obok formularza to lead z briefu (messages: contactForm.lead); dawne „intro” z Sanity
      // nie jest już wyświetlane (powtarzało lead i miało stary ton)
      return <ContactForm />
    case 'richText':
      return section.body?.length ? (
        <div className="mb-16">
          <PortableTextRenderer content={section.body} />
        </div>
      ) : null
    default:
      return null
  }
}

// wide: kolumna „Sygnał” (strona bloga — listy); pozostałe podstrony jak dotąd (B4)
export async function PageSections({ page, locale, wide = false }: { page: Page; locale: Locale; wide?: boolean }) {
  // Odpowiednik strony w drugim języku dla przełącznika języka (adresy mogą się różnić,
  // np. /pl/o-mnie ↔ /en/about). Bez tłumaczenia — strona główna drugiego języka.
  const translation = await getPageTranslation(page.id, otherLocale(locale))
  const translationPath = translation ? pagePath(translation) : '/'

  return (
    <div className={wide ? lists.page : page.width === 'wide' ? 'max-w-5xl mx-auto px-6 py-16' : 'max-w-3xl mx-auto px-6 py-16'}>
      <TranslationStore path={translationPath} />
      {(page.sections ?? []).map((section) => (
        <Fragment key={section._key}>{renderSection(section, locale)}</Fragment>
      ))}
    </div>
  )
}
