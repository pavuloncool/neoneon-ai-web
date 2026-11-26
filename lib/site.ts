// lib/site.ts
// Adres produkcyjny i nazwa witryny — źródło dla canonical, hreflang, Open Graph, sitemapy i JSON-LD.

import type { Locale } from '@/lib/locales'

const DEFAULT_SITE_URL = 'https://neoneon.online'

// Adres z NEXT_PUBLIC_SITE_URL (na Vercel: Production i Preview = https://neoneon.online, więc podglądy
// też wskazują produkcję jako canonical). Brak zmiennej = adres domyślny + ostrzeżenie w logu serwera.
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '')
if (!process.env.NEXT_PUBLIC_SITE_URL && typeof window === 'undefined') {
  console.warn(`NEXT_PUBLIC_SITE_URL: brak zmiennej — używam ${DEFAULT_SITE_URL}`)
}

// Środowisko Vercel: 'production' | 'preview' | 'development'; lokalnie brak = nie-produkcja.
// W przeglądarce dostępne tylko NEXT_PUBLIC_VERCEL_ENV (Vercel ustawia je sam dla Next.js).
export const IS_PRODUCTION = (process.env.VERCEL_ENV ?? process.env.NEXT_PUBLIC_VERCEL_ENV) === 'production'

// SITE_STAGING=1 (Vercel → Environment Variables): produkcyjny build na adresie roboczym (*.vercel.app)
// — wyłącza blokadę adresu w next.config.ts i indeksowanie (robots.txt + X-Robots-Tag).
export const IS_STAGING = process.env.SITE_STAGING === '1'
export const IS_INDEXABLE = IS_PRODUCTION && !IS_STAGING

// Adresy e-mail formularzy (Resend): nadawca musi być w domenie zweryfikowanej w Resend
// Nadawca powiadomień = adres publiczny strony (decyzja właściciela 25.11.2026); domena zweryfikowana w Resend
export const FORM_FROM_EMAIL = 'web@neoneon.online'
// Adresat powiadomień z formularzy (kontakt, komentarze) — od 25.11.2026 ten sam adres co publiczny
export const CONTACT_EMAIL = 'web@neoneon.online'
// Adres pokazywany na stronie (formularz kontaktowy: „Wolisz e-mail?”, komunikat błędu wysyłki).
// CONTACT_EMAIL powyżej to adresat powiadomień z formularzy — osobno.
export const PUBLIC_CONTACT_EMAIL = 'web@neoneon.online'
// Telefon pokazywany przy formularzu kontaktowym („Wolisz zadzwonić?”): tekst do wyświetlenia i numer do linku tel:
export const PUBLIC_CONTACT_PHONE = { display: '+48 573 363 234', href: '+48573363234' }

// Komentarze pod artykułami — „zamrażarka” (decyzja właściciela 25.11.2026): kod, schemat Sanity i API zostają,
// ale sekcja komentarzy nie pojawia się na stronie, a API nie przyjmuje nowych. Włączenie: true.
export const COMMENTS_ENABLED = false

// path bez prefiksu języka: '' = strona główna, '/o-mnie', '/ux-strategies/slug'
export function localeUrl(locale: Locale, path = ''): string {
  return `${SITE_URL}/${locale}${path}`
}
