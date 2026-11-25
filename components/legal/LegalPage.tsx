// components/legal/LegalPage.tsx
// Strona polityki (prywatności / cookies) z treści w lib/legal.ts.
// ⚠️ Treść robocza — wymaga weryfikacji prawnej przed publikacją produkcyjną (komentarz w lib/legal.ts).

import { TranslationStore } from '@/components/layout/TranslationStore'
import { LEGAL_PATHS, getLegalDoc, type LegalKey } from '@/lib/legal'
import { otherLocale, type Locale } from '@/lib/locales'
import lists from '@/components/sygnal/lists.module.css'
import styles from '@/components/sygnal/legal.module.css'

export function LegalPage({ docKey, locale }: { docKey: LegalKey; locale: Locale }) {
  const doc = getLegalDoc(docKey, locale)
  return (
    <article className={styles.legal}>
      {/* Przełącznik języka: ta sama polityka w drugim języku */}
      <TranslationStore path={LEGAL_PATHS[docKey][otherLocale(locale)]} />
      <header className={styles.head}>
        <h1 className={`${lists.title} ${lists.titleSmall}`}>{doc.title}</h1>
        <p className={styles.updated}>{doc.updated}</p>
      </header>

      <div className={styles.sections}>
        {doc.sections.map((section) => (
          <section key={section.title} aria-labelledby={`${docKey}-${section.title}`} className={styles.section}>
            <h2 id={`${docKey}-${section.title}`} className={styles.sectionTitle}>
              {section.title}
            </h2>
            <div className={styles.body}>
              {section.blocks.map((block, i) => {
                if (block.type === 'p') return <p key={i}>{block.text}</p>
                if (block.type === 'list')
                  return (
                    <ul key={i} className={styles.list}>
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )
                return (
                  <div key={i} className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          {block.head.map((h) => (
                            <th key={h} scope="col">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {block.rows.map((row) => (
                          <tr key={row[0]}>
                            {row.map((cell, c) => (
                              <td key={c}>{cell}</td>
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
