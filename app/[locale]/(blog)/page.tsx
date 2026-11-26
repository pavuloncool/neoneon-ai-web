// Strona główna /{locale} — one-pager usługowy (brief neoneon-AI-web). Sekcje powstają po kolei,
// po jednej na iterację (lib/onePager.ts). Teksty: Sanity „Strona główna — teksty” (homeCopy), w next-intl jako „onePager”.
// Lista bloga (dawna strona główna z page buildera) jest pod /{locale}/blog.
import { getTranslations } from 'next-intl/server'
import { JsonLd } from '@/components/seo/JsonLd'
// Sekcje „Sygnał”: components/sygnal/home (serwerowe), hero i koło — components/sygnal/HomeSignal.tsx
import { getAboutData, getArticles, getHomeFaq, getPricing, getSiteSettings } from '@/lib/queries'
import { BLOG_PATH } from '@/lib/links'
import type { Locale } from '@/lib/locales'
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
import { ProblemSection } from '@/components/sygnal/home/ProblemSection'
import { AudienceSection } from '@/components/sygnal/home/AudienceSection'
import { PricingSection } from '@/components/sygnal/home/PricingSection'
import { AboutSection } from '@/components/sygnal/home/AboutSection'
import { FaqSection } from '@/components/sygnal/home/FaqSection'
import { FromBlogSection } from '@/components/sygnal/home/FromBlogSection'
import { TalkSection } from '@/components/sygnal/home/TalkSection'
import type { AiRoleCard, FaqItemView, PricingCard, PricingTexts, ProblemTexts, ProcessStep, ServiceItem } from '@/components/sygnal/home/types'
import { PUBLIC_CONTACT_EMAIL, SITE_URL, localeUrl } from '@/lib/site'
import type { Metadata } from 'next'

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
  const pricing = await loadPricing(locale, t)
  const personId = `${localeUrl(locale)}#person`
  // Błąd Sanity: sekcja „O mnie” bez portretu i linku do wpisu (tekst zostaje)
  const about = await getAboutData(locale, t('aboutPostSlug')).catch((error) => {
    console.error('O mnie: nie udało się pobrać danych z Sanity', error)
    return { portrait: null, post: null }
  })
  // Z bloga: trzy najnowsze wpisy w języku strony (getArticles przy błędzie zwraca pustą listę)
  const recentPosts = await getArticles({ limit: 3, locale })
  // FAQ: opublikowane „Pytania FAQ” z Sanity (bez zapasu w kodzie — przy błędzie Sanity sekcja jest pusta)
  const faq: FaqItemView[] = await getHomeFaq(locale).catch((error) => {
    console.error('FAQ: nie udało się pobrać danych z Sanity', error)
    return []
  })
  const settings = await getSiteSettings(locale)
  const siteName = settings?.siteName ?? ''
  const personName = t('personName')

  // Koło: sekcje strony głównej (wyceny tylko gdy widoczne); mapa — pełna lista, koło — grupy
  const L = t.raw('wheel') as { sections: Record<OnePagerSectionKey, string>; group: { audience: string; talk: string }; stage: string; who: string }
  const anchor = (key: OnePagerSectionKey) => sectionAnchor(key, locale)
  // Wyceny bez opublikowanych przykładów: na produkcji sekcji nie ma (w dev — komunikat), więc i pozycji w kole
  const showPricing = Boolean(pricing && (pricing.cards.length > 0 || process.env.NODE_ENV === 'development'))
  const visible = ONE_PAGER_SECTIONS.filter((sec) => sec.key !== 'pricing' || showPricing)
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
    ...(showPricing ? [group('pricing', L.sections.pricing, ['pricing'], 'pricing')] : []),
    group('talk', L.group.talk, ['about', 'faq', 'blog', 'cta'], 'cta'),
  ]

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteName,
          url: localeUrl(locale),
          inLanguage: locale,
          description: t('heroLead'),
          publisher: { '@type': 'Organization', name: siteName, url: SITE_URL },
        }}
      />
      {/* Autor: bez worksFor i bez nazwy magazynu; sameAs — do uzupełnienia (brief 3.3) */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          '@id': personId,
          name: personName,
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
          name: siteName,
          url: localeUrl(locale),
          description: t('heroLead'),
          areaServed: [{ '@type': 'Country', name: t('areaServed.country') }, { '@type': 'Place', name: t('areaServed.remote') }],
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
      >
        <AiRoleSection
          id={anchor('aiRole')}
          label={sectionLabel('aiRole')}
          texts={{ title: t('aiRoleTitle'), lead: t('aiRoleLead'), cards: t.raw('aiRoleCards') as AiRoleCard[] }}
          whoLabel={L.who}
        />

        <ProblemSection
          id={anchor('problem')}
          label={sectionLabel('problem')}
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

        <AudienceSection
          id={anchor('audience')}
          label={sectionLabel('audience')}
          texts={{
            title: t('audienceTitle'),
            lead: t('audienceLead'),
            industries: t.raw('audienceIndustries') as string[],
            rest: t('audienceRest'),
            text: t('audienceText'),
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
          <PricingSection
            id={anchor('pricing')}
            label={sectionLabel('pricing')}
            locale={locale}
            ctaHref={CONTACT_PATH[locale]}
            texts={pricing.texts}
            cards={pricing.cards}
          />
        ) : null}

        <AboutSection
          id={anchor('about')}
          label={sectionLabel('about')}
          portrait={about.portrait}
          postHref={about.post ? `/${about.post.category}/${about.post.slug}` : null}
          texts={{
            eyebrow: t('aboutEyebrow'),
            title: t('aboutTitle'),
            paragraphs: t.raw('aboutParagraphs') as string[],
            strike: t('aboutStrike'),
            facts: t('aboutFacts'),
            link: t('aboutLink'),
            portraitAlt: personName,
          }}
        />

        <FaqSection id={anchor('faq')} label={sectionLabel('faq')} title={t('faqTitle')} items={faq} />
        {/* FAQPage z tych samych danych co widok */}
        <FaqJsonLd faq={faq} />

        <FromBlogSection
          id={anchor('blog')}
          label={sectionLabel('blog')}
          locale={locale}
          title={t('blogTitle')}
          lead={t('blogLead')}
          cta={t('blogCta')}
          ctaHref={BLOG_PATH}
          posts={recentPosts}
        />

        <TalkSection
          id={anchor('cta')}
          label={sectionLabel('cta')}
          title={t('ctaTitle')}
          text={t('ctaText')}
          button={t('ctaButton')}
          href={CONTACT_PATH[locale]}
          email={PUBLIC_CONTACT_EMAIL}
        />
      </HomeSignal>
    </>
  )
}
