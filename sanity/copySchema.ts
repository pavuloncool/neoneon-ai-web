// sanity/copySchema.ts
// Zamienia definicje z copyFields.ts na pola schematu Sanity (z walidacją: copy nie ma zapasu w kodzie).

import { defineArrayMember, defineField, type FieldDefinition, type Rule } from 'sanity'
import type { CopyField } from './copyFields'

const REQUIRED = 'Wymagane — strona nie ma zapasowego tekstu w kodzie.'

export function copyFieldToSchema(f: CopyField, group?: string): FieldDefinition {
  const base = { name: f.key, title: f.title, description: f.description, readOnly: f.readOnly, ...(group ? { group } : {}) }
  const need = !f.optional

  switch (f.type) {
    case 'object':
      return defineField({
        ...base,
        type: 'object',
        options: { collapsible: true, collapsed: false },
        fields: f.fields.map((sub) => copyFieldToSchema(sub)),
      })
    case 'strings':
      return defineField({
        ...base,
        type: 'array',
        of: [defineArrayMember({ type: 'string', validation: (r: Rule) => r.required().error(REQUIRED) })],
        validation: (r: Rule) => {
          let rule = need ? r.required().min(1).error(REQUIRED) : r
          if (f.count) rule = rule.length(f.count).error(`Dokładnie ${f.count} pozycje.`)
          return rule
        },
      })
    case 'list':
      return defineField({
        ...base,
        type: 'array',
        of: [
          defineArrayMember({
            type: 'object',
            name: `${f.key}Item`,
            title: f.title,
            fields: f.of.map((sub) => copyFieldToSchema(sub)),
            preview: { select: { title: f.previewKey ?? f.of[0].key } },
          }),
        ],
        validation: (r: Rule) => {
          let rule = need ? r.required().min(1).error(REQUIRED) : r
          if (f.count) rule = rule.length(f.count).error(`Dokładnie ${f.count} pozycje — liczby nie da się zmienić bez zmian w kodzie.`)
          return rule
        },
      })
    default:
      return defineField({
        ...base,
        type: f.type === 'text' ? 'text' : 'string',
        ...(f.type === 'text' ? { rows: 3 } : {}),
        validation: (r: Rule) => (need ? r.required().error(REQUIRED) : r),
      })
  }
}
