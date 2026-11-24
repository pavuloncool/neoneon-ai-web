// sanity/schemaTypes/hourlyRate.ts
// Stawka godzinowa — jeden dokument na stawkę, wspólny dla PL i EN (kwoty nie zależą od języka).
// Nazwę stawki widoczną na stronie wpisujesz w „Ustawieniach wycen” danego języka (rateLabels),
// tak jak inne teksty: osobno w dokumencie PL i EN.

import { defineField, defineType } from 'sanity'
import { ClockIcon } from '@sanity/icons/Clock'

export const hourlyRate = defineType({
  name: 'hourlyRate',
  title: 'Stawka godzinowa',
  type: 'document',
  icon: ClockIcon,
  fields: [
    defineField({ name: 'name', title: 'Nazwa w Studio', description: 'Np. „Teksty”. Widoczna tylko w Studio — na stronie nazwa pochodzi z Ustawień wycen PL/EN.', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'key', title: 'Klucz', description: 'Np. teksty, strona, konsultacje.', type: 'slug', options: { source: 'name', maxLength: 32 }, validation: (r) => r.required() }),
    defineField({ name: 'amountPLN', title: 'Stawka netto PLN / h', description: 'Puste = karty wycen pokazują tylko godziny.', type: 'number', validation: (r) => r.positive() }),
    defineField({ name: 'amountEUR', title: 'Stawka netto EUR / h (opcjonalnie, dla wersji EN)', type: 'number', validation: (r) => r.positive() }),
    defineField({ name: 'order', title: 'Kolejność', type: 'number' }),
  ],
  orderings: [{ title: 'Kolejność', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'name', pln: 'amountPLN', eur: 'amountEUR' },
    prepare: ({ title, pln, eur }) => ({
      title,
      subtitle: pln ? `${pln} zł/h netto${eur ? ` · ${eur} EUR/h` : ''}` : 'brak stawki',
    }),
  },
})
