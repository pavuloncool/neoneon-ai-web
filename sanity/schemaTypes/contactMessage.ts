// sanity/schemaTypes/contactMessage.ts
// Wiadomość z formularza kontaktowego. Zostaje szkicem (nigdy nie jest publikowana) —
// widoczna tylko w Studio. Kopia trafia też mailem przez Resend.

import { defineField, defineType } from 'sanity'

export const contactMessage = defineType({
  name: 'contactMessage',
  title: 'Wiadomość kontaktowa',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'name', title: 'Imię i nazwisko', type: 'string' }),
    defineField({ name: 'email', title: 'E-mail', type: 'string' }),
    defineField({ name: 'company', title: 'Firma lub adres strony', type: 'string' }),
    defineField({
      name: 'needs',
      title: 'Czego potrzebuje',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Tekst na stronę', value: 'copy' },
          { title: 'Strona od decyzji do wdrożenia', value: 'website' },
          { title: 'Treści i blog', value: 'content' },
          { title: 'Audyt widoczności w AI', value: 'audit' },
          { title: 'Jeszcze nie wiem', value: 'unsure' },
        ],
      },
    }),
    defineField({
      name: 'start',
      title: 'Kiedy chce zacząć',
      type: 'string',
      options: { list: [{ title: 'Jak najszybciej', value: 'asap' }, { title: 'W ciągu miesiąca', value: 'month' }, { title: 'Za 2–3 miesiące', value: 'quarter' }, { title: 'Nie wie', value: 'unsure' }] },
    }),
    defineField({
      name: 'budget',
      title: 'Budżet netto',
      type: 'string',
      options: { list: [{ title: 'do 3 000 zł', value: 'upTo3k' }, { title: '3 000–8 000 zł', value: 'from3to8k' }, { title: '8 000–15 000 zł', value: 'from8to15k' }, { title: 'powyżej 15 000 zł', value: 'over15k' }, { title: 'Nie wie', value: 'unsure' }] },
    }),
    defineField({ name: 'message', title: 'Wiadomość', type: 'text', rows: 8 }),
    defineField({ name: 'locale', title: 'Język strony', type: 'string' }),
    defineField({ name: 'submittedAt', title: 'Wysłano', type: 'datetime' }),
  ],
  orderings: [{ title: 'Najnowsze', name: 'submittedAtDesc', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: {
    select: { name: 'name', email: 'email', date: 'submittedAt' },
    prepare: ({ name, email, date }) => ({ title: name ?? email, subtitle: [email, date?.slice(0, 10)].filter(Boolean).join(' · ') }),
  },
})
