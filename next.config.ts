import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

// Produkcja nie może wystartować z adresem podglądu albo bez HTTPS — canonical, hreflang i sitemapa
// wskazałyby wtedy złą domenę (tak było: NEXT_PUBLIC_SITE_URL=https://neoneon.vercel.app w Vercel).
// SITE_STAGING=1 — świadomie roboczy adres *.vercel.app (bez indeksowania, patrz headers() i app/robots.ts).
const IS_STAGING = process.env.SITE_STAGING === '1'
if (process.env.VERCEL_ENV === 'production' && !IS_STAGING) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://neoneon.online'
  let host = ''
  try {
    host = new URL(siteUrl).hostname
  } catch {}
  if (!siteUrl.startsWith('https://') || !host || host.endsWith('.vercel.app')) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL="${siteUrl}" nie nadaje się na produkcję: wymagany adres https:// w docelowej domenie (nie *.vercel.app). ` +
        'Popraw zmienną w Vercel → Settings → Environment Variables (Production) i uruchom wdrożenie ponownie.'
    )
  }
}

const nextConfig: NextConfig = {
  // Dawne polskie adresy sprzed page buildera (zaindeksowane w Google) → nowe slugi
  async redirects() {
    return [
      // „O mnie” to sekcja strony głównej (brief, pkt 2) — 301 na kotwicę
      { source: '/pl/o-mnie', destination: '/pl#o-mnie', statusCode: 301 as const },
      { source: '/en/about', destination: '/en#about', statusCode: 301 as const },
      { source: '/pl/about', destination: '/pl#o-mnie', statusCode: 301 as const },
      { source: '/pl/contact', destination: '/pl/kontakt', statusCode: 301 as const },
      // Wpis „OTP: od free content do frictionless lead generation” usunięty 25.11.2026 — stare adresy
      // (przed i po zmianie nazw kategorii) prowadzą do jego dawnej kategorii zamiast na 404
      { source: '/pl/:cat(strategie-ux|strony-zbudowane-z-ai)/frictionless-lead-generation', destination: '/pl/strony-zbudowane-z-ai', statusCode: 301 as const },
      {
        source: '/en/:cat(ux-strategies|ai-assisted-web-development)/free-content-to-frictionless-lead-generation',
        destination: '/en/ai-assisted-web-development',
        statusCode: 301 as const,
      },
    ]
  },
  // Umami (analityka bez cookies) serwowana z własnej domeny — mniej blokowana przez adblockery
  async rewrites() {
    return [
      { source: '/stats/script.js', destination: 'https://cloud.umami.is/script.js' },
      { source: '/stats/api/send', destination: 'https://cloud.umami.is/api/send' },
    ]
  },
  // Poza produkcją (podglądy Vercel, wersja robocza SITE_STAGING=1, lokalne buildy) — noindex na każdej odpowiedzi
  async headers() {
    // Kroje w public/fonts (preload w layoucie) — pliki niezmienne, długi cache
    const fonts = { source: '/fonts/:file*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] }
    if (process.env.VERCEL_ENV === 'production' && !IS_STAGING) return [fonts]
    return [fonts, { source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
  },
  images: {
    remotePatterns: [
      {
        // Sanity CDN (obrazy artykułów)
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
