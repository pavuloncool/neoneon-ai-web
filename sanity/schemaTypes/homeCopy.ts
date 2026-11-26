// sanity/schemaTypes/homeCopy.ts
// Strona główna — teksty: jeden dokument na język (homeCopy-pl, homeCopy-en).
// Zakładki = sekcje strony głównej (lib/onePager.ts); pola generowane z sanity/copyFields.ts (HOME_GROUPS).
// Na stronie dokument trafia do next-intl jako namespace `onePager`.

import { defineField, defineType } from 'sanity'
import { HomeIcon } from '@sanity/icons/Home'
import { HOME_GROUPS } from '../copyFields'
import { copyFieldToSchema } from '../copySchema'

export const homeCopy = defineType({
  name: 'homeCopy',
  title: 'Strona główna — teksty',
  type: 'document',
  icon: HomeIcon,
  groups: HOME_GROUPS.map((g, i) => ({ name: g.name, title: g.title, default: i === 2 })),
  fields: [
    defineField({ name: 'locale', title: 'Język', type: 'string', readOnly: true, hidden: true }),
    ...HOME_GROUPS.flatMap((g) => g.fields.map((f) => copyFieldToSchema(f, g.name))),
  ],
  preview: {
    select: { locale: 'locale' },
    prepare: ({ locale }) => ({ title: `Strona główna — teksty (${String(locale ?? '').toUpperCase()})` }),
  },
})
