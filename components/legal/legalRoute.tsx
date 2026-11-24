// components/legal/legalRoute.tsx
// Wspólna logika tras polityk: strona istnieje tylko w swoim języku (np. /pl/polityka-cookies,
// /en/cookie-policy); w drugim języku — 404. Metadane z hreflang do odpowiednika.
// ⚠️ Treść robocza — wymaga weryfikacji prawnej przed publikacją produkcyjną (lib/legal.ts).
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { LegalPage } from '@/components/legal/LegalPage'
import { seoMetadata } from '@/lib/metadata'
import { LEGAL_PATHS, getLegalDoc, type LegalKey } from '@/lib/legal'
import { otherLocale, type Locale } from '@/lib/locales'

type Params = { params: Promise<{ locale: Locale }> }

export function legalRoute(docKey: LegalKey, pageLocale: Locale) {
  return {
    async generateMetadata({ params }: Params): Promise<Metadata> {
      const { locale } = await params
      if (locale !== pageLocale) return {}
      const doc = getLegalDoc(docKey, locale)
      return seoMetadata({
        locale,
        path: LEGAL_PATHS[docKey][locale],
        altPath: LEGAL_PATHS[docKey][otherLocale(locale)],
        title: doc.title,
        description: doc.description,
      })
    },
    async Page({ params }: Params) {
      const { locale } = await params
      if (locale !== pageLocale) notFound()
      return <LegalPage docKey={docKey} locale={locale} />
    },
  }
}
