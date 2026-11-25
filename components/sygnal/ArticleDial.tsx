'use client'

// components/sygnal/ArticleDial.tsx
// Artykuł zgłasza kołu swój spis treści (śródtytuły H2, FAQ, komentarze) i bieżący śródtytuł —
// ostatni, którego górna krawędź minęła 35% wysokości okna. Nic nie renderuje.

import { useEffect } from 'react'
import { setDialCurrent, setDialOverride } from './dialStore'
import type { DialItem } from './SignalDial'

export function ArticleDial({ items }: { items: DialItem[] }) {
  useEffect(() => {
    setDialOverride({ items, current: null })
    let raf = 0
    const update = () => {
      raf = 0
      const line = window.innerHeight * 0.35
      let current: string | null = null
      for (const item of items) {
        const el = document.getElementById(item.href.slice(1))
        if (el && el.getBoundingClientRect().top <= line) current = item.key
      }
      setDialCurrent(current)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
      setDialOverride(null)
    }
  }, [items])
  return null
}
