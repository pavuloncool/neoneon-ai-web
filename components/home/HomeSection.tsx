// components/home/HomeSection.tsx
// Wspólna oprawa sekcji one-pagera: <section> z kotwicą, nagłówek H2 powiązany przez aria-labelledby.
// scroll-mt-20 — kotwica z nawigacji nie chowa nagłówka pod przyklejonym paskiem (h-14).

import type { ReactNode } from 'react'

export function HomeSection({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children?: ReactNode
}) {
  const headingId = `${id}-title`
  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <h2 id={headingId} className="font-display font-light text-4xl md:text-5xl leading-tight">
          {title}
        </h2>
        {children}
      </div>
    </section>
  )
}
