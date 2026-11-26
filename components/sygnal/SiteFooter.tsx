// components/sygnal/SiteFooter.tsx
// Stopka „Sygnał”: druga warstwa nawigacji (artykuł nawigacyjny: sekcje semantyczne z nagłówkami).
// Linki z ustawień strony w Sanity, nazwy polityk z dokumentów „Polityki”, teksty z „Teksty interfejsu” (chrome.footer).

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { linkHref } from '@/lib/links'
import type { Locale } from '@/lib/locales'
import { getTranslations } from 'next-intl/server'
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

export async function SiteFooter({ locale, logo, text, navLabel, links, legalLinks, contactHref, email }: Props) {
  const t = await getTranslations({ locale, namespace: 'chrome' })
  return (
    <footer className={c.footer}>
      <div>
        <Image src={logo.src} alt={logo.alt} width={168} height={28} className={c.logoImg} />
        <p className={c.claim}>
          {t('footer.claim')} <span>{t('footer.claimAccent')}</span>
        </p>
      </div>
      <nav aria-label={navLabel}>
        <h2>{t('footer.nav')}</h2>
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
        <h2>{t('footer.talk')}</h2>
        <ul>
          <li>
            <Link href={contactHref}>{t('bar.cta')} →</Link>
          </li>
          <li>
            <a href={`mailto:${email}`}>{email}</a>
          </li>
        </ul>
      </div>
      <div>
        <h2>{t('footer.legal')}</h2>
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
