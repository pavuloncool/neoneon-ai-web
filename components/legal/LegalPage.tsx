// components/legal/LegalPage.tsx
// Strona polityki (prywatności / cookies) z treści w lib/legal.ts.
// ⚠️ Treść robocza — wymaga weryfikacji prawnej przed publikacją produkcyjną (komentarz w lib/legal.ts).

import { TranslationStore } from '@/components/layout/TranslationStore'
import { LEGAL_PATHS, getLegalDoc, type LegalKey } from '@/lib/legal'
import { otherLocale, type Locale } from '@/lib/locales'

export function LegalPage({ docKey, locale }: { docKey: LegalKey; locale: Locale }) {
  const doc = getLegalDoc(docKey, locale)
  return (
    <article className="max-w-3xl mx-auto px-6 py-20 md:py-28">
      {/* Przełącznik języka: ta sama polityka w drugim języku */}
      <TranslationStore path={LEGAL_PATHS[docKey][otherLocale(locale)]} />
      <h1 className="font-display font-light text-5xl md:text-6xl leading-tight">{doc.title}</h1>
      <p className="mt-4 text-sm text-muted">{doc.updated}</p>

      <div className="mt-14 space-y-12">
        {doc.sections.map((section) => (
          <section key={section.title} aria-labelledby={`${docKey}-${section.title}`}>
            <h2 id={`${docKey}-${section.title}`} className="font-display text-3xl leading-snug">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4 text-[17px] leading-relaxed text-ink/85 dark:text-white/80">
              {section.blocks.map((block, i) => {
                if (block.type === 'p') return <p key={i}>{block.text}</p>
                if (block.type === 'list')
                  return (
                    <ul key={i} className="space-y-3">
                      {block.items.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-current opacity-50" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )
                return (
                  <div key={i} className="overflow-x-auto">
                    <table className="w-full min-w-[32rem] text-left text-[15px] border-collapse">
                      <thead>
                        <tr className="border-b border-border dark:border-white/15">
                          {block.head.map((h) => (
                            <th key={h} scope="col" className="py-3 pr-4 font-medium text-xs uppercase tracking-[0.12em] text-muted">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row) => (
                          <tr key={row[0]} className="border-b border-border/70 dark:border-white/10 align-top">
                            {row.map((cell, c) => (
                              <td key={c} className={`py-3 pr-4 ${c === 0 ? 'font-mono text-[13px]' : ''}`}>
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}
