import { getTranslations } from 'next-intl/server'
import { Nav } from '@/components/layout/Nav'
import { Footer } from '@/components/layout/Footer'
import { getPricing, getSiteSettings } from '@/lib/queries'
import { resolveHref } from '@/lib/links'
import { priceExamples } from '@/lib/pricing'
import { sectionAnchor } from '@/lib/onePager'
import type { NavItem } from '@/types'
import { toLocale, type Locale } from '@/lib/locales'

// Pozycje menu z Sanity → { href, label, highlight }; pomija linki bez celu (np. usunięta strona)
// i linki do ukrytych sekcji strony głównej
function toLinks(items: NavItem[] | null | undefined, hiddenHrefs: string[]) {
  return (items ?? []).flatMap((item) => {
    const resolved = resolveHref(item.link)
    if (!resolved || hiddenHrefs.includes(resolved.href)) return []
    return [{ ...resolved, label: item.label, highlight: Boolean(item.highlight) }]
  })
}

// Sekcja wycen nie renderuje się, gdy jest wyłączona albo bez opublikowanych przykładów —
// wtedy znika też link „Wyceny” (brief 5.7)
async function hiddenSectionHrefs(locale: Locale): Promise<string[]> {
  try {
    const pricing = await getPricing(locale)
    const visible = pricing.settings?.showRates !== false && priceExamples(pricing).length > 0
    return visible ? [] : [`/#${sectionAnchor('pricing', locale)}`]
  } catch {
    return [`/#${sectionAnchor('pricing', locale)}`]
  }
}

export default async function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const settings = await getSiteSettings(toLocale(locale))
  const hidden = await hiddenSectionHrefs(toLocale(locale))
  const a11y = settings?.a11y ?? {}
  // Zapasowe etykiety a11y (gdy pole w Ustawieniach strony jest puste) — w języku strony
  const fallback = await getTranslations({ locale: toLocale(locale), namespace: 'a11y' })

  return (
    <>
      {/* SC 2.4.1 — Skip link: pierwszy element strony, ukryty wizualnie, widoczny przy fokusie */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-ink focus:text-paper focus:text-sm focus:rounded"
      >
        {a11y.skipToContent ?? fallback('skipToContent')}
      </a>
      <Nav
        links={toLinks(settings?.navigation, hidden)}
        logo={{
          light: settings?.logoLight?.url ?? '/neoneon-light.webp',
          dark: settings?.logoDark?.url ?? '/neoneon-dark.webp',
          alt: settings?.logoAlt ?? 'neoneon',
        }}
        labels={{
          mainNav: a11y.mainNav ?? fallback('mainNav'),
          mobileNav: a11y.mobileNav ?? fallback('mobileNav'),
          search: a11y.search ?? fallback('search'),
          menu: a11y.menu ?? fallback('menu'),
          themeToggle: a11y.themeToggle ?? fallback('themeToggle'),
          languagePl: a11y.languagePl ?? fallback('languagePl'),
          languageEn: a11y.languageEn ?? fallback('languageEn'),
        }}
      />
      <main id="main-content" className="pt-14 min-h-screen">
        {children}
      </main>
      <Footer
        text={settings?.footerText ?? '© {year} NEONEON.'}
        links={toLinks(settings?.footerLinks, hidden)}
        navLabel={a11y.footerNav ?? fallback('footerNav')}
      />
    </>
  )
}
