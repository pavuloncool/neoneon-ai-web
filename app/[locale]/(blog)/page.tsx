// Strona główna /{locale} — one-pager usługowy (brief neoneon-AI-web). Sekcje powstają po kolei,
// po jednej na iterację (lib/onePager.ts). Teksty: messages/{locale}.json, przestrzeń „onePager”.
// Lista bloga (dawna strona główna z page buildera) jest pod /{locale}/blog.
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
// Sekcje poniżej pierwszego ekranu — osobne pliki JS (components/home/lazy.tsx)
import { About, Audience, Faq, FinalCta, FromBlog, Pricing, Problem } from '@/components/home/lazy'
import type { AiRoleCard } from '@/components/home/AiRole'
import type { ProblemTexts } from '@/components/home/Problem'
import type { ServiceItem } from '@/components/home/Services'
import type { ProcessStep } from '@/components/home/Process'
import type { PricingCard, PricingTexts } from '@/components/home/Pricing'
import { getAboutData, getArticles, getHomeFaq, getPricing } from '@/lib/queries'
import { BLOG_PATH } from '@/lib/links'
import { formatDate } from '@/lib/utils'
import { DATE_LOCALE, type Locale } from '@/lib/locales'
import type { FaqItemView } from '@/components/home/Faq'
import { FaqJsonLd } from '@/components/seo/FaqJsonLd'
import { formatNumber, priceExamples, rateLine } from '@/lib/pricing'
import { TranslationStore } from '@/components/layout/TranslationStore'
import { AnchorScroll } from '@/components/blog/AnchorScroll'
import { seoMetadata } from '@/lib/metadata'
import { CONTACT_PATH, ONE_PAGER_SECTIONS, contactHrefFor, sectionAnchor, type OnePagerSectionKey } from '@/lib/onePager'
import { HomeSignal, type HomeDialItem } from '@/components/sygnal/HomeSignal'
import { AiRoleSection } from '@/components/sygnal/home/AiRoleSection'
import { ServicesSection } from '@/components/sygnal/home/ServicesSection'
import { ProcessSection } from '@/components/sygnal/home/ProcessSection'
import { HOME_LABELS } from '@/components/sygnal/labels'
import { PUBLIC_CONTACT_EMAIL, SITE_NAME, SITE_URL, localeUrl } from '@/lib/site'
import type { Metadata } from 'next'

const PERSON_NAME = 'Paweł Kuligowski'

// Wyceny: dane z Sanity → karty z gotowymi tekstami. Wyłączone w Ustawieniach wycen = brak sekcji.
// Błąd Sanity nie wywraca strony — sekcja po prostu się nie pokazuje.
async function loadPricing(
  locale: Locale,
  t: Awaited<ReturnType<typeof getTranslations<'onePager'>>>,
): Promise<{ texts: PricingTexts; cards: PricingCard[]; rates: ReturnType<typeof rateLine> } | null> {
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

  // Bez opublikowanych przykładów sekcja się nie pokazuje — wtedy także bez stawek w JSON-LD
  return {
    cards,
    rates: cards.length ? rates : [],
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
  const personId = `${localeUrl(locale)}#person`
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

  // Koło: sekcje strony głównej (wyceny tylko gdy widoczne); mapa — pełna lista, koło — grupy
  const L = HOME_LABELS[locale]
  const tA11y = await getTranslations({ locale, namespace: 'a11y' })
  const anchor = (key: OnePagerSectionKey) => sectionAnchor(key, locale)
  const visible = ONE_PAGER_SECTIONS.filter((sec) => sec.key !== 'pricing' || pricing)
  const sectionLabel = (key: OnePagerSectionKey) =>
    `${String(visible.findIndex((sec) => sec.key === key) + 1).padStart(2, '0')} · ${L.sections[key]}`
  const summary: Partial<Record<OnePagerSectionKey, string>> = {
    hero: (t.raw('heroHeadline') as string[]).join(' '),
    aiRole: t('aiRoleTitle'),
    problem: t('problemTitle'),
    audience: t('audienceTitle'),
    services: t('servicesTitle'),
    process: t('processTitle'),
    pricing: t('pricingTitle'),
    about: t('aboutTitle'),
    faq: t('faqTitle'),
    blog: t('blogTitle'),
    cta: t('ctaTitle'),
  }
  const mapItems = visible.map((sec) => ({ key: anchor(sec.key), href: `#${anchor(sec.key)}`, label: L.sections[sec.key], summary: summary[sec.key] }))
  const group = (key: string, label: string, keys: OnePagerSectionKey[], target: OnePagerSectionKey): HomeDialItem => ({
    key,
    label,
    href: `#${anchor(target)}`,
    summary: summary[target],
    ids: keys.map(anchor),
  })
  const dialItems: HomeDialItem[] = [
    group('start', L.sections.hero, ['hero'], 'hero'),
    group('ai', L.sections.aiRole, ['aiRole'], 'aiRole'),
    group('audience', L.group.audience, ['problem', 'audience'], 'problem'),
    group('services', L.sections.services, ['services'], 'services'),
    group('process', L.sections.process, ['process'], 'process'),
    ...(pricing ? [group('pricing', L.sections.pricing, ['pricing'], 'pricing')] : []),
    group('talk', L.group.talk, ['about', 'faq', 'blog', 'cta'], 'cta'),
  ]

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
          '@id': personId,
          name: PERSON_NAME,
          jobTitle: t('personJobTitle'),
          url: `${localeUrl(locale)}#${sectionAnchor('about', locale)}`,
          knowsLanguage: ['pl', 'en'],
        }}
      />
      {/* Usługa: Polska i zdalnie, PL/EN; stawki godzinowe (HUR) tylko gdy sekcja wycen jest widoczna */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfessionalService',
          '@id': `${localeUrl(locale)}#service`,
          name: SITE_NAME,
          url: localeUrl(locale),
          description: t('heroLead'),
          areaServed: [{ '@type': 'Country', name: locale === 'pl' ? 'Polska' : 'Poland' }, { '@type': 'Place', name: locale === 'pl' ? 'Zdalnie' : 'Remote' }],
          availableLanguage: ['pl', 'en'],
          founder: { '@id': personId },
          ...(pricing && pricing.rates.length
            ? {
                makesOffer: pricing.rates.map((rate) => ({
                  '@type': 'Offer',
                  name: rate.label,
                  priceSpecification: {
                    '@type': 'UnitPriceSpecification',
                    price: rate.amount,
                    priceCurrency: rate.currency,
                    unitCode: 'HUR',
                    valueAddedTaxIncluded: false,
                  },
                })),
              }
            : {}),
        }}
      />
      {/* Przełącznik języka: strona główna drugiego języka */}
      <TranslationStore path="/" />
      {/* Wejście z kotwicą (/pl#o-mnie, przekierowanie z /pl/o-mnie, linki z menu): sekcje przypięte
          dokładają wysokość po załadowaniu — cel ustawiany ponownie po każdej zmianie wysokości */}
      <AnchorScroll />

      <HomeSignal
        locale={locale}
        heroId={anchor('hero')}
        processId={anchor('process')}
        hero={{
          eyebrow: t('heroEyebrow'),
          subtitle: t('heroSubtitle'),
          headline: t.raw('heroHeadline') as [string, string],
          lead: t('heroLead'),
          ctaPrimary: t('heroCtaPrimary'),
          ctaSecondary: t('heroCtaSecondary'),
        }}
        dialItems={dialItems}
        mapItems={mapItems}
        contactHref={CONTACT_PATH[locale]}
        email={PUBLIC_CONTACT_EMAIL}
        langLabels={{ pl: tA11y('languagePl'), en: tA11y('languageEn') }}
      >
        <AiRoleSection
          id={anchor('aiRole')}
          label={sectionLabel('aiRole')}
          texts={{ title: t('aiRoleTitle'), lead: t('aiRoleLead'), cards: t.raw('aiRoleCards') as AiRoleCard[] }}
          whoLabel={L.who}
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

        <ServicesSection
          id={anchor('services')}
          label={sectionLabel('services')}
          title={t('servicesTitle')}
          items={(t.raw('servicesItems') as Omit<ServiceItem, 'href'>[]).map((item) => ({ ...item, href: contactHrefFor(locale, item.key) }))}
        />

        <ProcessSection
          id={anchor('process')}
          label={sectionLabel('process')}
          title={t('processTitle')}
          lead={t('processLead')}
          steps={t.raw('processSteps') as ProcessStep[]}
          stageLabel={L.stage}
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
      </HomeSignal>
    </>
  )
}
