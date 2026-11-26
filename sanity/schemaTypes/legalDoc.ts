// sanity/schemaTypes/legalDoc.ts
// Polityki (prywatności, cookies) — jeden dokument na politykę i język:
// legal-privacy-pl, legal-privacy-en, legal-cookies-pl, legal-cookies-en.
// Adresy stron są w kodzie (LEGAL_PATHS w lib/legal.ts); tu tylko treść.
// „Widoczność” zastępuje dawne warunki w kodzie: fragmenty o komentarzach pokazują się tylko,
// gdy komentarze są włączone (COMMENTS_ENABLED w lib/site.ts).

import { defineArrayMember, defineField, defineType, type Rule } from 'sanity'
import { LockIcon } from '@sanity/icons/Lock'

const VISIBILITY = defineField({
  name: 'visibility',
  title: 'Widoczność',
  type: 'string',
  options: {
    list: [
      { title: 'Zawsze', value: 'always' },
      { title: 'Tylko gdy komentarze są włączone', value: 'commentsOn' },
      { title: 'Tylko gdy komentarze są wyłączone', value: 'commentsOff' },
    ],
    layout: 'radio',
    direction: 'horizontal',
  },
  initialValue: 'always',
})

const EMAIL_HINT = '{email} zostanie zastąpione publicznym adresem e-mail strony.'
const required = (r: Rule) => r.required()

export const legalDoc = defineType({
  name: 'legalDoc',
  title: 'Polityka',
  type: 'document',
  icon: LockIcon,
  fields: [
    defineField({ name: 'locale', title: 'Język', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'key', title: 'Polityka', type: 'string', readOnly: true, hidden: true }),
    defineField({ name: 'title', title: 'Tytuł (H1 i title w Google)', type: 'string', validation: required }),
    defineField({ name: 'description', title: 'Opis w Google (meta description)', type: 'text', rows: 2, validation: (r) => [r.required(), r.max(160).warning('Google zwykle ucina opisy dłuższe niż ok. 160 znaków.')] }),
    defineField({ name: 'updated', title: 'Data aktualizacji (pełny tekst)', description: 'Np. „Ostatnia aktualizacja: 24 listopada 2026 r.”', type: 'string', validation: required }),
    defineField({
      name: 'sections',
      title: 'Sekcje',
      type: 'array',
      validation: (r) => r.required().min(1),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'legalSection',
          title: 'Sekcja',
          fields: [
            defineField({ name: 'title', title: 'Nagłówek (z numerem)', type: 'string', validation: required }),
            defineField({
              name: 'blocks',
              title: 'Treść',
              type: 'array',
              validation: (r) => r.required().min(1),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'legalParagraph',
                  title: 'Akapit',
                  fields: [defineField({ name: 'text', title: 'Tekst', description: EMAIL_HINT, type: 'text', rows: 4, validation: required }), VISIBILITY],
                  preview: { select: { title: 'text', v: 'visibility' }, prepare: ({ title, v }) => ({ title, subtitle: v && v !== 'always' ? `Akapit · ${v === 'commentsOn' ? 'gdy komentarze włączone' : 'gdy komentarze wyłączone'}` : 'Akapit' }) },
                }),
                defineArrayMember({
                  type: 'object',
                  name: 'legalList',
                  title: 'Lista',
                  fields: [
                    defineField({
                      name: 'items',
                      title: 'Punkty',
                      type: 'array',
                      validation: (r) => r.required().min(1),
                      of: [
                        defineArrayMember({
                          type: 'object',
                          name: 'legalListItem',
                          title: 'Punkt',
                          fields: [defineField({ name: 'text', title: 'Tekst', description: EMAIL_HINT, type: 'text', rows: 3, validation: required }), VISIBILITY],
                          preview: { select: { title: 'text', v: 'visibility' }, prepare: ({ title, v }) => ({ title, subtitle: v && v !== 'always' ? (v === 'commentsOn' ? 'gdy komentarze włączone' : 'gdy komentarze wyłączone') : undefined }) },
                        }),
                      ],
                    }),
                    VISIBILITY,
                  ],
                  preview: { select: { first: 'items.0.text' }, prepare: ({ first }) => ({ title: first, subtitle: 'Lista' }) },
                }),
                defineArrayMember({
                  type: 'object',
                  name: 'legalTable',
                  title: 'Tabela',
                  fields: [
                    defineField({ name: 'head', title: 'Nagłówki kolumn', type: 'array', of: [{ type: 'string' }], validation: (r) => r.required().min(1) }),
                    defineField({
                      name: 'rows',
                      title: 'Wiersze',
                      type: 'array',
                      validation: (r) => r.required().min(1),
                      of: [
                        defineArrayMember({
                          type: 'object',
                          name: 'legalTableRow',
                          title: 'Wiersz',
                          fields: [defineField({ name: 'cells', title: 'Komórki', description: 'W kolejności nagłówków.', type: 'array', of: [{ type: 'string' }], validation: (r) => r.required().min(1) })],
                          preview: { select: { a: 'cells.0', b: 'cells.1' }, prepare: ({ a, b }) => ({ title: a, subtitle: b }) },
                        }),
                      ],
                    }),
                    VISIBILITY,
                  ],
                  preview: { select: { first: 'rows.0.cells.0' }, prepare: ({ first }) => ({ title: first, subtitle: 'Tabela' }) },
                }),
              ],
            }),
            VISIBILITY,
          ],
          preview: { select: { title: 'title' } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', locale: 'locale' },
    prepare: ({ title, locale }) => ({ title, subtitle: String(locale ?? '').toUpperCase() }),
  },
})
