'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import type { Locale } from '@/lib/locales'

// Logika zmiany języka — wspólna dla starego menu i chrome'u „Sygnał” (components/sygnal/SiteChrome)
export function useLocaleSwitch() {
  const locale = useLocale() as Locale
  const pathname = usePathname()
  const router = useRouter()

  function switchTo(targetLocale: Locale) {
    if (targetLocale === locale) return

    // Odpowiednik strony w drugim języku (artykuł albo strona z page buildera) — patrz TranslationStore
    const translationPath = sessionStorage.getItem('neoneon_translation_path')
    const target = translationPath || pathname

    router.push(target, { locale: targetLocale })
  }

  return { locale, switchTo }
}

export function LanguageSwitcher({
  dark = false,
  className,
  labels,
}: { dark?: boolean; className?: string; labels: { pl: string; en: string } }) {
  const { locale, switchTo } = useLocaleSwitch()

  return (
    <div className={cn('flex items-center gap-0 text-xs tracking-widest', className)}>
      {/* SC 4.1.2 + SC 2.5.8 — aria-pressed informuje o aktywnym języku; py-1 = min. 24 px obszar dotyku.
          SC 2.5.3 — nazwa dostępna zaczyna się od widocznego skrótu („PL, Polski”). Nieaktywny język w pigułce
          mobilnej: white/70 (white/50 dawało kontrast 2,25:1). */}
      <button
        onClick={() => switchTo('pl')}
        aria-pressed={locale === 'pl'}
        aria-label={`PL, ${labels.pl}`}
        className={cn(
          'px-1.5 py-1 transition-colors duration-200',
          locale === 'pl'
            ? dark ? 'text-white font-medium' : 'text-ink dark:text-white font-medium'
            : dark ? 'text-white/70 hover:text-white' : 'text-muted hover:text-ink dark:hover:!text-white'
        )}
      >
        PL
      </button>
      <span className={dark ? 'text-white/20' : 'text-border dark:text-white/20'} aria-hidden="true">|</span>
      <button
        onClick={() => switchTo('en')}
        aria-pressed={locale === 'en'}
        aria-label={`EN, ${labels.en}`}
        className={cn(
          'px-1.5 py-1 transition-colors duration-200',
          locale === 'en'
            ? dark ? 'text-white font-medium' : 'text-ink dark:text-white font-medium'
            : dark ? 'text-white/70 hover:text-white' : 'text-muted hover:text-ink dark:hover:!text-white'
        )}
      >
        EN
      </button>
    </div>
  )
}
