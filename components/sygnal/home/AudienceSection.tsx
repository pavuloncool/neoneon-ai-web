// components/sygnal/home/AudienceSection.tsx
// Strona główna „Sygnał”: dla kogo. Zdanie „Prowadzisz … i potrzebujesz strony…” z branżami
// jako pigułkami (wszystkie widoczne naraz — bez rotacji słowa), pod spodem dłuższy opis.

import type { AudienceTexts } from './types'
import s from '../sygnal.module.css'

export function AudienceSection({ id, label, texts }: { id: string; label: string; texts: AudienceTexts }) {
  return (
    <section id={id} className={`${s.wrap} ${s.section}`} aria-labelledby={`${id}-h`}>
      <p className={`${s.mono} ${s.label}`}>{label}</p>
      <h2 id={`${id}-h`} className={s.h2}>
        {texts.title}
      </h2>
      <p className={s.audience}>
        {texts.lead}{' '}
        {texts.industries.map((industry) => (
          <span key={industry}>
            <span className={s.pill}>{industry}</span>
            {' '}
          </span>
        ))}
        {texts.rest}
      </p>
      <p className={`${s.body} ${s.sub}`}>{texts.text}</p>
    </section>
  )
}
