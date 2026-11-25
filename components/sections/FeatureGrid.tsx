// components/sections/FeatureGrid.tsx
// Sekcja „Siatka obszarów” (page builder) — karty „Sygnał”.

import styles from '@/components/sygnal/lists.module.css'
import type { FeatureGridSection } from '@/types'

export function FeatureGrid({ section }: { section: FeatureGridSection }) {
  const items: { _key: string; title: string; description?: string }[] = section.items ?? []

  return (
    <section className={styles.features}>
      {section.label && <h2 className={styles.sectionHead}>{section.label}</h2>}
      <div className={styles.featureGrid} style={{ marginTop: 16 }}>
        {items.map((item) => (
          <div key={item._key} className={styles.feature}>
            <h3 className={styles.featureTitle}>{item.title}</h3>
            {item.description && <p className={styles.featureText}>{item.description}</p>}
          </div>
        ))}
      </div>
    </section>
  )
}
