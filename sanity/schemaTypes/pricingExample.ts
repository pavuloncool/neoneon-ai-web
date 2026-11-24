// sanity/schemaTypes/pricingExample.ts
// Przykładowa wycena (sekcja „Ile to kosztuje? Przykłady”). Wersje PL/EN łączy wtyczka
// document-internationalization — jak artykuły: wersję EN tworzysz przyciskiem „Translations”.
// Kwoty liczy strona: godziny × stawka z dokumentu „Stawka godzinowa”.

import { defineArrayMember, defineField, defineType } from 'sanity'
import { BillIcon } from '@sanity/icons/Bill'

export const pricingExample = defineType({
  name: 'pricingExample',
  title: 'Przykładowa wycena',
  type: 'document',
  icon: BillIcon,
  fields: [
    defineField({ name: 'locale', title: 'Język', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'title', title: 'Tytuł', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'summary', title: 'Krótki opis', type: 'text', rows: 3 }),
    defineField({ name: 'order', title: 'Kolejność', type: 'number' }),
    defineField({
      name: 'items',
      title: 'Zadania',
      type: 'array',
      validation: (r) => r.min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'pricingItem',
          title: 'Zadanie',
          fields: [
            defineField({ name: 'task', title: 'Zadanie', type: 'string', validation: (r) => r.required() }),
            defineField({ name: 'hoursMin', title: 'Godziny min', type: 'number', validation: (r) => r.required().min(0.5) }),
            defineField({
              name: 'hoursMax',
              title: 'Godziny max',
              type: 'number',
              validation: (r) =>
                r.required().custom((max, ctx) => {
                  const min = (ctx.parent as { hoursMin?: number } | undefined)?.hoursMin
                  return min !== undefined && typeof max === 'number' && max < min ? 'Max nie może być mniejsze niż min' : true
                }),
            }),
            defineField({ name: 'rate', title: 'Stawka', type: 'reference', to: [{ type: 'hourlyRate' }], options: { disableNew: true }, validation: (r) => r.required() }),
          ],
          preview: {
            select: { title: 'task', min: 'hoursMin', max: 'hoursMax', rate: 'rate.name' },
            prepare: ({ title, min, max, rate }) => ({ title, subtitle: `${min ?? '?'}–${max ?? '?'} h${rate ? ` · ${rate}` : ''}` }),
          },
        }),
      ],
    }),
  ],
  orderings: [{ title: 'Kolejność', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'title', locale: 'locale', items: 'items' },
    prepare: ({ title, locale, items }) => ({
      title,
      subtitle: `${String(locale ?? '').toUpperCase()} · zadań: ${Array.isArray(items) ? items.length : 0}`,
    }),
  },
})
