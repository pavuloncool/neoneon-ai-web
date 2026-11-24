// Strona główna /{locale} — one-pager usługowy (brief neoneon-AI-web). Sekcje powstają po kolei,
// po jednej na iterację (lib/onePager.ts). Teksty: messages/{locale}.json, przestrzeń „onePager”.
// Lista bloga (dawna strona główna z page buildera) jest pod /{locale}/blog.
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
import { Hero } from '@/components/home/Hero'
import { AiRole, type AiRoleCard } from '@/components/home/AiRole'
import { Problem, type ProblemTexts } from '@/components/home/Problem'
import { Audience } from '@/components/home/Audience'
import { Services, type ServiceItem } from '@/components/home/Services'
import { Process, type ProcessStep } from '@/components/home/Process'
import { Pricing, type PricingCard, type PricingTexts } from '@/components/home/Pricing'
import { getAboutData, getArticles, getHomeFaq, getPricing } from '@/lib/queries'
import { FromBlog } from '@/components/home/FromBlog'
import { FinalCta } from '@/components/home/FinalCta'
import { BLOG_PATH } from '@/lib/links'
import { formatDate } from '@/lib/utils'
import { DATE_LOCALE, type Locale } from '@/lib/locales'
import { Faq, type FaqItemView } from '@/components/home/Faq'
import { FaqJsonLd } from '@/components/seo/FaqJsonLd'
import { About } from '@/components/home/About'
import { formatNumber, priceExamples, rateLine } from '@/lib/pricing'
import { TranslationStore } from '@/components/layout/TranslationStore'
import { AnchorScroll } from '@/components/blog/AnchorScroll'
import { seoMetadata } from '@/lib/metadata'
import { CONTACT_PATH, contactHrefFor, sectionAnchor } from '@/lib/onePager'
import { SITE_NAME, SITE_URL, localeUrl } from '@/lib/site'
import type { Metadata } from 'next'

const PERSON_NAME = 'Paweł Kuligowski'

// Wyceny: dane z Sanity → karty z gotowymi tekstami. Wyłączone w Ustawieniach wycen = brak sekcji.
// Błąd Sanity nie wywraca strony — sekcja po prostu się nie pokazuje.
async function loadPricing(
  locale: Locale,
  t: Awaited<ReturnType<typeof getTranslations<'onePager'>>>,
): Promise<{ texts: PricingTexts; cards: PricingCard[] } | null> {
  let data
  try {
    data = await getPricing(locale)
  } catch (error) {
    console.error('Wyceny: nie udało się pobrać danych z Sanity', error)
    return null
  }
  if (data.settings?.showRates === false) return null

  const n = (v: number) => formatNumber(v, locale)
  const currencyName = (c: 'PLN' | 'EUR') => t(c === 'EUR' ? 'pricingCurrencyEUR' : 'pricingCurrencyPLN')
  const rates = rateLine(data)
  const cards: PricingCard[] = priceExamples(data).map((ex) => {
    const top = Math.max(...ex.items.map((i) => i.hoursMax))
    let total: PricingCard['total'] = null
    if (ex.total) {
      // Szablon „ok. {min}–{max} zł netto” dzielony na części — liczby osobno (licznik w przeglądarce)
      const [before, rest] = t('pricingTotal', { min: '\u0000', max: '\u0001', currency: currencyName(ex.total.currency) }).split('\u0000')
      const [between, after] = rest.split('\u0001')
      total = { before, between, after, min: ex.total.min, max: ex.total.max }
    }
    return {
      id: ex.id,
      title: ex.title,
      summary: ex.summary,
      hoursLabel: t('pricingHours', { min: n(ex.hoursMin), max: n(ex.hoursMax) }),
      total,
      missingRates: ex.missingRates,
      items: ex.items.map((i) => ({
        key: i.key,
        task: i.task,
        hoursLabel: t('pricingHours', { min: n(i.hoursMin), max: n(i.hoursMax) }),
        minPct: (i.hoursMin / top) * 100,
        maxPct: (i.hoursMax / top) * 100,
      })),
    }
  })

  return {
    cards,
    texts: {
      title: t('pricingTitle'),
      lead: t('pricingLead'),
      ratesLine: rates.length
        ? `${t('pricingRatesLabel')} ${rates.map((r) => `${r.label} — ${n(r.amount)} ${t('pricingRateUnit', { currency: currencyName(r.currency) })}`).join(' · ')}`
        : null,
      note: data.settings?.note?.trim() || t('pricingNote'),
      cta: t('pricingCta'),
      devEmpty: t('pricingDevEmpty'),
    },
  }
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'onePager' })
  return seoMetadata({ locale, path: '', altPath: '', title: t('heroTitle'), description: t('heroLead') })
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'onePager' })
  const tHome = await getTranslations({ locale, namespace: 'home' })
  const pricing = await loadPricing(locale, t)
  // Błąd Sanity: sekcja „O mnie” bez portretu i linku do wpisu (tekst zostaje)
  const about = await getAboutData(locale, t('aboutPostSlug')).catch((error) => {
    console.error('O mnie: nie udało się pobrać danych z Sanity', error)
    return { portrait: null, post: null }
  })
  // Z bloga: trzy najnowsze wpisy w języku strony (getArticles przy błędzie zwraca pustą listę)
  const recentPosts = await getArticles({ limit: 3, locale })
  // FAQ: opublikowane „Pytania FAQ” z Sanity; bez nich (albo przy błędzie Sanity) — teksty z messages
  const faqFromSanity = await getHomeFaq(locale).catch((error) => {
    console.error('FAQ: nie udało się pobrać danych z Sanity', error)
    return []
  })
  const faq: FaqItemView[] = faqFromSanity.length
    ? faqFromSanity
    : (t.raw('faqItems') as { q: string; a: string }[]).map((item, i) => ({ id: `faq-${i}`, question: item.q, answer: item.a }))

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: localeUrl(locale),
          inLanguage: locale,
          description: t('heroLead'),
          publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
        }}
      />
      {/* Autor: bez worksFor i bez nazwy magazynu; sameAs — do uzupełnienia (brief 3.3) */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: PERSON_NAME,
          jobTitle: t('personJobTitle'),
          url: `${localeUrl(locale)}#${sectionAnchor('about', locale)}`,
          knowsLanguage: ['pl', 'en'],
        }}
      />
      {/* Przełącznik języka: strona główna drugiego języka */}
      <TranslationStore path="/" />
      {/* Wejście z kotwicą (/pl#o-mnie, przekierowanie z /pl/o-mnie, linki z menu): sekcje przypięte
          dokładają wysokość po załadowaniu — cel ustawiany ponownie po każdej zmianie wysokości */}
      <AnchorScroll />

      {/* Hero — jedyny H1 strony */}
      <Hero
        id={sectionAnchor('hero', locale)}
        contactHref={CONTACT_PATH[locale]}
        processHref={`#${sectionAnchor('process', locale)}`}
        texts={{
          eyebrow: t('heroEyebrow'),
          title: t('heroTitle'),
          subtitle: t('heroSubtitle'),
          lead: t('heroLead'),
          ctaPrimary: t('heroCtaPrimary'),
          ctaSecondary: t('heroCtaSecondary'),
          prompt: t('heroPrompt'),
          lastLine: t('heroLastLine'),
        }}
      />

      <AiRole
        id={sectionAnchor('aiRole', locale)}
        texts={{
          title: t('aiRoleTitle'),
          lead: t('aiRoleLead'),
          whoLabel: t('aiRoleWho'),
          unknown: t('aiRoleUnknown'),
          cards: t.raw('aiRoleCards') as AiRoleCard[],
        }}
      />

      <Problem
        id={sectionAnchor('problem', locale)}
        contactHref={contactHrefFor(locale, 'copy')}
        texts={{
          title: t('problemTitle'),
          lead: t('problemLead'),
          before: t('problemBefore'),
          note: t('problemNote'),
          after: t.raw('problemAfter') as string[],
          caption: t('problemCaption'),
          gaps: t.raw('problemGaps') as ProblemTexts['gaps'],
          closing: t('problemClosing'),
          cta: t('problemCta'),
        }}
      />

      <Audience
        id={sectionAnchor('audience', locale)}
        texts={{
          title: t('audienceTitle'),
          lead: t('audienceLead'),
          industries: t.raw('audienceIndustries') as string[],
          rest: t('audienceRest'),
          text: t('audienceText'),
          pause: tHome('rotatingPause'),
          resume: tHome('rotatingResume'),
        }}
      />

      <Services
        id={sectionAnchor('services', locale)}
        title={t('servicesTitle')}
        items={(t.raw('servicesItems') as Omit<ServiceItem, 'href'>[]).map((item) => ({ ...item, href: contactHrefFor(locale, item.key) }))}
      />

      <Process
        id={sectionAnchor('process', locale)}
        title={t('processTitle')}
        lead={t('processLead')}
        steps={t.raw('processSteps') as ProcessStep[]}
      />

      {pricing ? (
        <Pricing
          id={sectionAnchor('pricing', locale)}
          locale={locale}
          ctaHref={CONTACT_PATH[locale]}
          texts={pricing.texts}
          cards={pricing.cards}
        />
      ) : null}

      <About
        id={sectionAnchor('about', locale)}
        portrait={about.portrait}
        postHref={about.post ? `/${about.post.category}/${about.post.slug}` : null}
        texts={{
          eyebrow: t('aboutEyebrow'),
          title: t('aboutTitle'),
          paragraphs: t.raw('aboutParagraphs') as string[],
          strike: t('aboutStrike'),
          facts: t('aboutFacts'),
          link: t('aboutLink'),
          portraitAlt: PERSON_NAME,
        }}
      />

      <Faq id={sectionAnchor('faq', locale)} title={t('faqTitle')} items={faq} />
      {/* FAQPage z tych samych danych co widok */}
      <FaqJsonLd faq={faq} />

      <FromBlog
        id={sectionAnchor('blog', locale)}
        title={t('blogTitle')}
        lead={t('blogLead')}
        cta={t('blogCta')}
        ctaHref={BLOG_PATH}
        posts={recentPosts.map((a) => ({
          id: a.id,
          href: `/${a.category}/${a.slug}`,
          title: a.title,
          excerpt: a.excerpt ?? null,
          date: a.published_at ? formatDate(a.published_at, DATE_LOCALE[locale]) : null,
          dateTime: a.published_at ?? null,
          category: a.category_title ?? null,
          image: a.cover_image_url ? { url: a.cover_image_url, focalX: a.cover_focal_x ?? null, focalY: a.cover_focal_y ?? null } : null,
        }))}
      />

      <FinalCta
        id={sectionAnchor('cta', locale)}
        title={t('ctaTitle')}
        text={t('ctaText')}
        button={t('ctaButton')}
        href={CONTACT_PATH[locale]}
      />
    </>
  )
}
