// components/sygnal/home/TalkSection.tsx
// Strona główna „Sygnał”: rozmowa — ostatnia sekcja. Duży nagłówek, krótki tekst, CTA do formularza
// i adres e-mail. Poświata w tle jak w hero.

import { Link } from '@/i18n/navigation'
import s from '../sygnal.module.css'

export function TalkSection({
  id,
  label,
  title,
  text,
  button,
  href,
  email,
}: {
  id: string
  label: string
  title: string
  text: string
  button: string
  href: string
  email: string
}) {
  return (
    <section id={id} className={`${s.wrap} ${s.section} ${s.talkSection}`} aria-labelledby={`${id}-h`}>
      <div className={s.glow} aria-hidden="true" />
      <p className={`${s.mono} ${s.label}`}>{label}</p>
      <h2 id={`${id}-h`} className={s.talkTitle}>
        {title}
      </h2>
      <div className={s.talkFoot}>
        <p className={s.body} style={{ margin: 0 }}>
          {text}
        </p>
        <div className={s.ctas}>
          <Link href={href} className={`${s.btn} ${s.btnLime}`}>
            {button} <span aria-hidden="true">→</span>
          </Link>
          <a href={`mailto:${email}`} className={`${s.btn} ${s.btnGhost}`}>
            {email}
          </a>
        </div>
      </div>
    </section>
  )
}
