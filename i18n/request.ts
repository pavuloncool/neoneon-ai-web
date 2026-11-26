import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'
import { getSiteCopy } from '@/lib/queries'
import { HOME_FIELDS, UI_GROUPS } from '@/sanity/copyFields'
import { isLocale } from '@/lib/locales'

type Messages = Record<string, unknown>

// Pola systemowe Sanity (_id, _type, _key, _rev…) nie są tekstami — usuwane na każdym poziomie
function clean(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clean)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [k, clean(v)]))
  }
  return value
}

// Całe copy strony pochodzi z Sanity: „Teksty interfejsu” (uiStrings, namespace na grupę)
// i „Strona główna — teksty” (homeCopy → namespace `onePager`). W kodzie nie ma tekstów zapasowych:
// brak dokumentu albo błąd Sanity przerywa render, zamiast po cichu pokazać stary tekst.
async function loadMessages(locale: string): Promise<Messages> {
  const { ui, home } = await getSiteCopy(locale)
  if (!ui || !home) {
    throw new Error(`Copy strony: brak dokumentu ${!ui ? `uiStrings-${locale}` : ''} ${!home ? `homeCopy-${locale}` : ''} w Sanity`.trim())
  }
  const messages: Messages = {}
  for (const { name } of UI_GROUPS) messages[name] = clean(ui[name] ?? {})
  messages.onePager = Object.fromEntries(HOME_FIELDS.map(({ key }) => [key, clean(home[key])]))
  return messages
}

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale
  if (!isLocale(locale)) {
    locale = routing.defaultLocale
  }
  return { locale, messages: await loadMessages(locale) }
})
