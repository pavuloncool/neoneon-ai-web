// sanity/schemaTypes/link.ts
// Wspólny link: do strony z page buildera, do kategorii, do wyszukiwarki, do sekcji strony głównej albo na zewnątrz.
// Adres wylicza lib/links.ts (resolveHref).

import { defineField, defineType } from 'sanity'
import { DEFAULT_LOCALE } from '../../lib/locales'
import { categoryRefField } from './category'

export const link = defineType({
  name: 'link',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'linkType',
      title: 'Prowadzi do',
      type: 'string',
      options: {
        list: [
          { title: 'Strona', value: 'page' },
          { title: 'Kategoria', value: 'category' },
          { title: 'Wyszukiwarka', value: 'search' },
          { title: 'Sekcja strony głównej', value: 'anchor' },
          { title: 'Adres zewnętrzny', value: 'external' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      initialValue: 'page',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'page',
      title: 'Strona',
      type: 'reference',
      to: [{ type: 'page' }],
      // Tylko strony w tym samym języku co edytowany dokument
      options: {
        filter: ({ document }) => ({ filter: 'locale == $locale', params: { locale: document?.locale ?? DEFAULT_LOCALE } }),
      },
      hidden: ({ parent }) => parent?.linkType !== 'page',
      validation: (r) => r.custom((value, ctx) => ((ctx.parent as { linkType?: string })?.linkType === 'page' && !value ? 'Wybierz stronę' : true)),
    }),
    defineField({
      ...categoryRefField(),
      hidden: ({ parent }) => parent?.linkType !== 'category',
      validation: (r) => r.custom((value, ctx) => ((ctx.parent as { linkType?: string })?.linkType === 'category' && !value ? 'Wybierz kategorię' : true)),
    }),
    defineField({
      name: 'anchor',
      title: 'Sekcja',
      description: 'Kotwica sekcji strony głównej, np. proces, uslugi, wyceny, o-mnie (EN: process, services, pricing, about).',
      type: 'string',
      hidden: ({ parent }) => parent?.linkType !== 'anchor',
      validation: (r) =>
        r.custom((value, ctx) => {
          if ((ctx.parent as { linkType?: string })?.linkType !== 'anchor') return true
          if (!value) return 'Podaj kotwicę sekcji'
          return /^[a-z0-9-]+$/.test(value) ? true : 'Tylko małe litery, cyfry i myślniki, bez #'
        }),
    }),
    defineField({
      name: 'url',
      title: 'Adres',
      type: 'url',
      hidden: ({ parent }) => parent?.linkType !== 'external',
      validation: (r) =>
        r.uri({ scheme: ['http', 'https', 'mailto'] }).custom((value, ctx) => ((ctx.parent as { linkType?: string })?.linkType === 'external' && !value ? 'Podaj adres' : true)),
    }),
  ],
})

export const navItem = defineType({
  name: 'navItem',
  title: 'Pozycja menu',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Etykieta',
      description: 'Przy linku do kategorii można zostawić puste — wtedy etykietą jest nazwa kategorii (zmienia się razem z nią).',
      type: 'string',
      validation: (r) =>
        r.custom((value, ctx) => {
          const linkType = (ctx.parent as { link?: { linkType?: string } })?.link?.linkType
          return value || linkType === 'category' ? true : 'Podaj etykietę'
        }),
    }),
    defineField({ name: 'link', title: 'Link', type: 'link', validation: (r) => r.required() }),
    defineField({ name: 'highlight', title: 'Wyróżnij jako przycisk', description: 'Np. „Kontakt” w nawigacji głównej (desktop).', type: 'boolean', initialValue: false }),
  ],
  preview: {
    select: { title: 'label', categoryTitle: 'link.categoryRef.title', subtitle: 'link.linkType', highlight: 'highlight' },
    prepare: ({ title, categoryTitle, subtitle, highlight }) => ({ title: title || categoryTitle, subtitle: `${subtitle ?? ''}${highlight ? ' · przycisk' : ''}` }),
  },
})
