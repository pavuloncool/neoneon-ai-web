import type { MetadataRoute } from 'next'
import { IS_INDEXABLE, SITE_URL } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  // Podglądy Vercel, wersja robocza (SITE_STAGING=1) i lokalne buildy nie są indeksowane (do tego nagłówek X-Robots-Tag w next.config.ts)
  if (!IS_INDEXABLE) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/studio', '/api/'] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
