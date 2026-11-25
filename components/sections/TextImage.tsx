// components/sections/TextImage.tsx
// Sekcja „Tekst ze zdjęciem” (page builder: zdjęcie + tekst + link) w stylu „Sygnał”.

import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { resolveHref } from '@/lib/links'
import { Arrow } from '@/components/sygnal/ArticleRow'
import styles from '@/components/sygnal/lists.module.css'
import { SimpleText } from './SimpleText'
import type { TextImageSection, SanityImage } from '@/types'

export function TextImage({ section }: { section: TextImageSection }) {
  const image: SanityImage | null = section.image?.url ? section.image : null
  const cta = resolveHref(section.ctaLink)
  const label = (
    <>
      {section.ctaLabel}
      <Arrow />
    </>
  )

  return (
    <div className={styles.textImage}>
      {image && (
        <div className={styles.textImagePhoto}>
          <Image
            src={image.url}
            alt={image.alt ?? ''}
            fill
            sizes="320px"
            className="object-cover"
            style={image.hotspot ? { objectPosition: `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%` } : undefined}
          />
        </div>
      )}
      <div className={styles.textImageBody}>
        <SimpleText value={section.body} />
        {cta && section.ctaLabel && (
          cta.external ? (
            <a href={cta.href} className={styles.textLink} target="_blank" rel="noopener noreferrer">{label}</a>
          ) : (
            <Link href={cta.href} className={styles.textLink}>{label}</Link>
          )
        )}
      </div>
    </div>
  )
}
