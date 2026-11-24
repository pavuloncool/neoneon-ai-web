// /{locale}/ui-lab — robocza strona wyboru kolorów i fontu (sesja UI przed iteracją 1).
// Tylko w `next dev`: w buildzie (Vercel, także podglądy) zwraca 404. Do usunięcia po wyborze wariantu.
import { notFound } from 'next/navigation'
import { UiLab } from '@/components/home/UiLab'
import type { Metadata } from 'next'
import type { Locale } from '@/lib/locales'

export const metadata: Metadata = { title: 'Sesja UI', robots: { index: false, follow: false } }

export default async function UiLabPage({ params }: { params: Promise<{ locale: Locale }> }) {
  if (process.env.NODE_ENV !== 'development') notFound()
  const { locale } = await params
  return <UiLab locale={locale} />
}
