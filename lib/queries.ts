// lib/queries.ts
// Artykuły, tagi i komentarze → Sanity (GROQ).
// Projekcja GROQ zwraca ten sam kształt co dawne wiersze Supabase (typ Article),
// dzięki czemu strony i komponenty nie wymagają zmian.

import { cache } from 'react'
import { groq } from 'next-sanity'
import { client, draftsClient } from '@/sanity/lib/client'
import { sanityFetch } from '@/sanity/lib/fetch'
import { CATEGORY_SLUG, LINK_PROJECTION } from '@/lib/links'
import type { Article, ArticleListItem, CategoryDoc, Tag, Comment, Page, SiteSettings } from '@/types'
import { readingMinutesFromText } from '@/lib/utils'
import { DEFAULT_LOCALE, type Locale } from '@/lib/locales'

const TAG_PROJECTION = groq`{ "id": _id, name, "name_en": nameEn, "slug": slug.current }`

// Kategoria artykułu = slug dokumentu `category` (referencja categoryRef)
const ARTICLE_CATEGORY = CATEGORY_SLUG

// Data modyfikacji artykułu (og, JSON-LD, sitemapa): ręcznie ustawiana „Data aktualizacji treści”,
// a bez niej data publikacji. Nie _updatedAt — ten zmienia każda edycja i migracja, także techniczna.
const ARTICLE_MODIFIED = groq`coalesce(contentUpdatedAt, publishedAt)`

const ARTICLE_PROJECTION = groq`{
  "id": _id,
  "slug": slug.current,
  title,
  excerpt,
  "seo_title": seoTitle,
  "seo_description": seoDescription,
  content,
  "category": ${ARTICLE_CATEGORY},
  "category_title": categoryRef->title,
  "category_previous_slugs": categoryRef->previousSlugs,
  "cover_image_url": coverImage.asset->url,
  "cover_focal_x": coverImage.hotspot.x,
  "cover_focal_y": coverImage.hotspot.y,
  "status": select(_id in path("drafts.**") => "draft", "published"),
  "published_at": publishedAt,
  "created_at": _createdAt,
  "updated_at": ${ARTICLE_MODIFIED},
  "tags": tags[]->${TAG_PROJECTION},
  "faq": faq[]{ question, answer },
  locale
}`

// Lista artykułów: bez `content` i `faq`. Zamiast treści — sam tekst (pt::text), z którego serwer liczy
// czas czytania; tekst nie trafia dalej (komponenty dostają tylko reading_minutes).
const ARTICLE_LIST_PROJECTION = groq`{
  "id": _id,
  "slug": slug.current,
  title,
  excerpt,
  "seo_title": seoTitle,
  "seo_description": seoDescription,
  "plain_text": pt::text(content),
  "category": ${ARTICLE_CATEGORY},
  "category_title": categoryRef->title,
  "cover_image_url": coverImage.asset->url,
  "cover_focal_x": coverImage.hotspot.x,
  "cover_focal_y": coverImage.hotspot.y,
  "status": select(_id in path("drafts.**") => "draft", "published"),
  "published_at": publishedAt,
  "created_at": _createdAt,
  "updated_at": ${ARTICLE_MODIFIED},
  "tags": tags[]->${TAG_PROJECTION},
  locale
}`

type ArticleListRow = Omit<ArticleListItem, 'reading_minutes'> & { plain_text: string | null }

function toListItems(rows: ArticleListRow[]): ArticleListItem[] {
  return rows.map(({ plain_text, ...rest }) => ({ ...rest, reading_minutes: readingMinutesFromText(plain_text) }))
}

// ── Artykuły ────────────────────────────────────────────────

export async function getArticles(options?: {
  category?: string
  tag?: string
  limit?: number
  locale?: Locale
}): Promise<ArticleListItem[]> {
  const filters = ['_type == "article"', 'locale == $locale']
  const params: Record<string, string> = { locale: options?.locale ?? DEFAULT_LOCALE }
  if (options?.category) {
    filters.push(`${ARTICLE_CATEGORY} == $category`)
    params.category = options.category
  }
  if (options?.tag) {
    filters.push('references(*[_type == "tag" && slug.current == $tag]._id)')
    params.tag = options.tag
  }
  const slice = options?.limit ? `[0...${Math.floor(options.limit)}]` : ''

  try {
    return toListItems(await sanityFetch<ArticleListRow[]>(
      groq`*[${filters.join(' && ')}] | order(publishedAt desc) ${slice} ${ARTICLE_LIST_PROJECTION}`,
      params
    ))
  } catch (error) {
    console.error('getArticles error:', error)
    return []
  }
}

export async function getArticleBySlug(
  slug: string,
  locale: Locale = 'pl'
): Promise<Article | null> {
  return sanityFetch<Article | null>(
    groq`*[_type == "article" && slug.current == $slug && locale == $locale][0] ${ARTICLE_PROJECTION}`,
    { slug, locale }
  )
}

export async function searchArticles(
  query: string,
  locale: Locale = 'pl'
): Promise<ArticleListItem[]> {
  // `match` dopasowuje prefiksy słów — dla każdego słowa zapytania osobny warunek (AND)
  const terms = query.trim().split(/\s+/).filter(Boolean).map((t) => `${t}*`)
  if (terms.length === 0) return []
  const conditions = terms.map((_, i) => `[title, excerpt, pt::text(content)] match $t${i}`).join(' && ')
  const params = Object.fromEntries(terms.map((t, i) => [`t${i}`, t]))

  try {
    return toListItems(await sanityFetch<ArticleListRow[]>(
      groq`*[_type == "article" && locale == $locale && ${conditions}] | order(publishedAt desc) ${ARTICLE_LIST_PROJECTION}`,
      { locale, ...params }
    ))
  } catch (error) {
    console.error('searchArticles error:', error)
    return []
  }
}

// Wersja artykułu w drugim języku — powiązanie przez dokument translation.metadata
export async function getArticleTranslation(
  articleId: string,
  targetLocale: Locale
): Promise<Article | null> {
  return sanityFetch<Article | null>(
    groq`*[_type == "article" && locale == $targetLocale && _id in *[_type == "translation.metadata" && references($articleId)].translations[].value._ref][0] ${ARTICLE_PROJECTION}`,
    { articleId, targetLocale }
  )
}

// ── Tagi ─────────────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  return sanityFetch<Tag[]>(groq`*[_type == "tag"] | order(name asc) ${TAG_PROJECTION}`)
}

// ── Kategorie ────────────────────────────────────────────────

const CATEGORY_PROJECTION = groq`{
  "id": _id, title, "slug": slug.current, description,
  "seo_title": seoTitle, "seo_description": seoDescription
}`

// cache(): metadane i strona w jednym żądaniu dzielą jedno zapytanie
export const getCategory = cache(async (locale: Locale, slug: string): Promise<CategoryDoc | null> =>
  sanityFetch<CategoryDoc | null>(
    groq`*[_type == "category" && slug.current == $slug && locale == $locale][0]${CATEGORY_PROJECTION}`,
    { locale, slug }
  )
)

// Kategoria, która miała kiedyś ten slug (`previousSlugs`) — do przekierowania 308 starego adresu.
// Wywoływane tylko wtedy, gdy adresu nie da się rozwiązać inaczej (brak kategorii i strony).
export async function getCategorySlugByPreviousSlug(locale: Locale, slug: string): Promise<string | null> {
  return sanityFetch<string | null>(
    groq`*[_type == "category" && locale == $locale && $slug in previousSlugs][0].slug.current`,
    { locale, slug }
  )
}

// Wersja kategorii w drugim języku — powiązanie przez dokument translation.metadata
export const getCategoryTranslation = cache(async (categoryId: string, targetLocale: Locale): Promise<{ slug: string | null } | null> =>
  sanityFetch<{ slug: string | null } | null>(
    groq`*[_type == "category" && locale == $targetLocale && _id in *[_type == "translation.metadata" && references($categoryId)].translations[].value._ref][0]{ "slug": slug.current }`,
    { categoryId: categoryId.replace(/^drafts\./, ''), targetLocale }
  )
)

// ── Komentarze ───────────────────────────────────────────────

// Tylko zatwierdzone w Studio. Komentarze są szkicami, więc czytamy je tokenem;
// e-mail autora nie trafia do projekcji.
export async function getCommentsByArticle(articleId: string): Promise<Comment[]> {
  return draftsClient.fetch<Comment[]>(
    groq`*[_type == "comment" && article._ref == $articleId && approved == true] | order(submittedAt asc) {
      "id": _id,
      "article_id": article._ref,
      "author_name": authorName,
      body,
      "approved": true,
      "created_at": submittedAt
    }`,
    { articleId }
  )
}

// ── Treść strony: ustawienia, strony z sekcji, teksty interfejsu ──────────

const IMAGE_PROJECTION = groq`{ "url": asset->url, alt, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height, hotspot }`
const NAV_PROJECTION = groq`{ label, highlight, "link": link${LINK_PROJECTION} }`

// cache(): layout, metadane i strona w jednym żądaniu dzielą jedno zapytanie
export const getSiteSettings = cache(async (locale: Locale): Promise<SiteSettings | null> =>
  sanityFetch<SiteSettings | null>(
    groq`*[_type == "siteSettings" && locale == $locale][0]{
      siteTitle, titleTemplate, description,
      "ogImage": ogImage${IMAGE_PROJECTION},
      "logoLight": logoLight${IMAGE_PROJECTION},
      "logoDark": logoDark${IMAGE_PROJECTION},
      logoAlt,
      "navigation": navigation[]${NAV_PROJECTION},
      footerText,
      "footerLinks": footerLinks[]${NAV_PROJECTION},
      a11y
    }`,
    { locale }
  )
)

const PAGE_PROJECTION = groq`{
  "id": _id, title, "slug": slug.current, isHome, width,
  "seo": seo{ title, description, "image": image${IMAGE_PROJECTION} },
  "sections": sections[]{
    ...,
    _type == "textImage" => { "image": image${IMAGE_PROJECTION}, "ctaLink": ctaLink${LINK_PROJECTION} },
    _type == "categoryTiles" => { "tiles": tiles[]{ _key, title, "category": ${CATEGORY_SLUG} } }
  }
}`

export const getHomePage = cache(async (locale: Locale): Promise<Page | null> =>
  sanityFetch<Page | null>(groq`*[_type == "page" && isHome == true && locale == $locale][0]${PAGE_PROJECTION}`, { locale })
)

export const getPage = cache(async (locale: Locale, slug: string): Promise<Page | null> =>
  sanityFetch<Page | null>(
    groq`*[_type == "page" && isHome != true && slug.current == $slug && locale == $locale][0]${PAGE_PROJECTION}`,
    { locale, slug }
  )
)

// Wersja strony w drugim języku — powiązanie przez dokument translation.metadata
export async function getPageTranslation(
  pageId: string,
  targetLocale: Locale
): Promise<{ slug: string | null; isHome: boolean | null } | null> {
  return sanityFetch(
    groq`*[_type == "page" && locale == $targetLocale && _id in *[_type == "translation.metadata" && references($pageId)].translations[].value._ref][0]{ "slug": slug.current, isHome }`,
    { pageId: pageId.replace(/^drafts\./, ''), targetLocale }
  )
}

// Sitemapa — tylko opublikowane treści (bez podglądu szkiców), z powiązaniami tłumaczeń
export interface SitemapData {
  // modifiedAt: strony = _updatedAt, artykuły = ARTICLE_MODIFIED (null = brak daty)
  pages: { _id: string; locale: Locale; isHome: boolean | null; slug: string | null; modifiedAt: string }[]
  articles: { _id: string; locale: Locale; category: string; categoryId: string; slug: string; modifiedAt: string | null }[]
  categories: { _id: string; locale: Locale; slug: string }[]
  translations: { refs: string[] | null }[]
}

export async function getSitemapData(): Promise<SitemapData> {
  return client.fetch<SitemapData>(groq`{
    "pages": *[_type == "page" && defined(locale)]{ _id, locale, isHome, "slug": slug.current, "modifiedAt": _updatedAt },
    "articles": *[_type == "article" && defined(locale) && defined(slug.current) && defined(${ARTICLE_CATEGORY})]{ _id, locale, "category": ${ARTICLE_CATEGORY}, "categoryId": categoryRef._ref, "slug": slug.current, "modifiedAt": ${ARTICLE_MODIFIED} },
    "categories": *[_type == "category" && defined(locale) && defined(slug.current)]{ _id, locale, "slug": slug.current },
    "translations": *[_type == "translation.metadata"]{ "refs": translations[].value._ref }
  }`)
}

// Teksty interfejsu — nakładane na messages/*.json w i18n/request.ts
export const getUiStrings = cache(async (locale: string): Promise<Record<string, Record<string, string>> | null> =>
  sanityFetch<Record<string, Record<string, string>> | null>(
    groq`*[_type == "uiStrings" && locale == $locale][0]`,
    { locale }
  )
)

// ── Strona główna (one-pager): wyceny i FAQ ──────────────────────────────────

export interface PricingRate {
  id: string
  key: string | null
  label: string | null // z Ustawień wycen w danym języku, a bez niej — nazwa w Studio
  amountPLN: number | null
  amountEUR: number | null
}

export interface PricingData {
  settings: {
    showRates: boolean | null
    currency: 'PLN' | 'EUR' | null
    roundingPLN: number | null
    roundingEUR: number | null
    note: string | null
    validFrom: string | null
  } | null
  rates: PricingRate[]
  examples: {
    id: string
    title: string | null
    summary: string | null
    items: { _key: string; task: string | null; hoursMin: number | null; hoursMax: number | null; rateId: string | null }[] | null
  }[]
}

// Ustawienia wycen: dokument pojedynczy pricingSettings-{język}. Stawki są wspólne dla języków,
// nazwy stawek — w ustawieniach danego języka (brak = nazwa w Studio). Przykłady: dokumenty w danym języku.
export const getPricing = cache(async (locale: Locale): Promise<PricingData> => {
  const raw = await sanityFetch<{
    settings: (NonNullable<PricingData['settings']> & { rateLabels: { rateId: string | null; label: string | null }[] | null }) | null
    rates: (Omit<PricingRate, 'label'> & { name: string | null })[]
    examples: PricingData['examples']
  }>(
    groq`{
      "settings": *[_id == "pricingSettings-" + $locale][0]{
        showRates, currency, roundingPLN, roundingEUR, note, validFrom,
        "rateLabels": rateLabels[]{ "rateId": rate._ref, label }
      },
      "rates": *[_type == "hourlyRate"] | order(order asc){ "id": _id, "key": key.current, name, amountPLN, amountEUR },
      "examples": *[_type == "pricingExample" && locale == $locale] | order(order asc){
        "id": _id,
        title,
        summary,
        items[]{ _key, task, hoursMin, hoursMax, "rateId": rate._ref }
      }
    }`,
    { locale }
  )
  const labels = new Map((raw.settings?.rateLabels ?? []).flatMap((l) => (l.rateId && l.label ? [[l.rateId, l.label] as const] : [])))
  const s = raw.settings
  return {
    settings: s
      ? { showRates: s.showRates, currency: s.currency, roundingPLN: s.roundingPLN, roundingEUR: s.roundingEUR, note: s.note, validFrom: s.validFrom }
      : null,
    rates: raw.rates.map(({ name, ...rate }) => ({ ...rate, label: labels.get(rate.id) ?? name })),
    examples: raw.examples,
  }
})

export interface FaqEntry {
  id: string
  question: string
  answer: string
}

export const getHomeFaq = cache(async (locale: Locale): Promise<FaqEntry[]> =>
  sanityFetch<FaqEntry[]>(
    groq`*[_type == "faqEntry" && locale == $locale && showOnHome != false && defined(question) && defined(answer)] | order(order asc){ "id": _id, question, answer }`,
    { locale }
  )
)

// O mnie: portret z sekcji „tekst + obraz” strony „O mnie” (edytowalny w Studio) i adres wpisu o budowie strony
export interface AboutData {
  portrait: { url: string; width: number; height: number; lqip: string | null; alt: string | null } | null
  post: { slug: string; category: string } | null
}

export const getAboutData = cache(async (locale: Locale, postSlug: string): Promise<AboutData> =>
  sanityFetch<AboutData>(
    groq`{
      "portrait": *[_type == "page" && locale == $locale && slug.current in ["o-mnie", "about"]][0]
        .sections[_type == "textImage" && defined(image.asset)][0].image{
          "url": asset->url,
          "width": asset->metadata.dimensions.width,
          "height": asset->metadata.dimensions.height,
          "lqip": asset->metadata.lqip,
          alt
        },
      "post": *[_type == "article" && locale == $locale && slug.current == $postSlug][0]{ "slug": slug.current, "category": ${ARTICLE_CATEGORY} }
    }`,
    { locale, postSlug }
  )
)
