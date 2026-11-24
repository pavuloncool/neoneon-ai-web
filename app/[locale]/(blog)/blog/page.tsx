// Lista bloga /{locale}/blog — dokument `page` z zaznaczonym „Strona bloga” (page builder w Studio;
// do czasu one-pagera była to strona główna). Strona główna /{locale} jest w app/[locale]/(blog)/page.tsx.
import { notFound } from 'next/navigation'
import { getHomePage } from '@/lib/queries'
import { PageSections } from '@/components/sections/SectionRenderer'
import { pageMetadata } from '@/lib/metadata'
import type { Metadata } from 'next'
import type { Locale } from '@/lib/locales'

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  return pageMetadata(await getHomePage(locale), locale)
}

export default async function BlogPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const page = await getHomePage(locale)
  if (!page) notFound()
  return <PageSections page={page} locale={locale} />
}
