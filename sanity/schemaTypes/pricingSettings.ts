// sanity/schemaTypes/pricingSettings.ts
// Ustawienia wycen — jeden dokument na język (pricingSettings-pl, pricingSettings-en), jak Ustawienia strony.
// Tu są teksty zależne od języka (nazwy stawek, nota) i to, czy sekcja jest widoczna w danym języku.

import { defineArrayMember, defineField, defineType } from 'sanity'
import { CogIcon } from '@sanity/icons/Cog'

export const pricingSettings = defineType({
  name: 'pricingSettings',
  title: 'Ustawienia wycen',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({ name: 'locale', title: 'Język', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'showRates', title: 'Pokazuj sekcję wycen', description: 'Wyłączone = sekcja i link „Wyceny” w nawigacji znikają w tym języku.', type: 'boolean', initialValue: true }),
    defineField({
      name: 'currency',
      title: 'Waluta kwot',
      description: 'EUR działa tylko dla stawek, które mają kwotę w EUR — pozostałe pokazują PLN.',
      type: 'string',
      options: { list: [{ title: 'PLN', value: 'PLN' }, { title: 'EUR', value: 'EUR' }], layout: 'radio', direction: 'horizontal' },
      initialValue: 'PLN',
      validation: (r) => r.required(),
    }),
    defineField({ name: 'roundingPLN', title: 'Zaokrąglenie kwot PLN', description: 'Min w dół, max w górę, do wielokrotności tej liczby.', type: 'number', initialValue: 100, validation: (r) => r.positive() }),
    defineField({ name: 'roundingEUR', title: 'Zaokrąglenie kwot EUR', type: 'number', initialValue: 50, validation: (r) => r.positive() }),
    defineField({
      name: 'rateLabels',
      title: 'Nazwy stawek na stronie',
      description: 'Np. „Teksty”, „Strona”, „Konsultacje”. Stawka bez nazwy = nazwa w Studio.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'rateLabel',
          fields: [
            defineField({ name: 'rate', title: 'Stawka', type: 'reference', to: [{ type: 'hourlyRate' }], options: { disableNew: true }, validation: (r) => r.required() }),
            defineField({ name: 'label', title: 'Nazwa', type: 'string', validation: (r) => r.required() }),
          ],
          preview: { select: { title: 'label', subtitle: 'rate.name' } },
        }),
      ],
    }),
    defineField({ name: 'note', title: 'Nota pod wycenami', description: 'Puste = tekst domyślny z briefu.', type: 'text', rows: 3 }),
    defineField({ name: 'validFrom', title: 'Stawki obowiązują od', type: 'date' }),
  ],
  preview: {
    select: { locale: 'locale' },
    prepare: ({ locale }) => ({ title: `Ustawienia wycen (${String(locale ?? '').toUpperCase()})` }),
  },
})
