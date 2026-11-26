// Wygenerowane przez scripts/gen-copy-types.ts z sanity/copyFields.ts — nie edytuj ręcznie.
// Kształt copy strony z Sanity („Teksty interfejsu” + „Strona główna — teksty”).

export interface SiteMessages {
  chrome: {
    brand: string
    start: string
    bar: {
      search: string
      searchPlaceholder: string
      cta: string
      language: string
      contents: string
      fromBlog: string
      allArticles: string
    }
    dial: {
      nav: string
      open: string
      now: string
      core: string
      coreSub: string
      coreSubStrong: string
    }
    map: {
      dialog: string
      list: string
      wheel: string
      close: string
      here: string
      talk: string
      talkCta: string
      keys: string
    }
    footer: {
      claim: string
      claimAccent: string
      nav: string
      talk: string
      legal: string
    }
    draft: {
      label: string
      exit: string
    }
  }
  a11y: {
    skipToContent: string
    footerNav: string
    languagePl: string
    languageEn: string
  }
  articleCta: {
    label: string
    ai: {
      title: string
      text: string
      button: string
    }
    content: {
      title: string
      text: string
      button: string
    }
    email: string
  }
  article: {
    faqHeading: string
    readingTime: string
  }
  category: {
    label: string
    filterByTag: string
    noArticles: string
  }
  search: {
    heading: string
    placeholder: string
    button: string
    filterByTag: string
    noResults: string
    result: string
    results: string
    tryDifferent: string
    enterTerm: string
    taggedWith: string
  }
  contactForm: {
    lead: string
    name: string
    email: string
    company: string
    needsLegend: string
    needs: {
      copy: string
      website: string
      content: string
      audit: string
      unsure: string
    }
    start: string
    startOptions: {
      asap: string
      month: string
      quarter: string
      unsure: string
    }
    budget: string
    budgetOptions: {
      upTo3k: string
      from3to8k: string
      from8to15k: string
      over15k: string
      unsure: string
    }
    message: string
    privacyBefore: string
    privacyLink: string
    privacyAfter?: string
    submit: string
    sending: string
    success: string
    serverError: string
    errors: {
      name: string
      email: string
      needs: string
      message: string
      privacy: string
    }
    preferEmail: string
    preferPhone: string
  }
  notFound: {
    eyebrow: string
    title: string
    lead: string
    blog: string
    search: string
    home: string
  }
  comments: {
    sectionZero: string
    sectionOne: string
    sectionMany: string
    heading: string
    fieldName: string
    fieldEmail: string
    fieldComment: string
    placeholderName: string
    placeholderEmail: string
    placeholderComment: string
    submit: string
    submitting: string
    error: string
    captchaError: string
    success: string
  }
  form: {
    unavailable: string
  }
  embed: {
    viewOnInstagram: string
    viewOnX: string
    providers: {
      youtube: string
      vimeo: string
      instagram: string
      tiktok: string
      x: string
      spotify: string
      soundcloud: string
    }
  }
  onePager: {
    heroTitle: string
    personName: string
    personJobTitle: string
    areaServed: {
      country: string
      remote: string
    }
    aboutPostSlug: string
    wheel: {
      sections: {
        hero: string
        aiRole: string
        problem: string
        audience: string
        services: string
        process: string
        pricing: string
        about: string
        faq: string
        blog: string
        cta: string
      }
      group: {
        audience: string
        talk: string
      }
      stage: string
      who: string
    }
    heroHeadline: string[]
    heroEyebrow: string
    heroSubtitle: string
    heroLead: string
    heroCtaPrimary: string
    heroCtaSecondary: string
    heroPrompt: string
    heroLastLine: string
    aiRoleTitle: string
    aiRoleLead: string
    aiRoleCards: Array<{
      title: string
      text: string
      who: string
    }>
    problemTitle: string
    problemLead: string
    problemBefore: string
    problemNote: string
    problemAfter: string[]
    problemCaption: string
    problemGaps: Array<{
      title: string
      text: string
    }>
    problemClosing: string
    problemCta: string
    audienceTitle: string
    audienceLead: string
    audienceIndustries: string[]
    audienceRest: string
    audienceText: string
    servicesTitle: string
    servicesItems: Array<{
      key: string
      title: string
      tags: string[]
      text: string
      points: string[]
      cta: string
    }>
    processTitle: string
    processLead: string
    processSteps: Array<{
      title: string
      text: string
    }>
    pricingTitle: string
    pricingLead: string
    pricingRatesLabel: string
    pricingRateUnit: string
    pricingCurrencyPLN: string
    pricingCurrencyEUR: string
    pricingTotal: string
    pricingHours: string
    pricingNote: string
    pricingCta: string
    pricingDevEmpty: string
    aboutEyebrow: string
    aboutTitle: string
    aboutParagraphs: string[]
    aboutStrike: string
    aboutFacts: string
    aboutLink: string
    faqTitle: string
    blogTitle: string
    blogLead: string
    blogCta: string
    ctaTitle: string
    ctaText: string
    ctaButton: string
  }
}

declare module 'next-intl' {
  interface AppConfig {
    Messages: SiteMessages
  }
}
