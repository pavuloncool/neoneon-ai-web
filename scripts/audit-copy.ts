// scripts/audit-copy.ts
// Uzupełnienie reguły ESLint react/jsx-no-literals: szuka copy wpisanego w kod poza tekstem JSX —
// w atrybutach dostępności i SEO (aria-label, alt, title, placeholder…) oraz w tekstach zapasowych
// (`?? 'tekst'`, `|| 'tekst'`). Copy ma być w Sanity (sanity/copyFields.ts).
// Wyjątek w kodzie: komentarz `copy-audit-ignore` w tej samej linii.
//
//   node --experimental-strip-types scripts/audit-copy.ts

import fs from 'node:fs'
import path from 'node:path'

const root = path.join(path.dirname(new URL(import.meta.url).pathname), '..')
const DIRS = ['app', 'components']
const LETTERS = /[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż]{2,}/
const ATTR = /\b(aria-label|aria-description|alt|title|placeholder|label)=(["'])(.*?)\2/g
const FALLBACK = /(\?\?|\|\|)\s*(['"`])(.*?)\2/g

const files: string[] = []
const walk = (dir: string) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p)
    else if (/\.tsx?$/.test(e.name)) files.push(p)
  }
}
DIRS.forEach((d) => walk(path.join(root, d)))

const problems: string[] = []
for (const file of files) {
  const rel = path.relative(root, file)
  // Trasy API: e-maile do właściciela strony i odpowiedzi JSON — nie są copy strony
  if (rel.startsWith('app/api/')) continue
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const code = line.replace(/\/\/.*$/, '')
    if (line.includes('copy-audit-ignore') || /^\s*(\*|\/\*|\{\/\*)/.test(line)) return
    for (const re of [ATTR, FALLBACK]) {
      for (const m of code.matchAll(re)) {
        const value = m[3]
        if (!LETTERS.test(value) || /^(\/|#|https?:|mailto:|\.\/|[a-z]+\/[a-z])/.test(value) || /^[a-z]+(-[a-z]+)*$/.test(value) && re === FALLBACK) continue
        problems.push(`${rel}:${i + 1}  ${m[0]}`)
      }
    }
  })
}

if (problems.length) {
  console.error(`Copy wpisane w kod (przenieś do Sanity, sanity/copyFields.ts):\n${problems.join('\n')}`)
  process.exit(1)
}
console.log(`audit-copy: OK (${files.length} plików)`)
