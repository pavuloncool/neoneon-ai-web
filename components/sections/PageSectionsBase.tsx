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
        <div className="mt-12 max-w-[44rem]">
          <PortableTextRenderer content={section.body} />
        </div>
      ) : null
    default:
      return null
  }
}

// Kolumna „Sygnał”: szeroka (strona bloga, strony `wide`) albo średnia (np. Kontakt)
export async function PageSections({ page, locale, wide = false }: { page: Page; locale: Locale; wide?: boolean }) {
  // Odpowiednik strony w drugim języku dla przełącznika języka (adresy mogą się różnić,
  // np. /pl/o-mnie ↔ /en/about). Bez tłumaczenia — strona główna drugiego języka.
  const translation = await getPageTranslation(page.id, otherLocale(locale))
  const translationPath = translation ? pagePath(translation) : '/'

  return (
    <div className={wide || page.width === 'wide' ? lists.page : `${lists.page} ${lists.mid}`}>
      <TranslationStore path={translationPath} />
      {(page.sections ?? []).map((section) => (
        <Fragment key={section._key}>{renderSection(section, locale)}</Fragment>
      ))}
    </div>
  )
}
