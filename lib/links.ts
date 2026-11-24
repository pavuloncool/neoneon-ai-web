// lib/links.ts
// Link z Sanity (typ `link`) → adres na stronie. Adresy wewnętrzne są bez prefiksu języka —
// dodaje go Link z next-intl (@/i18n/navigation).

export interface SanityLink {
  linkType?: 'page' | 'category' | 'search' | 'anchor' | 'external'
  category?: string
  anchor?: string
  url?: string
  page?: { slug?: string | null; isHome?: boolean | null } | null
}

// Strona z zaznaczonym `isHome` (dawna strona główna z page buildera) to od one-pagera lista bloga:
// /{locale}/blog. Strona główna /{locale} jest w kodzie (app/[locale]/(blog)/page.tsx).
export const BLOG_PATH = '/blog'
export function pagePath(page: { slug?: string | null; isHome?: boolean | null }): string {
  return page.isHome ? BLOG_PATH : `/${page.slug ?? ''}`
}

export interface ResolvedLink {
  href: string
  external: boolean
}

export function resolveHref(link?: SanityLink | null): ResolvedLink | null {
  switch (link?.linkType) {
    case 'page':
      if (!link.page) return null
      return { href: pagePath(link.page), external: false }
    case 'category':
      return link.category ? { href: `/${link.category}`, external: false } : null
    case 'search':
      return { href: '/search', external: false }
    case 'anchor':
      // Sekcja one-pagera; prefiks języka dodaje Link z next-intl → /pl#proces
      return link.anchor ? { href: `/#${link.anchor}`, external: false } : null
    case 'external':
      return link.url ? { href: link.url, external: true } : null
    default:
      return null
  }
}

// Adres dla <Link> z next-intl. Kotwica strony głównej ('/#proces') jako obiekt — inaczej next-intl
// sklei '/pl' + '/#proces' w '/pl/#proces' (zbędne przekierowanie /pl/ → /pl); z obiektem wychodzi '/pl#proces'.
export function linkHref(href: string): string | { pathname: string; hash: string } {
  return href.startsWith('/#') ? { pathname: '/', hash: href.slice(2) } : href
}

// Slug kategorii w linku, kafelku i artykule: z dokumentu `category`
export const CATEGORY_SLUG = `categoryRef->slug.current`

// Projekcja GROQ dla pola typu `link`
export const LINK_PROJECTION = `{ linkType, "category": ${CATEGORY_SLUG}, anchor, url, "page": page->{ "slug": slug.current, isHome } }`
