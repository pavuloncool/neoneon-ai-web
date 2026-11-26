// scripts/gen-copy-types.ts
// Generuje types/messages.d.ts z sanity/copyFields.ts: next-intl zna wtedy wszystkie klucze copy,
// więc t('…') z kluczem, którego nie ma w Studio, nie przejdzie typecheck.
//
//   node --experimental-strip-types scripts/gen-copy-types.ts           # zapis
//   node --experimental-strip-types scripts/gen-copy-types.ts --check   # tylko sprawdzenie (lint)

import fs from 'node:fs'
import path from 'node:path'
import { HOME_FIELDS, UI_GROUPS, type CopyField } from '../sanity/copyFields.ts'

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const out = path.join(root, 'types/messages.d.ts')

const pad = (n: number) => '  '.repeat(n)
function fieldType(f: CopyField, depth: number): string {
  if (f.type === 'object') return objectType(f.fields, depth)
  if (f.type === 'strings') return 'string[]'
  if (f.type === 'list') return `Array<${objectType(f.of, depth)}>`
  return 'string'
}
function objectType(fields: CopyField[], depth: number): string {
  const lines = fields.map((f) => `${pad(depth + 1)}${f.key}${f.optional ? '?' : ''}: ${fieldType(f, depth + 1)}`)
  return `{\n${lines.join('\n')}\n${pad(depth)}}`
}

const body = [
  ...UI_GROUPS.map((g) => `${pad(1)}${g.name}: ${objectType(g.fields, 1)}`),
  `${pad(1)}onePager: ${objectType(HOME_FIELDS, 1)}`,
].join('\n')

const content = `// Wygenerowane przez scripts/gen-copy-types.ts z sanity/copyFields.ts — nie edytuj ręcznie.
// Kształt copy strony z Sanity („Teksty interfejsu” + „Strona główna — teksty”).

export interface SiteMessages {
${body}
}

declare module 'next-intl' {
  interface AppConfig {
    Messages: SiteMessages
  }
}
`

if (process.argv.includes('--check')) {
  const current = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : ''
  if (current !== content) {
    console.error('types/messages.d.ts jest nieaktualny — uruchom: node --experimental-strip-types scripts/gen-copy-types.ts')
    process.exit(1)
  }
} else {
  fs.writeFileSync(out, content)
  console.log('Zapisano types/messages.d.ts')
}
