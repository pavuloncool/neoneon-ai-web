// components/blog/FaqSection.tsx
// Widoczna sekcja FAQ na końcu artykułu — z tego samego pola `faq` co FaqJsonLd,
// więc treść dla czytelników i dane strukturalne są zawsze zgodne.
// Natywne <details>: działa bez JS, a odpowiedzi są w HTML (widoczne dla wyszukiwarek).
import type { FaqItem } from '@/types'
import a from '@/components/sygnal/article.module.css'

export function FaqSection({ faq, heading }: { faq?: FaqItem[] | null; heading: string }) {
  const items = (faq ?? []).filter((item) => item?.question?.trim() && item?.answer?.trim())
  if (items.length === 0) return null

  return (
    <section className={a.faq} aria-labelledby="faq">
      <h2 id="faq" className={a.faqTitle}>{heading}</h2>
      <div className={a.faqList}>
        {items.map((item, i) => (
          <details key={i} className={a.faqItem}>
            <summary>
              <h3>{item.question}</h3>
              <span aria-hidden className={a.faqSign} />
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}
