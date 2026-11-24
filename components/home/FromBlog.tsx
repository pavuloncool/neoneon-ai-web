'use client'

// components/home/FromBlog.tsx
// Z bloga (brief 5.10): trzy najnowsze wpisy z Sanity (tytuł, data, kategoria, zajawka) i link do listy.
// Sekcja jest oddechem przed CTA końcowym: karty wchodzą stagger 0,1 s, na hover obrazek scale 1,03
// w masce (CSS) — bez innych efektów. Reduce / bez JS: statycznie, bez powiększenia obrazka.

import { useRef } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { gsap, motionEnabled, markMotionReady } from '@/lib/gsap'
import { ScrollTrigger } from '@/lib/gsap-scroll'
import { useSectionMotion } from '@/lib/useSectionMotion'
import { DURATION, EASE, OFFSET, STAGGER, TRIGGER_START } from '@/lib/motion'

export interface BlogCard {
  id: string
  href: string
  title: string
  excerpt: string | null
  date: string | null // sformatowana data
  dateTime: string | null // ISO do <time>
  category: string | null
  image: { url: string; focalX: number | null; focalY: number | null } | null
}

export function FromBlog({ id, title, lead, cta, ctaHref, posts }: { id: string; title: string; lead: string; cta: string; ctaHref: string; posts: BlogCard[] }) {
  const root = useRef<HTMLElement>(null)

  useSectionMotion(root, ({ reduce }) => {
    const el = root.current
    if (!el) return
    const finish = () => el.setAttribute('data-blog-done', '')
    if (!motionEnabled() || reduce || posts.length === 0) {
      finish()
      markMotionReady()
      return
    }
    const cards = gsap.utils.toArray<HTMLElement>('[data-blog-card]', el)
    gsap.set(cards, { opacity: 0, y: OFFSET.card })
    finish()
    markMotionReady()
    ScrollTrigger.create({
      trigger: el.querySelector('[data-blog-grid]'),
      start: TRIGGER_START.default,
      once: true,
      onEnter: () => gsap.to(cards, { opacity: 1, y: 0, duration: DURATION.base, stagger: STAGGER.cardsTight, ease: EASE.base, clearProps: 'transform' }),
    })
  })

  if (posts.length === 0) return null

  return (
    <section ref={root} id={id} aria-labelledby={`${id}-title`} data-blog className="scroll-mt-20 border-t border-border dark:border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-20 md:py-28">
        <h2 id={`${id}-title`} className="font-display font-light text-4xl md:text-5xl leading-tight">
          {title}
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-muted max-w-3xl">{lead}</p>

        {/* Wspólne wiersze kart (subgrid, jak w Usługach): obrazek, data i kategoria, tytuł, zajawka */}
        <ul data-blog-grid className="mt-12 grid gap-10 md:grid-cols-3 md:gap-x-8 md:gap-y-0 md:grid-rows-[auto_auto_auto_1fr]">
          {posts.map((post) => (
            <li key={post.id} data-blog-card className="md:grid md:grid-rows-subgrid md:row-span-4">
              <article className="group md:grid md:grid-rows-subgrid md:row-span-4">
                <Link href={post.href} className="block md:grid md:grid-rows-subgrid md:row-span-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                  {post.image ? (
                    // Maska: obrazek powiększa się w obrębie ramki (overflow hidden)
                    <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-border/40">
                      <Image
                        src={post.image.url}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 22rem, 90vw"
                        className="object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
                        style={{
                          objectPosition:
                            post.image.focalX != null && post.image.focalY != null ? `${post.image.focalX * 100}% ${post.image.focalY * 100}%` : undefined,
                        }}
                      />
                    </div>
                  ) : (
                    <div aria-hidden="true" />
                  )}
                  <p className="mt-5 font-mono text-xs uppercase tracking-[0.14em] text-muted">
                    {post.date && post.dateTime ? <time dateTime={post.dateTime}>{post.date}</time> : null}
                    {post.date && post.category ? <span aria-hidden="true"> · </span> : null}
                    {post.category}
                  </p>
                  <h3 className="mt-3 font-display text-2xl leading-snug">
                    {post.title}
                  </h3>
                  {post.excerpt ? <p className="mt-3 text-[15px] leading-relaxed text-muted line-clamp-3">{post.excerpt}</p> : <div aria-hidden="true" />}
                </Link>
              </article>
            </li>
          ))}
        </ul>

        <Link
          href={ctaHref}
          className="group mt-12 inline-flex items-center gap-2 text-sm font-medium underline underline-offset-4 decoration-border hover:decoration-current focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {cta}
          <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
        </Link>
      </div>
    </section>
  )
}
