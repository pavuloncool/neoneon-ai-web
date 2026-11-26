'use client'

// sanity.config.ts — Studio osadzone pod /studio (app/studio/[[...tool]]/page.tsx)

import { defineConfig, type DocumentActionComponent } from 'sanity'
import { structureTool, type StructureBuilder } from 'sanity/structure'
import { presentationTool, defineDocuments, defineLocations } from 'sanity/presentation'
import { visionTool } from '@sanity/vision'
import {
  documentInternationalization,
  useDeleteTranslationAction,
  useDuplicateWithTranslationsAction,
} from '@sanity/document-internationalization'
import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'
import { createCategoryPublishAction } from './sanity/actions/categoryPublish'
import { LOCALE_LABELS, LOCALES_DEFAULT_FIRST, toLocale } from './lib/locales'

// Akcje wtyczki typują `action` jako string, a Sanity 6 oczekuje klucza akcji — w działaniu zgodne
const TRANSLATION_ACTIONS = [useDeleteTranslationAction, useDuplicateWithTranslationsAction] as DocumentActionComponent[]

// Komentarze i wiadomości powstają tylko z formularzy na stronie.
// Artykuły i strony tworzymy z szablonu z językiem („Polski Artykuł”, „English Strona”…) — bazowe
// szablony bez języka i techniczne `*-parameterized` są ukryte. Ustawienia i teksty interfejsu
// to stałe dokumenty (po jednym na język), więc nie da się tworzyć nowych.
const HIDDEN_TEMPLATES = [
  'comment', 'contactMessage', 'siteSettings', 'uiStrings', 'homeCopy', 'legalDoc',
  'article', 'article-parameterized', 'page', 'page-parameterized', 'category', 'category-parameterized',
  'pricingSettings', 'pricingExample', 'pricingExample-parameterized', 'faqEntry', 'faqEntry-parameterized',
]

// Dokumenty pojedyncze: siteSettings-pl/en, uiStrings-pl/en, homeCopy-pl/en, pricingSettings-pl/en,
// legal-{privacy,cookies}-pl/en
const SINGLETON_TYPES = ['siteSettings', 'uiStrings', 'homeCopy', 'pricingSettings', 'legalDoc']
const SINGLETON_TITLES: Record<string, string> = {
  siteSettings: 'Ustawienia strony',
  uiStrings: 'Teksty interfejsu',
  homeCopy: 'Strona główna — teksty',
  pricingSettings: 'Ustawienia wycen',
}
// Polityki: id dokumentu `legal-${klucz}-${język}` (klucze jak LEGAL_PATHS w lib/legal.ts)
const LEGAL_DOCS = [
  { key: 'privacy', title: 'Polityka prywatności' },
  { key: 'cookies', title: 'Polityka cookies' },
]
// Typy, których wersje PL/EN łączy wtyczka document-internationalization
const TRANSLATED_TYPES = ['article', 'page', 'category', 'pricingExample', 'faqEntry']
// Języki z lib/locales.ts — domyślny (PL) pierwszy
const LOCALES = LOCALES_DEFAULT_FIRST.map((id) => ({ id, title: LOCALE_LABELS[id].short }))

// Całe copy strony poza artykułami i stronami z page buildera — na górze listy
function copyItems(S: StructureBuilder) {
  return [
    ...singletonItems(S, 'homeCopy'),
    ...singletonItems(S, 'uiStrings'),
    ...singletonItems(S, 'siteSettings'),
    S.listItem().title('Polityki').child(
      S.list().title('Polityki').items(
        LEGAL_DOCS.flatMap(({ key, title }) =>
          LOCALES.map(({ id, title: lang }) =>
            S.listItem()
              .title(`${title} ${lang}`)
              .id(`legal-${key}-${id}`)
              .child(S.document().schemaType('legalDoc').documentId(`legal-${key}-${id}`).title(`${title} ${lang}`))
          )
        )
      )
    ),
  ]
}

// Pozycje Structure dla dokumentu pojedynczego w każdym języku: `${type}-pl`, `${type}-en`
function singletonItems(S: StructureBuilder, type: string) {
  return LOCALES.map(({ id, title }) =>
    S.listItem()
      .title(`${SINGLETON_TITLES[type]} ${title}`)
      .id(`${type}-${id}`)
      .child(S.document().schemaType(type).documentId(`${type}-${id}`).title(`${SINGLETON_TITLES[type]} ${title}`))
  )
}

export default defineConfig({
  name: 'neoneon',
  title: 'neoneon',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  document: {
    newDocumentOptions: (prev) => prev.filter((item) => !HIDDEN_TEMPLATES.includes(item.templateId)),
    actions: (prev, { schemaType }) => {
      if (schemaType === 'contactMessage') return prev.filter(({ action }) => action === 'delete')
      // Komentarze i wiadomości zostają szkicami (niepubliczne) — bez „Publish”
      if (schemaType === 'comment') return prev.filter(({ action }) => action === 'delete')
      if (SINGLETON_TYPES.includes(schemaType)) return prev.filter(({ action }) => action !== 'duplicate' && action !== 'delete')
      // Kategoria: „Opublikuj” dopisuje stary slug do previousSlugs przy zmianie adresu (przekierowania 308)
      if (schemaType === 'category') {
        return [...prev.map((a) => (a.action === 'publish' ? createCategoryPublishAction(a) : a)), ...TRANSLATION_ACTIONS]
      }
      if (TRANSLATED_TYPES.includes(schemaType)) return [...prev, ...TRANSLATION_ACTIONS]
      return prev
    },
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Treści')
          .items([
            ...copyItems(S),
            S.divider(),
            ...LOCALES.map(({ id, title }) =>
              S.listItem().title(`Artykuły ${title}`).child(
                S.documentList().title(`Artykuły ${title}`).filter('_type == "article" && locale == $locale').params({ locale: id }).defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
              )
            ),
            S.divider(),
            S.documentTypeListItem('article').title('Wszystkie artykuły'),
            ...LOCALES.map(({ id, title }) =>
              S.listItem().title(`Kategorie ${title}`).child(
                S.documentList().title(`Kategorie ${title}`).filter('_type == "category" && locale == $locale').params({ locale: id }).defaultOrdering([{ field: 'order', direction: 'asc' }, { field: 'title', direction: 'asc' }])
              )
            ),
            S.documentTypeListItem('tag').title('Tagi'),
            S.divider(),
            S.listItem().title('Komentarze do moderacji').child(
              S.documentList()
                .title('Do moderacji — „Zatwierdzony” = pokaż, Delete = odrzuć')
                .filter('_type == "comment" && approved != true')
                .defaultOrdering([{ field: 'submittedAt', direction: 'asc' }])
            ),
            S.listItem().title('Komentarze zatwierdzone').child(
              S.documentList()
                .title('Komentarze zatwierdzone')
                .filter('_type == "comment" && approved == true')
                .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
            ),
            S.documentTypeListItem('contactMessage').title('Wiadomości kontaktowe'),
            S.divider(),
            ...LOCALES.map(({ id, title }) =>
              S.listItem().title(`Strony ${title}`).child(
                S.documentList().title(`Strony ${title}`).filter('_type == "page" && locale == $locale').params({ locale: id })
              )
            ),
            S.divider(),
            // Strona główna (one-pager): wyceny i FAQ
            S.documentTypeListItem('hourlyRate').title('Stawki godzinowe'),
            ...LOCALES.map(({ id, title }) =>
              S.listItem().title(`Przykładowe wyceny ${title}`).child(
                S.documentList().title(`Przykładowe wyceny ${title}`).filter('_type == "pricingExample" && locale == $locale').params({ locale: id }).defaultOrdering([{ field: 'order', direction: 'asc' }])
              )
            ),
            ...singletonItems(S, 'pricingSettings'),
            ...LOCALES.map(({ id, title }) =>
              S.listItem().title(`FAQ ${title}`).child(
                S.documentList().title(`FAQ ${title}`).filter('_type == "faqEntry" && locale == $locale').params({ locale: id }).defaultOrdering([{ field: 'order', direction: 'asc' }])
              )
            ),
          ]),
    }),
    // Podgląd strony z klikalną edycją. Strona działa pod tym samym adresem co Studio,
    // więc podgląd otwiera się na bieżącej domenie (neoneon.online, podgląd Vercel, localhost).
    presentationTool({
      title: 'Podgląd',
      previewUrl: {
        initial: '/pl',
        previewMode: { enable: '/api/draft-mode/enable', shareAccess: false },
      },
      resolve: {
        // Który dokument edytować, gdy w podglądzie otwarta jest dana strona
        mainDocuments: defineDocuments([
          { route: '/:locale', filter: '_type == "homeCopy" && locale == $locale' },
          { route: '/pl/polityka-prywatnosci', filter: '_id == "legal-privacy-pl"' },
          { route: '/en/privacy-policy', filter: '_id == "legal-privacy-en"' },
          { route: '/pl/polityka-cookies', filter: '_id == "legal-cookies-pl"' },
          { route: '/en/cookie-policy', filter: '_id == "legal-cookies-en"' },
          { route: '/:locale/blog', filter: '_type == "page" && isHome == true && locale == $locale' },
          {
            route: '/:locale/:category/:slug',
            filter: '_type == "article" && slug.current == $slug && locale == $locale',
          },
          // Pierwszy poziom: kategoria albo strona (walidacja nie pozwala na ten sam slug w jednym języku)
          { route: '/:locale/:slug', filter: '_type in ["category", "page"] && slug.current == $slug && locale == $locale' },
        ]),
        // Gdzie dany artykuł występuje na stronie (lista w edytorze artykułu)
        locations: {
          article: defineLocations({
            select: { title: 'title', slug: 'slug.current', locale: 'locale', categorySlug: 'categoryRef.slug.current' },
            resolve: (doc) => ({
              locations:
                doc?.slug && doc.locale && doc.categorySlug
                  ? [
                      { title: doc.title || 'Artykuł', href: `/${doc.locale}/${doc.categorySlug}/${doc.slug}` },
                      { title: `Blog (${LOCALE_LABELS[toLocale(doc.locale)].short})`, href: `/${doc.locale}/blog` },
                    ]
                  : [],
            }),
          }),
          page: defineLocations({
            select: { title: 'title', slug: 'slug.current', locale: 'locale', isHome: 'isHome' },
            resolve: (doc) => ({
              locations: doc?.locale
                ? [{ title: doc.title || 'Strona', href: doc.isHome ? `/${doc.locale}/blog` : `/${doc.locale}/${doc.slug ?? ''}` }]
                : [],
            }),
          }),
          category: defineLocations({
            select: { title: 'title', slug: 'slug.current', locale: 'locale' },
            resolve: (doc) => ({
              locations: doc?.locale && doc.slug ? [{ title: doc.title || 'Kategoria', href: `/${doc.locale}/${doc.slug}` }] : [],
            }),
          }),
          // Ustawienia i teksty interfejsu dotyczą całej strony
          siteSettings: defineLocations({ message: 'Widoczne na wszystkich stronach (nawigacja, stopka, SEO).', tone: 'positive' }),
          uiStrings: defineLocations({ message: 'Widoczne na wszystkich stronach: koło, pasek, stopka, formularze, wyszukiwarka, kategorie, 404.', tone: 'positive' }),
          homeCopy: defineLocations({
            select: { locale: 'locale' },
            resolve: (doc) => ({ locations: doc?.locale ? [{ title: 'Strona główna', href: `/${doc.locale}` }] : [] }),
          }),
        },
      },
    }),
    // Oryginał → tłumaczenie: przycisk „Translations” w artykule tworzy wersję w drugim języku,
    // połączoną z oryginałem dokumentem translation.metadata
    documentInternationalization({
      supportedLanguages: LOCALES_DEFAULT_FIRST.map((id) => ({ id, title: LOCALE_LABELS[id].name })),
      schemaTypes: TRANSLATED_TYPES,
      languageField: 'locale',
      apiVersion,
      metadataOmnisearchVisibility: false,
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
})
