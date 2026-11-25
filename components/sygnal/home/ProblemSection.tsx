// components/sygnal/home/ProblemSection.tsx
// Strona główna „Sygnał”: pusta strona. Redakcja na żywo bez animacji: zdanie ogólnikowe skreślone
// limonką, notatka na marginesie (mono), pod spodem konkretne wersje. Dwie luki (jakość, widoczność)
// i zdanie domykające z CTA.

import { Link } from '@/i18n/navigation'
import type { ProblemTexts } from './types'
import s from '../sygnal.module.css'

export function ProblemSection({ id, label, texts, contactHref }: { id: string; label: string; texts: ProblemTexts; contactHref: string }) {
  return (
    <section id={id} className={`${s.wrap} ${s.section}`} aria-labelledby={`${id}-h`}>
      <p className={`${s.mono} ${s.label}`}>{label}</p>
      <h2 id={`${id}-h`} className={s.h2}>
        {texts.title}
      </h2>
      <p className={`${s.body} ${s.sub}`}>{texts.lead}</p>

      <div className={s.edit}>
        <p className={s.editBefore}>
          <del>{texts.before}</del>
          <span className={`${s.mono} ${s.editNote}`}>→ {texts.note}</span>
        </p>
        <ol className={s.editAfter}>
          {texts.after.map((line, i) => (
            <li key={line}>
              <span className={s.mono}>{String(i + 1).padStart(2, '0')}</span>
              <ins>{line}</ins>
            </li>
          ))}
        </ol>
        <p className={`${s.mono} ${s.editCaption}`}>{texts.caption}</p>
      </div>

      <div className={s.gaps}>
        {texts.gaps.map((gap, i) => (
          <div key={gap.title} className={s.gap}>
            <p className={`${s.mono} ${s.gapNo}`}>{String(i + 1).padStart(2, '0')} ——</p>
            <h3>{gap.title}</h3>
            <p>{gap.text}</p>
          </div>
        ))}
      </div>

      <p className={s.closing}>{texts.closing}</p>
      <Link href={contactHref} className={`${s.btn} ${s.btnLime}`} style={{ marginTop: 28 }}>
        {texts.cta} <span aria-hidden="true">→</span>
      </Link>
    </section>
  )
}
