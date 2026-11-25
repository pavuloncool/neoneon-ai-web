// components/sygnal/home/FaqSection.tsx
// Strona główna „Sygnał”: FAQ jako rozwijane wiersze (znak + / − w kółku). Dane JSON-LD (FAQPage)
// buduje strona z tych samych pozycji (FaqJsonLd).

import type { FaqItemView } from './types'
import s from '../sygnal.module.css'

export function FaqSection({ id, label, title, items }: { id: string; label: string; title: string; items: FaqItemView[] }) {
  if (items.length === 0) return null
  return (
    <section id={id} className={`${s.wrap} ${s.section}`} aria-labelledby={`${id}-h`}>
      <p className={`${s.mono} ${s.label}`}>{label}</p>
      <h2 id={`${id}-h`} className={s.h2}>
        {title}
      </h2>
      <div className={s.services}>
        {items.map((item, i) => (
          <details key={item.id} className={`${s.service} ${s.faqRow}`}>
            <summary>
              <span className={`${s.mono} ${s.svcNo}`}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{item.question}</h3>
              <span />
              <span className={s.plus} aria-hidden="true" />
            </summary>
            <div className={s.serviceBody}>
              <span />
              <p className={s.body} style={{ margin: 0, whiteSpace: 'pre-line', maxWidth: '42em' }}>
                {item.answer}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
