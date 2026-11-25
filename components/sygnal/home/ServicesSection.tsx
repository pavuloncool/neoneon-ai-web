// components/sygnal/home/ServicesSection.tsx
// Strona główna „Sygnał”: usługi jako rozwijane wiersze (S07) — numer, nazwa, tagi, znak +/−.
// Druga usługa (strona) otwarta na starcie. CTA prowadzi do formularza z zaznaczoną usługą.

import { Link } from '@/i18n/navigation'
import type { ServiceItem } from './types'
import s from '../sygnal.module.css'

export function ServicesSection({ id, label, title, items }: { id: string; label: string; title: string; items: ServiceItem[] }) {
  return (
    <section id={id} className={`${s.wrap} ${s.section}`} aria-labelledby={`${id}-h`}>
      <p className={`${s.mono} ${s.label}`}>{label}</p>
      <h2 id={`${id}-h`} className={s.h2}>
        {title}
      </h2>
      <div className={s.services}>
        {items.map((item, i) => (
          <details key={item.key} className={s.service} open={item.key === 'website'}>
            <summary>
              <span className={`${s.mono} ${s.svcNo}`}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <span className={`${s.mono} ${s.tagsLine} tags`}>{item.tags.join(' · ')}</span>
              <span className={s.plus} aria-hidden="true" />
            </summary>
            <div className={s.serviceBody}>
              <span />
              <div>
                <p className={s.body} style={{ margin: 0 }}>
                  {item.text}
                </p>
                <Link href={item.href} className={`${s.btn} ${s.btnLime} ${s.serviceCta}`}>
                  {item.cta} <span aria-hidden="true">→</span>
                </Link>
              </div>
              <ul className={s.bul}>
                {item.points.map((p) => (
                  <li key={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</li>
                ))}
              </ul>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
