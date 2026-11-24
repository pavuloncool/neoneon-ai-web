// lib/sitemap.ts
// Budowa wpisów sitemapy z danych Sanity (bez pobierania) — osobno od app/sitemap.ts, żeby dało się ją testować.

import type { MetadataRoute } from 'next'
import { localeUrl } from '@/lib/site'
import type { Locale } from '@/lib/locales'
import type { SitemapData } from '@/lib/queries'
import { pagePath } from '@/lib/links'
import { LOCALES } from '@/lib/locales'
import { REDIRECTED_PAGE_SLUGS } from '@/lib/onePager'
import { LEGAL_PATHS } from '@/lib/legal'

// Polityki są w kodzie (lib/legal.ts) — strony Sanity o tych slugach nie są już wyświetlane
const LEGAL_SLUGS = Object.values(LEGAL_PATHS).flatMap((paths) => Object.values(paths).map((p) => p.slice(1)))

type Doc = { _id: string; locale: Locale; path: string; modifiedAt: string | null }

// Jak w lib/metadata.ts: x-default wskazuje wersję PL, jeśli istnieje
function withDefault(languages: Partial<Record<Locale, string>>): Record<string, string> {
  return languages.pl ? { ...languages, 'x-default': languages.pl } : (languages as Record<string, string>)
}

// Późniejsza z dwóch dat ISO (różne formaty strefy, więc porównanie przez Date.parse)
function newer(a: string | null, b: string | null): string | null {
  if (!a) return b
  if (!b) return a
  return Date.parse(b) > Date.parse(a) ? b : a
}

export function buildSitemap({ pages, articles, categories, translations }: SitemapData): MetadataRoute.Sitemap {
  const docs: Doc[] = [
    // Strony przekierowane 301 na sekcję strony głównej (next.config.ts) nie trafiają do sitemapy
    ...pages.flatMap((p) => ((p.isHome || p.slug) && !REDIRECTED_PAGE_SLUGS.includes(p.slug ?? '') && !LEGAL_SLUGS.includes(p.slug ?? '') ? [{ ...p, path: pagePath(p) }] : [])),
    ...articles.map((a) => ({ ...a, path: `/${a.category}/${a.slug}` })),
  ]
  const byId = new Map(docs.map((d) => [d._id, d]))

  // Dokument → identyfikatory jego wersji językowych (z translation.metadata); brak powiązania = sam dokument
  const groupIds = new Map<string, string[]>()
  for (const { refs } of translations) {
    for (const id of refs ?? []) groupIds.set(id, refs ?? [])
  }
  const groupOf = (id: string) => groupIds.get(id) ?? [id]

  // Strona główna (one-pager w kodzie) — w każdym języku, bez daty modyfikacji
  const homeLanguages = withDefault(Object.fromEntries(LOCALES.map((l) => [l, localeUrl(l)])))
  const homeEntries: MetadataRoute.Sitemap = LOCALES.map((l) => ({ url: localeUrl(l), alternates: { languages: homeLanguages } }))
  // Polityki prywatności i cookies (w kodzie) — z odpowiednikami językowymi
  for (const paths of Object.values(LEGAL_PATHS)) {
    const languages = withDefault(Object.fromEntries(LOCALES.map((l) => [l, localeUrl(l, paths[l])])))
    homeEntries.push(...LOCALES.map((l) => ({ url: localeUrl(l, paths[l]), alternates: { languages } })))
  }

  const entries: MetadataRoute.Sitemap = [...homeEntries, ...docs.map((d) => {
    const group = groupOf(d._id).flatMap((id) => byId.get(id) ?? [])
    return {
      url: localeUrl(d.locale, d.path),
      lastModified: d.modifiedAt ?? undefined,
      alternates: { languages: withDefault(Object.fromEntries((group.length ? group : [d]).map((g) => [g.locale, localeUrl(g.locale, g.path)]))) },
    }
  })]

  // Strony kategorii: tylko kategorie z artykułami. lastmod = najnowsza data modyfikacji jej artykułu.
  // Odpowiedniki językowe z translation.metadata kategorii (slug w każdym języku może być inny),
  // też tylko te z artykułami. Kolejność: grupy tłumaczeń wg pierwszego artykułu, w grupie — języki wg artykułów.
  const categoryById = new Map(categories.map((c) => [c._id, c]))
  const modifiedByCategory = new Map<string, string | null>()
  const groups = new Map<string, string[]>() // klucz grupy → id kategorii w kolejności pierwszego artykułu
  for (const a of articles) {
    if (!categoryById.has(a.categoryId)) continue
    const known = modifiedByCategory.has(a.categoryId)
    modifiedByCategory.set(a.categoryId, newer(modifiedByCategory.get(a.categoryId) ?? null, a.modifiedAt))
    if (known) continue
    const key = groupOf(a.categoryId).join('|')
    groups.set(key, [...(groups.get(key) ?? []), a.categoryId])
  }
  for (const ids of groups.values()) {
    const members = ids.flatMap((id) => categoryById.get(id) ?? [])
    const languages = withDefault(Object.fromEntries(members.map((c) => [c.locale, localeUrl(c.locale, `/${c.slug}`)])))
    for (const c of members) {
      entries.push({ url: localeUrl(c.locale, `/${c.slug}`), lastModified: modifiedByCategory.get(c._id) ?? undefined, alternates: { languages } })
    }
  }

  return entries
}
