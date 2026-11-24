// sanity/schemaTypes/faqEntry.ts
// Pytanie FAQ na stronie głównej (sekcja FAQ + JSON-LD FAQPage z tych samych danych).
// Wersje PL/EN łączy wtyczka document-internationalization — jak artykuły.
// Nazwa `faqEntry`, bo `faqItem` to już obiekt w polu FAQ artykułu (faqField.ts).

import { defineField, defineType } from 'sanity'
import { HelpCircleIcon } from '@sanity/icons/HelpCircle'

export const faqEntry = defineType({
  name: 'faqEntry',
  title: 'Pytanie FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  fields: [
    defineField({ name: 'locale', title: 'Język', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'question', title: 'Pytanie', type: 'string', validation: (r) => r.required() }),
    defineField({
      name: 'answer',
      title: 'Odpowiedź',
      description: 'Pierwsze zdanie odpowiada wprost na pytanie — tak cytują asystenci AI.',
      type: 'text',
      rows: 5,
      validation: (r) => r.required(),
    }),
    defineField({ name: 'order', title: 'Kolejność', type: 'number' }),
    defineField({ name: 'showOnHome', title: 'Pokazuj na stronie głównej', type: 'boolean', initialValue: true }),
  ],
  orderings: [{ title: 'Kolejność', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: {
    select: { title: 'question', locale: 'locale', show: 'showOnHome' },
    prepare: ({ title, locale, show }) => ({ title, subtitle: `${String(locale ?? '').toUpperCase()}${show === false ? ' · ukryte' : ''}` }),
  },
})
