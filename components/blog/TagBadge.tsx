// components/blog/TagBadge.tsx
'use client'
import { Link } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { cn } from '@/lib/utils'
import styles from '@/components/sygnal/lists.module.css'
import type { Tag } from '@/types'

interface TagBadgeProps {
  tag: Tag
  active?: boolean
  href?: string
  className?: string
}

// Pigułka tagu w stylu „Sygnał”: obrys, mono wersalikami; aktywny filtr wypełniony limonką
export function TagBadge({ tag, active = false, href, className }: TagBadgeProps) {
  const locale = useLocale()
  const label = locale === 'en' && tag.name_en ? tag.name_en : tag.name

  const resolvedHref = href ?? `/search?tag=${tag.slug}`

  return (
    <Link
      href={resolvedHref}
      aria-current={active ? 'true' : undefined}
      className={cn(styles.tag, active && styles.tagActive, className)}
    >
      {label}
    </Link>
  )
}
