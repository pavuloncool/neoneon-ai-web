// components/sygnal/home/AboutSection.tsx
// Strona główna „Sygnał”: O mnie — portret w ramce z poświatą, tytuł, akapity (fragment skreślony
// limonką), fakty jako linia mono, link do wpisu o budowie strony.

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { AboutData } from '@/lib/queries'
import type { AboutTexts } from './types'
import s from '../sygnal.module.css'

function WithStrike({ text, fragment }: { text: string; fragment: string }) {
  const at = fragment ? text.indexOf(fragment) : -1
  if (at === -1) return <>{text}</>
  return (
    <>
      {text.slice(0, at)}
      <del className={s.strike}>{fragment}</del>
      {text.slice(at + fragment.length)}
    </>
  )
}

export function AboutSection({
  id,
  label,
  texts,
  portrait,
  postHref,
}: {
  id: string
  label: string
  texts: AboutTexts
  portrait: AboutData['portrait']
  postHref: string | null
}) {
  const [first, ...rest] = texts.paragraphs
  return (
    <section id={id} className={`${s.wrap} ${s.section}`} aria-labelledby={`${id}-h`}>
      <p className={`${s.mono} ${s.label}`}>{label}</p>
      <div className={s.about}>
        {portrait ? (
          <div className={s.portrait}>
            <Image
              src={portrait.url}
              alt={portrait.alt ?? texts.portraitAlt}
              width={portrait.width}
              height={portrait.height}
              sizes="(max-width: 1023px) 80vw, 420px"
              placeholder={portrait.lqip ? 'blur' : 'empty'}
              blurDataURL={portrait.lqip ?? undefined}
            />
          </div>
        ) : null}
        <div>
          <p className={`${s.mono} ${s.eyebrow}`}>{texts.eyebrow}</p>
          <h2 id={`${id}-h`} className={s.h2} style={{ marginTop: 14 }}>
            {texts.title}
          </h2>
          {first ? <p className={s.aboutLead}>{first}</p> : null}
          {rest.map((p) => (
            <p key={p} className={`${s.body} ${s.sub}`}>
              <WithStrike text={p} fragment={texts.strike} />
            </p>
          ))}
          <ul className={`${s.mono} ${s.facts2}`}>
            {texts.facts.split(' · ').map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          {postHref ? (
            <Link href={postHref} className={`${s.btn} ${s.btnGhost}`} style={{ marginTop: 28 }}>
              {texts.link} <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  )
}
