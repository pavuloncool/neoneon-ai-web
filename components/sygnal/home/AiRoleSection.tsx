// components/sygnal/home/AiRoleSection.tsx
// Strona główna „Sygnał”: rola AI — cztery etapy budowy; trzy po stronie ludzi (limonka),
// kod z AI (chłodny mono, linia przerywana).

import type { AiRoleCard } from '@/components/home/AiRole'
import s from '../sygnal.module.css'

// Druga część tytułu (po pierwszym zdaniu) limonką: „AI to narzędzie do kodowania. / Nie do decyzji.”
function splitTitle(title: string): [string, string | null] {
  const i = title.indexOf('. ')
  return i === -1 ? [title, null] : [title.slice(0, i + 1), title.slice(i + 2)]
}

export function AiRoleSection({
  id,
  label,
  texts,
  whoLabel,
}: {
  id: string
  label: string
  texts: { title: string; lead: string; cards: AiRoleCard[] }
  whoLabel: string
}) {
  const [first, rest] = splitTitle(texts.title)
  return (
    <section id={id} className={`${s.wrap} ${s.section}`} aria-labelledby={`${id}-h`}>
      <p className={`${s.mono} ${s.label}`}>{label}</p>
      <h2 id={`${id}-h`} className={s.h2}>
        {first} {rest && <span style={{ color: 'var(--lime)' }}>{rest}</span>}
      </h2>
      <p className={`${s.body} ${s.sub}`}>{texts.lead}</p>
      <div className={s.roles}>
        {texts.cards.map((card) => {
          const ai = /\bAI\b/.test(card.who)
          return (
            <div key={card.title} className={`${s.role} ${ai ? s.roleAi : ''}`}>
              <h3>{ai ? `{ ${card.title.toLowerCase()} }` : card.title}</h3>
              <p>{card.text}</p>
              <p className={`${s.mono} ${s.roleWho}`}>
                {whoLabel}: {card.who}
              </p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
