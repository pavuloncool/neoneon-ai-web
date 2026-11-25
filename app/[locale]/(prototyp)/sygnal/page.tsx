import type { Metadata } from 'next'
import { SygnalPage } from '@/components/sygnal/SygnalPage'

// Prototyp kierunku „Sygnał” (makiety S01–S07 na płótnie): hero, jedno koło jako nawigacja.
// Poza grupą (blog) — bez starego menu i stopki. Nie do indeksowania.
export const metadata: Metadata = {
  title: 'Sygnał — prototyp | neoneon',
  robots: { index: false, follow: false },
}

export default function Page() {
  return <SygnalPage />
}
