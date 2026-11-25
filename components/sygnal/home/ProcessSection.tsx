// components/sygnal/home/ProcessSection.tsx
// Strona główna „Sygnał”: proces w pięciu etapach. Bez JS / telefon / reduce — zwykła lista;
// na desktopie HomeSignal przypina sekcję [data-process] i przeprowadza etapy z rozmycia w ostrość
// (duży numer [data-big-no], znaczniki [data-mark]). Etap z AI — chłodny mono.

import type { ProcessStep } from './types'
import s from '../sygnal.module.css'

export function ProcessSection({
  id,
  label,
  title,
  lead,
  steps,
  stageLabel,
}: {
  id: string
  label: string
  title: string
  lead: string
  steps: ProcessStep[]
  stageLabel: string
}) {
  const no = (i: number) => String(i + 1).padStart(2, '0')
  const isAi = (step: ProcessStep) => /\bAI\b/.test(step.title)
  return (
    <section id={id} data-process="" className={`${s.wrap} ${s.section}`} aria-labelledby={`${id}-h`}>
      <p className={`${s.mono} ${s.label}`}>{label}</p>
      <h2 id={`${id}-h`} className={s.h2}>
        {title}
      </h2>
      <p className={`${s.body} ${s.sub}`}>{lead}</p>
      <ol className={s.stages}>
        {steps.map((step, i) => (
          <li key={step.title} data-stage={no(i)} className={`${s.stage} ${isAi(step) ? s.stageAi : ''}`}>
            <p className={`${s.mono} ${s.stageNo}`}>
              <b>
                {stageLabel} {no(i)}
              </b>
            </p>
            <h3>{isAi(step) ? `{ ${step.title.toLowerCase()} }` : step.title}</h3>
            <p className={s.body}>{step.text}</p>
          </li>
        ))}
      </ol>
      <p className={s.bigNo} data-big-no="" aria-hidden="true">
        01
      </p>
      <ol className={`${s.track} ${s.mono}`} aria-hidden="true">
        {steps.map((step, i) => (
          <li key={step.title} data-mark="" data-ai={isAi(step) ? '' : undefined}>
            <i />
            {no(i)} {step.title}
          </li>
        ))}
      </ol>
    </section>
  )
}
