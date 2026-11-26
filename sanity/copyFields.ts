// sanity/copyFields.ts
// Jedyna definicja copy strony edytowanego w Studio. Z niej powstają:
// - schematy dokumentów „Strona główna — teksty” (homeCopy) i „Teksty interfejsu” (uiStrings),
// - typy wiadomości next-intl (types/messages.d.ts, scripts/gen-copy-types.ts),
// - mapa kluczy dla skryptu wypełniającego (scripts/seed-site-copy.ts).
// Strona nie ma tekstów zapasowych w kodzie: każde pole bez `optional` jest wymagane.
// Importowany przez sanity.config.ts i skrypty Node — bez aliasu „@/” i zależności od Next.

export type CopyField = {
  key: string
  title: string
  description?: string
  optional?: boolean
  readOnly?: boolean
} & (
  | { type?: 'string' | 'text' }
  | { type: 'strings'; count?: number }
  | { type: 'list'; of: CopyField[]; count?: number; previewKey?: string }
  | { type: 'object'; fields: CopyField[] }
)

export interface CopyGroup {
  name: string
  title: string
  description?: string
  fields: CopyField[]
}

const s = (key: string, title: string, description?: string): CopyField => ({ key, title, description })
const tx = (key: string, title: string, description?: string): CopyField => ({ key, title, description, type: 'text' })

// ── Strona główna (dokument homeCopy, namespace `onePager`) ───────────────────
// Pola leżą płasko w dokumencie; `name` grupy = zakładka w Studio.
export const HOME_GROUPS: CopyGroup[] = [
  {
    name: 'seo',
    title: 'SEO i dane strukturalne',
    fields: [
      s('heroTitle', 'Tytuł strony w Google (title)', 'Tytuł karty przeglądarki i wyników wyszukiwania. Opisem (description) jest lead hero.'),
      s('personName', 'Imię i nazwisko (JSON-LD Person)', 'Dane dla wyszukiwarek, niewidoczne na stronie.'),
      s('personJobTitle', 'Stanowisko (JSON-LD Person)', 'Dane dla wyszukiwarek, niewidoczne na stronie.'),
      {
        key: 'areaServed',
        title: 'Obszar działania (JSON-LD Service)',
        description: 'Dane dla wyszukiwarek, niewidoczne na stronie.',
        type: 'object',
        fields: [s('country', 'Kraj'), s('remote', 'Praca zdalna')],
      },
      s('aboutPostSlug', 'Slug artykułu „Jak zbudowałem tę stronę”', 'Artykuł, do którego prowadzi link w sekcji „O mnie”.'),
    ],
  },
  {
    name: 'wheel',
    title: 'Koło i mapa',
    description: 'Krótkie nazwy sekcji na obręczy koła i w mapie strony.',
    fields: [
      {
        key: 'wheel',
        title: 'Etykiety koła',
        type: 'object',
        fields: [
          {
            key: 'sections',
            title: 'Nazwy sekcji',
            type: 'object',
            fields: [
              s('hero', 'Start (hero)'),
              s('aiRole', 'Rola AI'),
              s('problem', 'Pusta strona'),
              s('audience', 'Dla kogo'),
              s('services', 'Usługi'),
              s('process', 'Proces'),
              s('pricing', 'Wyceny'),
              s('about', 'O mnie'),
              s('faq', 'FAQ'),
              s('blog', 'Z bloga'),
              s('cta', 'Rozmowa'),
            ],
          },
          {
            key: 'group',
            title: 'Pozycje łączące kilka sekcji',
            type: 'object',
            fields: [s('audience', 'Dla kogo (problem + odbiorcy)'), s('talk', 'Rozmowa (FAQ + kontakt)')],
          },
          s('stage', 'Podpis „Etap” (proces)'),
          s('who', 'Podpis „Kto” (karty roli AI)'),
        ],
      },
    ],
  },
  {
    name: 'hero',
    title: 'Hero',
    fields: [
      { key: 'heroHeadline', title: 'Nagłówek H1 (dwie linie)', description: 'Druga linia jest wyróżniona kolorem.', type: 'strings', count: 2 },
      s('heroEyebrow', 'Nadtytuł'),
      s('heroSubtitle', 'Podtytuł'),
      tx('heroLead', 'Lead', 'Także opis strony w Google (meta description) i opis w danych strukturalnych.'),
      s('heroCtaPrimary', 'Przycisk główny'),
      s('heroCtaSecondary', 'Przycisk drugi'),
      s('heroPrompt', 'Okno promptu — polecenie'),
      s('heroLastLine', 'Okno promptu — ostatnia linia'),
    ],
  },
  {
    name: 'aiRole',
    title: 'Rola AI',
    fields: [
      s('aiRoleTitle', 'Nagłówek', 'Pierwsze zdanie białe, reszta limonką.'),
      tx('aiRoleLead', 'Lead'),
      {
        key: 'aiRoleCards',
        title: 'Etapy (karty)',
        type: 'list',
        previewKey: 'title',
        of: [s('title', 'Nazwa etapu'), tx('text', 'Opis'), s('who', 'Kto')],
      },
    ],
  },
  {
    name: 'problem',
    title: 'Pusta strona',
    fields: [
      s('problemTitle', 'Nagłówek'),
      tx('problemLead', 'Lead'),
      tx('problemBefore', 'Tekst „przed” (skreślany)'),
      s('problemNote', 'Uwaga redaktora na marginesie'),
      { key: 'problemAfter', title: 'Teksty „po” (zmieniają się po kolei)', type: 'strings' },
      s('problemCaption', 'Podpis pod przykładami'),
      { key: 'problemGaps', title: 'Luki', type: 'list', previewKey: 'title', of: [s('title', 'Nazwa'), tx('text', 'Opis')] },
      tx('problemClosing', 'Zdanie zamykające'),
      s('problemCta', 'Przycisk'),
    ],
  },
  {
    name: 'audience',
    title: 'Dla kogo',
    fields: [
      s('audienceTitle', 'Nagłówek'),
      s('audienceLead', 'Początek zdania (przed branżami)'),
      { key: 'audienceIndustries', title: 'Branże (zmieniają się po kolei)', type: 'strings' },
      s('audienceRest', 'Dalsza część zdania'),
      tx('audienceText', 'Akapit'),
    ],
  },
  {
    name: 'services',
    title: 'Usługi',
    fields: [
      s('servicesTitle', 'Nagłówek'),
      {
        key: 'servicesItems',
        title: 'Usługi',
        description: 'Kolejność i liczba usług są stałe: klucz łączy usługę z formularzem kontaktowym (?usluga=).',
        type: 'list',
        count: 3,
        previewKey: 'title',
        of: [
          { key: 'key', title: 'Klucz (techniczny)', readOnly: true },
          s('title', 'Nazwa'),
          { key: 'tags', title: 'Tagi', type: 'strings' },
          tx('text', 'Opis'),
          { key: 'points', title: 'Punkty', type: 'strings' },
          s('cta', 'Przycisk'),
        ],
      },
    ],
  },
  {
    name: 'process',
    title: 'Proces',
    fields: [
      s('processTitle', 'Nagłówek'),
      tx('processLead', 'Lead'),
      { key: 'processSteps', title: 'Etapy', type: 'list', previewKey: 'title', of: [s('title', 'Nazwa'), tx('text', 'Opis')] },
    ],
  },
  {
    name: 'pricing',
    title: 'Wyceny',
    description: 'Kwoty, stawki i przykłady są w „Stawki godzinowe”, „Przykładowe wyceny” i „Ustawienia wycen”.',
    fields: [
      s('pricingTitle', 'Nagłówek'),
      tx('pricingLead', 'Lead'),
      s('pricingRatesLabel', 'Etykieta stawek'),
      s('pricingRateUnit', 'Jednostka stawki', '{currency} zostanie zastąpione walutą, np. „{currency}/h”.'),
      s('pricingCurrencyPLN', 'Nazwa waluty PLN'),
      s('pricingCurrencyEUR', 'Nazwa waluty EUR'),
      s('pricingTotal', 'Kwota przykładu', '{min}, {max} i {currency} zostaną zastąpione liczbami i walutą.'),
      s('pricingHours', 'Liczba godzin', '{min} i {max} zostaną zastąpione liczbami.'),
      tx('pricingNote', 'Uwaga pod przykładami', 'Używana, gdy „Ustawienia wycen” nie mają własnej uwagi.'),
      s('pricingCta', 'Przycisk'),
      s('pricingDevEmpty', 'Komunikat dla dewelopera (brak przykładów)', 'Widoczny tylko lokalnie w trybie dev.'),
    ],
  },
  {
    name: 'about',
    title: 'O mnie',
    fields: [
      s('aboutEyebrow', 'Nadtytuł'),
      s('aboutTitle', 'Nagłówek'),
      { key: 'aboutParagraphs', title: 'Akapity', description: 'Pierwszy akapit jest wyróżniony.', type: 'strings' },
      s('aboutStrike', 'Fragment do skreślenia', 'Musi dokładnie występować w jednym z akapitów.'),
      s('aboutFacts', 'Fakty pod tekstem', 'Rozdzielone „ · ”.'),
      s('aboutLink', 'Link do artykułu'),
    ],
  },
  {
    name: 'faq',
    title: 'FAQ',
    description: 'Pytania i odpowiedzi są w „FAQ PL/EN”.',
    fields: [s('faqTitle', 'Nagłówek')],
  },
  {
    name: 'blog',
    title: 'Z bloga',
    fields: [s('blogTitle', 'Nagłówek'), s('blogLead', 'Lead'), s('blogCta', 'Przycisk')],
  },
  {
    name: 'cta',
    title: 'Rozmowa',
    fields: [s('ctaTitle', 'Nagłówek (pisany na oczach)'), tx('ctaText', 'Tekst'), s('ctaButton', 'Przycisk')],
  },
]

// ── Teksty interfejsu (dokument uiStrings: jedno pole-obiekt na namespace) ────
export const UI_GROUPS: CopyGroup[] = [
  {
    name: 'chrome',
    title: 'Koło, pasek i stopka',
    fields: [
      s('brand', 'Napis marki', 'Duży napis w hero i logo w mapie strony (dekoracja, niewidoczna dla czytników ekranu).'),
      s('start', 'Pozycja „Start” w kole', 'Dodawana na początku koła na podstronach.'),
      {
        key: 'bar',
        title: 'Pasek u góry i drobne teksty',
        type: 'object',
        fields: [
          s('search', 'Wyszukiwarka — etykieta'),
          s('searchPlaceholder', 'Wyszukiwarka — podpowiedź w polu'),
          s('cta', 'Przycisk rozmowy'),
          s('language', 'Przełącznik języka — nazwa dla czytników ekranu'),
          s('contents', 'Podpis przy kole w rogu'),
          s('fromBlog', 'Mapa — nagłówek bloga', 'Też nazwa pozycji „Blog” w kole, gdy nie ma jej w menu.'),
          s('allArticles', 'Mapa — link do wszystkich artykułów'),
        ],
      },
      {
        key: 'dial',
        title: 'Koło',
        type: 'object',
        fields: [
          s('nav', 'Nazwa nawigacji (czytniki ekranu)'),
          s('open', 'Przycisk otwierający mapę (czytniki ekranu)'),
          s('now', 'Słowo „Teraz” (czytniki ekranu)'),
          s('core', 'Środek koła — napis nad liczbą'),
          s('coreSub', 'Środek koła — pierwsza linia pod liczbą'),
          s('coreSubStrong', 'Środek koła — druga linia (wyróżniona)'),
        ],
      },
      {
        key: 'map',
        title: 'Mapa strony (koło otwarte)',
        type: 'object',
        fields: [
          s('dialog', 'Nazwa okna (czytniki ekranu)'),
          s('list', 'Przycisk widoku listy'),
          s('wheel', 'Przycisk widoku koła'),
          s('close', 'Przycisk zamknięcia'),
          s('here', 'Napis „Tu jesteś”'),
          s('talk', 'Nagłówek kolumny rozmowy'),
          s('talkCta', 'Przycisk rozmowy'),
          s('keys', 'Podpowiedź klawiszy'),
        ],
      },
      {
        key: 'footer',
        title: 'Stopka',
        type: 'object',
        fields: [
          s('claim', 'Hasło — pierwsza część'),
          s('claimAccent', 'Hasło — część wyróżniona'),
          s('nav', 'Nagłówek kolumny linków'),
          s('talk', 'Nagłówek kolumny rozmowy'),
          s('legal', 'Nagłówek kolumny polityk'),
        ],
      },
      {
        key: 'draft',
        title: 'Baner podglądu szkiców (tylko redaktor)',
        type: 'object',
        fields: [s('label', 'Napis'), s('exit', 'Link wyłączający podgląd')],
      },
    ],
  },
  {
    name: 'a11y',
    title: 'Dostępność',
    description: 'Niewidoczne na stronie — odczytują je czytniki ekranu.',
    fields: [
      s('skipToContent', 'Link „przejdź do treści”'),
      s('footerNav', 'Nawigacja w stopce'),
      s('languagePl', 'Nazwa języka polskiego', 'Czytana po skrócie: „PL, Polski”.'),
      s('languageEn', 'Nazwa języka angielskiego', 'Czytana po skrócie: „EN, English”.'),
    ],
  },
  {
    name: 'articleCta',
    title: 'Zachęta pod artykułem',
    fields: [
      s('label', 'Etykieta'),
      { key: 'ai', title: 'Artykuły o stronach z AI', type: 'object', fields: [s('title', 'Nagłówek'), tx('text', 'Tekst'), s('button', 'Przycisk')] },
      { key: 'content', title: 'Artykuły o treściach', type: 'object', fields: [s('title', 'Nagłówek'), tx('text', 'Tekst'), s('button', 'Przycisk')] },
      s('email', 'Tekst przed adresem e-mail'),
    ],
  },
  {
    name: 'article',
    title: 'Artykuł',
    fields: [
      s('faqHeading', 'Nagłówek sekcji FAQ', 'Nad pytaniami z pola „FAQ” na końcu artykułu.'),
      s('readingTime', 'Czas czytania', '{minutes} zostanie zastąpione liczbą minut.'),
    ],
  },
  {
    name: 'category',
    title: 'Strony kategorii',
    fields: [s('label', 'Etykieta nad nagłówkiem'), s('filterByTag', 'Nagłówek filtra tagów'), s('noArticles', 'Brak artykułów w kategorii')],
  },
  {
    name: 'search',
    title: 'Wyszukiwarka',
    fields: [
      s('heading', 'Nagłówek strony'),
      s('placeholder', 'Podpowiedź w polu wyszukiwania'),
      s('button', 'Przycisk „Szukaj”'),
      s('filterByTag', 'Nagłówek filtra tagów'),
      s('noResults', 'Brak wyników'),
      s('result', 'Słowo „wynik” (1 wynik)'),
      s('results', 'Słowo „wyniki” (wiele wyników)'),
      s('tryDifferent', 'Podpowiedź przy braku wyników'),
      s('enterTerm', 'Podpowiedź przed wyszukiwaniem'),
      s('taggedWith', 'Opis filtra tagu', '{tag} zostanie zastąpione nazwą tagu.'),
    ],
  },
  {
    name: 'contactForm',
    title: 'Formularz kontaktowy',
    fields: [
      tx('lead', 'Tekst nad formularzem'),
      s('name', 'Pole: imię i nazwisko'),
      s('email', 'Pole: e-mail'),
      s('company', 'Pole: firma lub strona'),
      s('needsLegend', 'Pytanie: czego potrzebujesz'),
      {
        key: 'needs',
        title: 'Odpowiedzi: czego potrzebujesz',
        type: 'object',
        fields: [s('copy', 'Tekst na stronę'), s('website', 'Strona'), s('content', 'Treści i blog'), s('audit', 'Audyt widoczności w AI'), s('unsure', 'Jeszcze nie wiem')],
      },
      s('start', 'Pytanie: kiedy zacząć'),
      {
        key: 'startOptions',
        title: 'Odpowiedzi: kiedy zacząć',
        type: 'object',
        fields: [s('asap', 'Jak najszybciej'), s('month', 'W ciągu miesiąca'), s('quarter', 'Za 2–3 miesiące'), s('unsure', 'Nie wiem')],
      },
      s('budget', 'Pytanie: budżet'),
      {
        key: 'budgetOptions',
        title: 'Odpowiedzi: budżet',
        type: 'object',
        fields: [s('upTo3k', 'Najniższy przedział'), s('from3to8k', 'Drugi przedział'), s('from8to15k', 'Trzeci przedział'), s('over15k', 'Najwyższy przedział'), s('unsure', 'Nie wiem')],
      },
      s('message', 'Pole: wiadomość'),
      s('privacyBefore', 'Zgoda — tekst przed linkiem'),
      s('privacyLink', 'Zgoda — tekst linku do polityki'),
      { key: 'privacyAfter', title: 'Zgoda — tekst po linku', optional: true },
      s('submit', 'Przycisk wysyłki'),
      s('sending', 'Przycisk w trakcie wysyłki'),
      s('success', 'Komunikat po wysłaniu', '{email} zostanie zastąpione adresem nadawcy.'),
      s('serverError', 'Błąd wysyłki', '{email} zostanie zastąpione adresem kontaktowym.'),
      {
        key: 'errors',
        title: 'Błędy walidacji',
        type: 'object',
        fields: [s('name', 'Imię'), s('email', 'E-mail'), s('needs', 'Czego potrzebujesz'), s('message', 'Wiadomość'), s('privacy', 'Zgoda')],
      },
      s('preferEmail', 'Nagłówek „Wolisz e-mail?”'),
      s('preferPhone', 'Nagłówek „Wolisz zadzwonić?”'),
    ],
  },
  {
    name: 'notFound',
    title: 'Strona 404',
    fields: [s('eyebrow', 'Nadtytuł'), s('title', 'Nagłówek'), tx('lead', 'Tekst'), s('blog', 'Link do bloga'), s('search', 'Link do wyszukiwarki'), s('home', 'Link do strony głównej')],
  },
  {
    name: 'comments',
    title: 'Komentarze',
    description: 'Komentarze są obecnie wyłączone (lib/site.ts) — teksty czekają na włączenie.',
    fields: [
      s('sectionZero', 'Nagłówek sekcji — brak komentarzy'),
      s('sectionOne', 'Nagłówek sekcji — 1 komentarz'),
      s('sectionMany', 'Nagłówek sekcji — wiele komentarzy', '{count} zostanie zastąpione liczbą komentarzy.'),
      s('heading', 'Nagłówek formularza'),
      s('fieldName', 'Pole: imię — etykieta'),
      s('fieldEmail', 'Pole: e-mail — etykieta'),
      s('fieldComment', 'Pole: komentarz — etykieta'),
      s('placeholderName', 'Pole: imię — podpowiedź'),
      s('placeholderEmail', 'Pole: e-mail — podpowiedź'),
      s('placeholderComment', 'Pole: komentarz — podpowiedź'),
      s('submit', 'Przycisk wysyłki'),
      s('submitting', 'Przycisk w trakcie wysyłki'),
      s('error', 'Komunikat błędu'),
      s('captchaError', 'Komunikat odrzucenia (ochrona przed botami)'),
      s('success', 'Komunikat po wysłaniu'),
    ],
  },
  {
    name: 'form',
    title: 'Formularze — wspólne',
    fields: [s('unavailable', 'Formularz niedostępny (brak ochrony przed botami)')],
  },
  {
    name: 'embed',
    title: 'Osadzone media',
    fields: [
      s('viewOnInstagram', 'Link „Zobacz na Instagramie”'),
      s('viewOnX', 'Link „Zobacz na X”'),
      {
        key: 'providers',
        title: 'Nazwy serwisów (tytuł ramki, gdy media nie mają podpisu)',
        type: 'object',
        fields: [
          s('youtube', 'YouTube'),
          s('vimeo', 'Vimeo'),
          s('instagram', 'Instagram'),
          s('tiktok', 'TikTok'),
          s('x', 'X'),
          s('spotify', 'Spotify'),
          s('soundcloud', 'SoundCloud'),
        ],
      },
    ],
  },
]

// Wszystkie klucze pierwszego poziomu strony głównej (pola dokumentu homeCopy)
export const HOME_FIELDS: CopyField[] = HOME_GROUPS.flatMap((g) => g.fields)
