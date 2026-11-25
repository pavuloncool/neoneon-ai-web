export const dynamic = 'force-dynamic'

import { getTranslations } from 'next-intl/server'
import { notFound, permanentRedirect } from 'next/navigation'
import Image from 'next/image'
import { getArticleBySlug, getCommentsByArticle, getArticleTranslation, getCategorySlugByPreviousSlug, getPage } from '@/lib/queries'
import { PageSections } from '@/components/sections/SectionRendererLazy'
import { CategoryPage } from '@/components/blog/CategoryPage'
import { resolveCategory } from '@/lib/categoryRoute'
import { pageMetadata, seoMetadata } from '@/lib/metadata'
import { SITE_NAME, SITE_URL, localeUrl, COMMENTS_ENABLED } from '@/lib/site'
import { DATE_LOCALE, otherLocale, type Locale } from '@/lib/locales'
import { JsonLd } from '@/components/seo/JsonLd'
import { FaqJsonLd } from '@/components/seo/FaqJsonLd'
import { formatDate, readingMinutes } from '@/lib/utils'
import { PortableTextRenderer } from '@/components/blog/PortableTextRenderer'
import { FaqSection } from '@/components/blog/FaqSection'
import { AnchorScroll } from '@/components/blog/AnchorScroll'
import { TagBadge } from '@/components/blog/TagBadge'
import { CommentForm } from '@/components/blog/lazy'
import { ArticleDial } from '@/components/sygnal/ArticleDial'
import { ArticleCta } from '@/components/sygnal/ArticleCta'
import a from '@/components/sygnal/article.module.css'
import { Link } from '@/i18n/navigation'
import { slugify } from '@/lib/slugify'
import { toPlainText, type PortableTextBlock } from '@portabletext/react'
import { TranslationStore } from '@/components/layout/TranslationStore'
import type { Metadata } from 'next'
import { stegaClean } from 'next-sanity'

interface ArticlePageProps {
  params: Promise<{ locale: Locale; segments: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

// Parametry adresu (np. ?tag=) przenoszone do adresu docelowego przekierowania
function queryString(params: Record<string, string | string[] | undefined>): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    for (const v of Array.isArray(value) ? value : value === undefined ? [] : [value]) qs.append(key, v)
  }
  const out = qs.toString()
  return out ? `?${out}` : ''
}

// /{locale}/{slug} = kategoria (dokument `category`), a gdy to nie kategoria — strona z page buildera
//   („O mnie”, „Kontakt”, nowe strony); dawny adres kategorii (`previousSlugs`) → 308; inaczej 404.
//   Walidacja w Studio nie pozwala, by kategoria i strona miały ten sam slug w jednym języku.
// /{locale}/{kategoria}/{slug} = artykuł
// Opis artykułu dla wyszukiwarek (meta description i JSON-LD): Opis SEO, a gdy pusty — zajawka.
// W podglądzie pola niosą znaczniki edycji (stega) — w metadanych są zbędne.
function articleDescription(article: { seo_description?: string | null; excerpt?: string | null }) {
  return stegaClean(article.seo_description)?.trim() || stegaClean(article.excerpt)
}

// Kotwica sekcji komentarzy (spis treści w kole)
const COMMENTS_ID: Record<Locale, string> = { pl: 'komentarze', en: 'comments' }

function getRouteParams(segments: string[]) {
  if (segments.length !== 2) notFound()
  return { category: segments[0], slug: segments[1] }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { locale, segments } = await params
  if (segments.length === 1) {
    const category = await resolveCategory(locale, segments[0])
    if (category) {
      // Filtr ?tag= nie tworzy osobnych adresów — canonical wskazuje stronę kategorii
      return seoMetadata({
        locale,
        path: `/${category.slug}`,
        altPath: category.altSlug !== null ? `/${category.altSlug}` : null,
        title: category.seoTitle,
        description: category.seoDescription,
      })
    }
    return pageMetadata(await getPage(locale, segments[0]), locale)
  }
  const { slug } = getRouteParams(segments)
  const article = await getArticleBySlug(slug, locale)
  if (!article) return {}
  const translation = await getArticleTranslation(article.id, otherLocale(locale))
  // W podglądzie tytuł i zajawka niosą znaczniki edycji (stega) — w metadanych są zbędne
  const title = stegaClean(article.title)
  return seoMetadata({
    locale,
    path: `/${article.category}/${article.slug}`,
    altPath: translation ? `/${translation.category}/${translation.slug}` : null,
    // Tytuł SEO / Opis SEO są nieobowiązkowe — puste pole = tytuł i zajawka
    title: stegaClean(article.seo_title)?.trim() || title,
    description: articleDescription(article),
    image: article.cover_image_url ? { url: article.cover_image_url, alt: title } : null,
    article: { publishedTime: article.published_at, modifiedTime: article.updated_at },
  })
}

export default async function ArticlePage({ params, searchParams }: ArticlePageProps) {
  const { locale, segments } = await params

  if (segments.length === 1) {
    const category = await resolveCategory(locale, segments[0])
    const query = await searchParams
    if (category) return <CategoryPage category={category} locale={locale} tag={typeof query.tag === 'string' ? query.tag : undefined} />
    const page = await getPage(locale, segments[0])
    if (page) return <PageSections page={page} locale={locale} />
    // Dawny adres kategorii (`previousSlugs`) → 308 na obecny, z parametrami adresu
    const current = await getCategorySlugByPreviousSlug(locale, segments[0])
    if (current && current !== segments[0]) permanentRedirect(`/${locale}/${current}${queryString(query)}`)
    notFound()
  }

  const { category, slug } = getRouteParams(segments)

  const article = await getArticleBySlug(slug, locale)
  if (!article) notFound()
  if (article.category !== category) {
    // Artykuł pod dawnym adresem swojej kategorii → 308 na obecny; inna kategoria w adresie → 404
    if (article.category_previous_slugs?.includes(category)) {
      permanentRedirect(`/${locale}/${article.category}/${article.slug}${queryString(await searchParams)}`)
    }
    notFound()
  }

  const comments = COMMENTS_ENABLED ? await getCommentsByArticle(article.id) : []
  const t = await getTranslations('comments')
  const tArticle = await getTranslations('article')

  const targetLocale = otherLocale(locale)
  const translation = await getArticleTranslation(article.id, targetLocale)

  // Nazwa z dokumentu `category` (zapasowo slug)
  const categoryLabel = article.category_title ?? article.category

  const dateLocale = DATE_LOCALE[locale]
  // Spis treści dla koła: H2 z treści (te same id co w PortableTextRenderer), potem FAQ i komentarze
  const tocItems = [
    ...((article.content ?? []) as PortableTextBlock[])
      .filter((b) => b._type === 'block' && (b as { style?: string }).style === 'h2')
      .map((b) => {
        const text = stegaClean(toPlainText([b])).trim()
        const id = slugify(text)
        return { key: id, label: text, href: `#${id}` }
      })
      .filter((x) => x.label),
    ...((article.faq ?? []).some((f) => f?.question?.trim() && f?.answer?.trim())
      ? [{ key: 'faq', label: stegaClean(tArticle('faqHeading')), href: '#faq' }]
      : []),
    ...(COMMENTS_ENABLED ? [{ key: COMMENTS_ID[locale], label: t('sectionZero'), href: `#${COMMENTS_ID[locale]}` }] : []),
  ]
  const readingTime = tArticle('readingTime', { minutes: readingMinutes(article.content) })

  return (
    <>
      {translation && (
        <TranslationStore path={`/${translation.category}/${translation.slug}`} />
      )}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: stegaClean(article.title),
          description: articleDescription(article) ?? undefined,
          image: article.cover_image_url ?? undefined,
          datePublished: article.published_at ?? undefined,
          dateModified: article.updated_at ?? undefined,
          inLanguage: locale,
          url: localeUrl(locale, `/${article.category}/${article.slug}`),
          mainEntityOfPage: localeUrl(locale, `/${article.category}/${article.slug}`),
          author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
          publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        }}
      />
      <FaqJsonLd faq={article.faq} />
      {/* Spis treści dla koła (śródtytuły H2, FAQ, komentarze) — koło w layoucie pokazuje je zamiast menu */}
      <ArticleDial items={tocItems} />
      <article className={a.article}>
        {/* Kotwica (np. #faq) odporna na dorastanie treści po załadowaniu */}
        <AnchorScroll />
        <header className={`${a.head} ${article.cover_image_url ? a.headCover : ''}`}>
          <div className={a.headText}>
            <p className={a.meta}>
              <Link href={`/${article.category}`} className={a.metaCat}>{categoryLabel}</Link>
              <span aria-hidden="true">·</span>
              <span>{article.published_at ? formatDate(article.published_at, dateLocale) : ''}</span>
              <span aria-hidden="true">·</span>
              <span>{readingTime}</span>
            </p>
            <h1 className={a.title}>{article.title}</h1>
            {article.excerpt && <p className={a.lead}>{article.excerpt}</p>}
            {article.tags && article.tags.length > 0 && (
              <div className={a.tags}>
                {article.tags.map((tag) => <TagBadge key={tag.id} tag={tag} className={a.tag} />)}
              </div>
            )}
          </div>
          {article.cover_image_url && (
            <div className={a.cover}>
              <Image src={article.cover_image_url} alt={article.title} fill priority
                className="object-cover"
                style={{ objectPosition: `${(article.cover_focal_x ?? 0.5) * 100}% ${(article.cover_focal_y ?? 0.5) * 100}%` }}
                sizes="(max-width: 1023px) 100vw, 40vw" />
            </div>
          )}
        </header>
        <div className={a.body} data-article-body="">
          {article.content && <PortableTextRenderer content={article.content} />}
          <FaqSection faq={article.faq} heading={tArticle('faqHeading')} />
          <ArticleCta locale={locale} categoryId={article.category_id} />
          {COMMENTS_ENABLED && (
            <section id={COMMENTS_ID[locale]} className={a.comments} aria-labelledby="comments-heading">
              <h2 id="comments-heading" className={a.commentsTitle}>
                {comments.length === 0 ? t('sectionZero') : comments.length === 1 ? t('sectionOne') : t('sectionMany', { count: comments.length })}
              </h2>
              {comments.length > 0 && (
                <ul className={a.commentList}>
                  {comments.map((comment) => (
                    <li key={comment.id}>
                      <div className={a.commentMeta}>
                        <span>{comment.author_name}</span>
                        <span>{formatDate(comment.created_at, dateLocale)}</span>
                      </div>
                      <p>{comment.body}</p>
                    </li>
                  ))}
                </ul>
              )}
              <CommentForm articleId={article.id} />
            </section>
          )}
        </div>
      </article>
    </>
  )
}
