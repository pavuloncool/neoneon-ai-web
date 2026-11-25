import { getTranslations } from 'next-intl/server'
import { SiteBar, SiteDial } from '@/components/sygnal/SiteChrome'
import { SiteFooter } from '@/components/sygnal/SiteFooter'
import { SiteMotion } from '@/components/sygnal/SiteMotion'
import chrome from '@/components/sygnal/chrome.module.css'
import { PUBLIC_CONTACT_EMAIL } from '@/lib/site'
import { getPricing, getSiteSettings } from '@/lib/queries'
import { BLOG_PATH, resolveHref } from '@/lib/links'
import { priceExamples } from '@/lib/pricing'
import { CONTACT_PATH, sectionAnchor } from '@/lib/onePager'
import { LEGAL_PATHS, getLegalDoc } from '@/lib/legal'

// Linki do polityk z Sanity pomijamy — stopka dodaje je sama (z kodu), żeby się nie dublowały
const LEGAL_HREFS = Object.values(LEGAL_PATHS).flatMap((paths) => Object.values(paths))
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

  const lang = toLocale(locale)
  const navLinks = toLinks(settings?.navigation, hidden)
  // Pozycje koła = menu z Sanity; „Start” na początku, jeśli menu go nie ma
  const dialItems = [
    ...(navLinks.some((l) => l.href === '/') ? [] : [{ key: 'start', label: 'Start', href: '/' }]),
    ...navLinks.filter((l) => !l.external).map((l) => ({ key: l.href, label: l.label, href: l.href })),
    ...(navLinks.some((l) => l.href === BLOG_PATH) ? [] : [{ key: BLOG_PATH, label: 'Blog', href: BLOG_PATH }]),
  ]
  const logo = { src: settings?.logoDark?.url ?? '/neoneon-dark.webp', alt: settings?.logoAlt ?? 'neoneon' }
  const langLabels = { pl: a11y.languagePl ?? fallback('languagePl'), en: a11y.languageEn ?? fallback('languageEn') }

  return (
    <div className={chrome.shell}>
      {/* SC 2.4.1 — Skip link: pierwszy element strony, ukryty wizualnie, widoczny przy fokusie */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[#CCFF00] focus:text-black focus:text-sm focus:rounded"
      >
        {a11y.skipToContent ?? fallback('skipToContent')}
      </a>
      {/* „Sygnał”: bez menu w pasku — nawigacją jest koło w prawym dolnym rogu (SiteDial) */}
      <SiteBar locale={lang} logo={logo} contactHref={CONTACT_PATH[lang]} langLabels={langLabels} />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <SiteFooter
        locale={lang}
        logo={logo}
        text={settings?.footerText ?? '© {year} NEONEON.'}
        navLabel={a11y.footerNav ?? fallback('footerNav')}
        links={toLinks(settings?.footerLinks, hidden).filter((l) => !LEGAL_HREFS.includes(l.href))}
        legalLinks={(['privacy', 'cookies'] as const).map((key) => ({
          href: LEGAL_PATHS[key][lang],
          label: getLegalDoc(key, lang).title,
        }))}
        contactHref={CONTACT_PATH[lang]}
        email={PUBLIC_CONTACT_EMAIL}
      />
      <SiteMotion />
      <SiteDial locale={lang} items={dialItems} contactHref={CONTACT_PATH[lang]} email={PUBLIC_CONTACT_EMAIL} langLabels={langLabels} />
    </div>
  )
}
