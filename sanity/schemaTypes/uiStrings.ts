// sanity/schemaTypes/uiStrings.ts
// Teksty interfejsu — jeden dokument na język (uiStrings-pl, uiStrings-en).
// Pola generowane z sanity/copyFields.ts (UI_GROUPS): jedna zakładka i jedno pole-obiekt na grupę.

import { defineField, defineType } from 'sanity'
import { UI_GROUPS } from '../copyFields'
import { copyFieldToSchema } from '../copySchema'

export const uiStrings = defineType({
  name: 'uiStrings',
  title: 'Teksty interfejsu',
  type: 'document',
  groups: UI_GROUPS.map((g, i) => ({ name: g.name, title: g.title, default: i === 0 })),
  fields: [
    defineField({ name: 'locale', title: 'Język', type: 'string', readOnly: true, hidden: true }),
    ...UI_GROUPS.map((g) =>
      defineField({
        name: g.name,
        title: g.title,
        description: g.description,
        type: 'object',
        group: g.name,
        options: { collapsible: false },
        fields: g.fields.map((f) => copyFieldToSchema(f)),
      })
    ),
  ],
  preview: {
    select: { locale: 'locale' },
    prepare: ({ locale }) => ({ title: `Teksty interfejsu (${String(locale ?? '').toUpperCase()})` }),
  },
})
