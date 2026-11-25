import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import Script from 'next/script'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { DraftTools } from '@/components/layout/DraftTools'
import { HtmlClassGuard } from '@/components/layout/HtmlClassGuard'
import { BootScript } from '@/components/layout/BootScript'
import { SpeedInsightsClient } from '@/components/layout/SpeedInsightsClient'
import { AnalyticsClient } from '@/components/layout/AnalyticsClient'
import { getSiteSettings } from '@/lib/queries'
import { IS_PRODUCTION, SITE_NAME, SITE_URL, localeUrl } from '@/lib/site'
import { OG_LOCALE, isLocale, toLocale } from '@/lib/locales'
import type { Metadata } from 'next'

// Umami działa tylko z NEXT_PUBLIC_UMAMI_WEBSITE_ID; brak na produkcji = statystyki wyłączone (ostrzeżenie raz na proces)
if (IS_PRODUCTION && !process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) {
  console.warn('Umami: brak NEXT_PUBLIC_UMAMI_WEBSITE_ID — statystyki wyłączone')
}

const MOTION_BOOTSTRAP =
  "(function(){var d=document.documentElement;d.classList.add('js');setTimeout(function(){if(window.__motionReady!==true){d.classList.remove('js');window.__motionFallback=true}},3000)})()"

// Domyślne SEO z ustawień strony w Sanity; brakujące pola uzupełnia app/layout.tsx
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const lang = toLocale(locale)
  const settings = await getSiteSettings(lang)
  if (!settings) return {}
  const og = settings.ogImage?.url
    ? { url: settings.ogImage.url, width: settings.ogImage.width ?? undefined, height: settings.ogImage.height ?? undefined, alt: settings.logoAlt ?? 'neoneon' }
    : null
  return {
    ...(settings.siteTitle ? { title: { default: settings.siteTitle, template: settings.titleTemplate ?? '%s' } } : {}),
    ...(settings.description ? { description: settings.description } : {}),
    ...(og ? { openGraph: { type: 'website', url: localeUrl(lang), siteName: SITE_NAME, locale: OG_LOCALE[lang], images: [og] } } : {}),
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const messages = await getMessages()
  const isDraftMode = (await draftMode()).isEnabled
  const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID

  return (
    <html
      lang={locale}
      // globals.css ustawia scroll-behavior: smooth — ten atrybut każe Next.js wyłączyć je na czas zmiany
      // strony. Bez niego przewinięcie na górę animowało się i urywało, gdy nowa strona była niższa
      // (np. przejście do /kontakt lądowało przy stopce).
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Znacznik JS przed hydracją — CSS ustawia stany startowe animacji tylko pod html.js.
            Siatka bezpieczeństwa: jeśli GSAP nie wystartował w 3 s, zdejmujemy znacznik i treść jest widoczna. */}
        <BootScript code={MOTION_BOOTSTRAP} />
        {/* Kroje „Sygnał” od razu (bez późnej podmiany i przesunięć układu): Archivo — nagłówki i tekst,
            Plex Mono — etykiety. Tylko zakres latin; latin-ext (polskie znaki) dociąga unicode-range. */}
        <link rel="preload" href="/fonts/archivo-var-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/ibm-plex-mono-400-latin.woff2" as="font" type="font/woff2" crossOrigin="" />
      </head>
      <body className="bg-paper text-ink antialiased transition-colors duration-300">
        {/* Przywraca klasy js / dark|light na <html> po zmianie języka (przed malowaniem) */}
        <HtmlClassGuard />
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
        {/* Podgląd szkiców z Presentation Tool w Studio — klikalna edycja treści */}
        {isDraftMode && <DraftTools />}
        {/* Umami — analityka bez cookies; data-domains pomija podglądy Vercel i localhost */}
        {!isDraftMode && umamiWebsiteId && (
          <Script
            src="/stats/script.js"
            data-website-id={umamiWebsiteId}
            data-host-url="/stats"
            data-domains={new URL(SITE_URL).hostname}
            strategy="afterInteractive"
          />
        )}
        {/* Vercel Speed Insights — metryki wydajności bez cookies, adres bez parametrów zapytania */}
        {!isDraftMode && <SpeedInsightsClient />}
        {/* Vercel Web Analytics — odwiedziny bez cookies, adres bez parametrów zapytania */}
        {!isDraftMode && <AnalyticsClient />}
      </body>
    </html>
  )
}
