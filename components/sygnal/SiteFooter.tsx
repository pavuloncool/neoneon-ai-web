// components/sygnal/SiteFooter.tsx
// Stopka „Sygnał”: druga warstwa nawigacji (artykuł nawigacyjny: sekcje semantyczne z nagłówkami).
// Linki z ustawień strony w Sanity, polityki z kodu (lib/legal.ts), adres z lib/site.ts.

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { linkHref } from '@/lib/links'
import type { Locale } from '@/lib/locales'
import { CHROME_LABELS } from './labels'
import c from './chrome.module.css'

interface Props {
  locale: Locale
  logo: { src: string; alt: string }
  text: string
  navLabel: string
  links: { href: string; label: string; external: boolean }[]
  legalLinks: { href: string; label: string }[]
  contactHref: string
  email: string
}

export function SiteFooter({ locale, logo, text, navLabel, links, legalLinks, contactHref, email }: Props) {
  const t = CHROME_LABELS[locale]
  return (
    <footer className={c.footer}>
      <div>
        <Image src={logo.src} alt={logo.alt} width={168} height={28} className={c.logoImg} />
        <p className={c.claim}>
          {locale === 'pl' ? (
            <>
              Wiesz, co oferujesz. <span>Teraz to sprzedaj.</span>
            </>
          ) : (
            <>
              You know what you offer. <span>Now sell it.</span>
            </>
          )}
        </p>
      </div>
      <nav aria-label={navLabel}>
        <h2>{t.footerNav}</h2>
        <ul>
          {links.map((link) => (
            <li key={link.href}>
              {link.external ? (
                <a href={link.href} target="_blank" rel="noopener noreferrer">
                  {link.label}
                </a>
              ) : (
                <Link href={linkHref(link.href)}>{link.label}</Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div>
        <h2>{t.footerTalk}</h2>
        <ul>
          <li>
            <Link href={contactHref}>{t.cta} →</Link>
          </li>
          <li>
            <a href={`mailto:${email}`}>{email}</a>
          </li>
        </ul>
      </div>
      <div>
        <h2>{t.footerLegal}</h2>
        <ul>
          {legalLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </div>
      <p className={c.copy}>{text.replace('{year}', String(new Date().getFullYear()))}</p>
    </footer>
  )
}
