// lib/legal.ts
//
// ⚠️ TREŚĆ ROBOCZA — WYMAGA WERYFIKACJI PRAWNEJ PRZED PUBLIKACJĄ PRODUKCYJNĄ (brief, pkt 8).
// Dane administratora i miejsca oznaczone [DO UZUPEŁNIENIA] / [ZWERYFIKUJ] uzupełnia właściciel strony.
//
// Polityka prywatności i polityka cookies (PL/EN). Struktura według briefu (8.1, 8.2); lista cookies według
// audytu z 24.11.2026 (kod + przeglądarka): NEXT_LOCALE (next-intl) — motyw jest stały (ciemny), next-themes nic nie zapisuje (sprawdzone 25.11),
// neoneon_translation_path (sessionStorage), cookies Studio Sanity i trybu podglądu (tylko redaktorzy),
// Cloudflare Turnstile w formularzu komentarzy, Vercel Web Analytics i Speed Insights (bez cookies).
// Przy zmianie integracji (np. włączenie Umami) zaktualizuj tę treść i datę.

import type { Locale } from '@/lib/locales'
import { PUBLIC_CONTACT_EMAIL } from '@/lib/site'

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; head: string[]; rows: string[][] }

export interface LegalSection {
  title: string
  blocks: LegalBlock[]
}

export interface LegalDoc {
  title: string
  description: string
  updated: string // tekst „Ostatnia aktualizacja: …”
  sections: LegalSection[]
}

export type LegalKey = 'privacy' | 'cookies'

// Adresy stron (bez prefiksu języka) — trasy w app/[locale]/(blog)/{slug}/page.tsx
export const LEGAL_PATHS: Record<LegalKey, Record<Locale, string>> = {
  privacy: { pl: '/polityka-prywatnosci', en: '/privacy-policy' },
  cookies: { pl: '/polityka-cookies', en: '/cookie-policy' },
}

const EMAIL = PUBLIC_CONTACT_EMAIL

const PRIVACY: Record<Locale, LegalDoc> = {
  pl: {
    title: 'Polityka prywatności',
    description: 'Jakie dane zbiera neoneon.online, w jakim celu, komu je przekazuję i jakie masz prawa.',
    updated: 'Ostatnia aktualizacja: 24 listopada 2026 r.',
    sections: [
      {
        title: '1. Administrator',
        blocks: [
          { type: 'p', text: `Administratorem Twoich danych jest [DO UZUPEŁNIENIA: imię i nazwisko albo nazwa firmy, adres, NIP]. W sprawach danych osobowych napisz na ${EMAIL}.` },
        ],
      },
      {
        title: '2. Jakie dane zbieram',
        blocks: [
          { type: 'list', items: [
            'Dane z formularza kontaktowego: imię i nazwisko, adres e-mail, nazwa firmy lub adres strony (jeśli je podasz), odpowiedzi z pól wyboru (czego potrzebujesz, kiedy chcesz zacząć, orientacyjny budżet) i treść wiadomości.',
            'Dane z formularza komentarzy pod artykułami: imię, adres e-mail i treść komentarza. Imię i komentarz są widoczne publicznie po zatwierdzeniu, adres e-mail nie.',
            'Dane techniczne w logach serwera: adres IP, rodzaj przeglądarki, adres odwiedzonej strony i czas wizyty.',
            'Zbiorcze statystyki odwiedzin (Vercel Web Analytics): odwiedzona podstrona, źródło wejścia, przybliżona lokalizacja (kraj, region, miasto), system operacyjny, przeglądarka i rodzaj urządzenia. Odwiedzającego rozpoznaje tylko skrót (hash) tworzony z żądania, usuwany po 24 godzinach; dane nie są powiązane z Tobą ani z Twoim adresem IP.',
            'Zbiorcze pomiary szybkości ładowania strony (Vercel Speed Insights). Nie identyfikują Cię i nie używają cookies.',
          ] },
        ],
      },
      {
        title: '3. Cel i podstawa prawna',
        blocks: [
          { type: 'list', items: [
            'Odpowiedź na wiadomość i przygotowanie oferty: art. 6 ust. 1 lit. b RODO (działania przed zawarciem umowy na Twoje żądanie) oraz art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes: odpowiedź na korespondencję).',
            'Publikacja i moderacja komentarzy: art. 6 ust. 1 lit. f RODO (prawnie uzasadniony interes: prowadzenie dyskusji pod artykułami). [ZWERYFIKUJ]',
            'Bezpieczeństwo strony, ochrona przed spamem, statystyki odwiedzin i wydajności: art. 6 ust. 1 lit. f RODO.',
          ] },
        ],
      },
      {
        title: '4. Komu przekazuję dane',
        blocks: [
          { type: 'p', text: 'Dane przetwarzają w moim imieniu dostawcy usług, z których korzysta strona:' },
          { type: 'list', items: [
            'Vercel Inc. (USA): hosting strony, logi serwera, Vercel Web Analytics i Vercel Speed Insights.',
            'Sanity AS (Norwegia): system zarządzania treścią, w którym zapisywane są wiadomości z formularza i komentarze. [ZWERYFIKUJ: lokalizacja serwerów projektu]',
            'Resend (USA): wysyłka powiadomień e-mail z formularzy. [ZWERYFIKUJ: pełna nazwa i adres dostawcy]',
            'Cloudflare, Inc. (USA): Turnstile, ochrona formularza komentarzy przed spamem.',
          ] },
          { type: 'p', text: 'Część tych firm ma siedzibę albo serwery poza Europejskim Obszarem Gospodarczym. Dane trafiają tam na podstawie decyzji Komisji Europejskiej w sprawie ram ochrony danych UE–USA (EU-US Data Privacy Framework) albo standardowych klauzul umownych zatwierdzonych przez Komisję. [ZWERYFIKUJ: podstawa dla każdego dostawcy]' },
        ],
      },
      {
        title: '5. Jak długo przechowuję dane',
        blocks: [
          { type: 'list', items: [
            'Korespondencję: 12 miesięcy od ostatniego kontaktu. Jeśli podejmiemy współpracę, przez czas trwania umowy i okres wynikający z przepisów podatkowych.',
            'Komentarze: do czasu ich usunięcia przez Ciebie albo przeze mnie. [ZWERYFIKUJ]',
            'Logi serwera: przez okres przechowywania ustalony przez Vercel. [ZWERYFIKUJ]',
          ] },
        ],
      },
      {
        title: '6. Twoje prawa',
        blocks: [
          { type: 'p', text: `Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania i przeniesienia oraz prawo sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie. Napisz na ${EMAIL}. Możesz też złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).` },
        ],
      },
      {
        title: '7. Dobrowolność',
        blocks: [{ type: 'p', text: 'Podanie danych jest dobrowolne, ale bez adresu e-mail nie mogę odpowiedzieć na wiadomość.' }],
      },
      {
        title: '8. Profilowanie',
        blocks: [{ type: 'p', text: 'Nie profiluję Cię i nie podejmuję wobec Ciebie decyzji w sposób zautomatyzowany.' }],
      },
      {
        title: '9. Zmiany polityki',
        blocks: [{ type: 'p', text: 'Jeśli zmienię zasady przetwarzania danych, zaktualizuję tę stronę i datę na górze.' }],
      },
    ],
  },
  en: {
    title: 'Privacy policy',
    description: 'What data neoneon.online collects, why, who I share it with and what your rights are.',
    updated: 'Last updated: 24 November 2026',
    sections: [
      {
        title: '1. Controller',
        blocks: [
          { type: 'p', text: `The controller of your data is [TO BE COMPLETED: full name or company name, address, tax ID]. For anything related to your personal data, write to ${EMAIL}.` },
        ],
      },
      {
        title: '2. What data I collect',
        blocks: [
          { type: 'list', items: [
            'Contact form data: full name, email address, company name or website (if you provide them), your answers in the choice fields (what you need, when you want to start, approximate budget) and your message.',
            'Comment form data under articles: name, email address and comment. Your name and comment become public once approved; your email address does not.',
            'Technical data in server logs: IP address, browser type, the page you visited and the time of the visit.',
            'Aggregated visit statistics (Vercel Web Analytics): the page visited, referrer, approximate location (country, region, city), operating system, browser and device type. A visitor is recognised only by a hash created from the request, discarded after 24 hours; the data is not tied to you or your IP address.',
            'Aggregated page speed measurements (Vercel Speed Insights). They do not identify you and do not use cookies.',
          ] },
        ],
      },
      {
        title: '3. Purpose and legal basis',
        blocks: [
          { type: 'list', items: [
            'Replying to your message and preparing a quote: Article 6(1)(b) GDPR (steps taken at your request before entering into a contract) and Article 6(1)(f) GDPR (legitimate interest: replying to correspondence).',
            'Publishing and moderating comments: Article 6(1)(f) GDPR (legitimate interest: hosting discussion under articles). [TO BE VERIFIED]',
            'Website security, spam protection, visit and performance statistics: Article 6(1)(f) GDPR.',
          ] },
        ],
      },
      {
        title: '4. Who I share data with',
        blocks: [
          { type: 'p', text: 'Your data is processed on my behalf by the service providers the website uses:' },
          { type: 'list', items: [
            'Vercel Inc. (USA): website hosting, server logs, Vercel Web Analytics and Vercel Speed Insights.',
            'Sanity AS (Norway): the content management system where form messages and comments are stored. [TO BE VERIFIED: project server location]',
            'Resend (USA): email notifications from the forms. [TO BE VERIFIED: provider legal name and address]',
            'Cloudflare, Inc. (USA): Turnstile, spam protection for the comment form.',
          ] },
          { type: 'p', text: 'Some of these companies are based or keep servers outside the European Economic Area. Data is transferred there on the basis of the European Commission decision on the EU-US Data Privacy Framework or standard contractual clauses approved by the Commission. [TO BE VERIFIED: basis for each provider]' },
        ],
      },
      {
        title: '5. How long I keep data',
        blocks: [
          { type: 'list', items: [
            'Correspondence: 12 months from our last contact. If we start working together, for the duration of the contract and the period required by tax law.',
            'Comments: until you or I delete them. [TO BE VERIFIED]',
            'Server logs: for the retention period set by Vercel. [TO BE VERIFIED]',
          ] },
        ],
      },
      {
        title: '6. Your rights',
        blocks: [
          { type: 'p', text: `You have the right to access, rectify and erase your data, to restrict its processing, to data portability and to object to processing based on legitimate interest. Write to ${EMAIL}. You can also lodge a complaint with a supervisory authority; in Poland this is the President of the Personal Data Protection Office (UODO, ul. Stawki 2, 00-193 Warsaw).` },
        ],
      },
      {
        title: '7. Providing data is voluntary',
        blocks: [{ type: 'p', text: 'Providing your data is voluntary, but without an email address I cannot reply to your message.' }],
      },
      {
        title: '8. Profiling',
        blocks: [{ type: 'p', text: 'I do not profile you or make automated decisions about you.' }],
      },
      {
        title: '9. Changes to this policy',
        blocks: [{ type: 'p', text: 'If I change how I process data, I will update this page and the date at the top.' }],
      },
    ],
  },
}

const COOKIES: Record<Locale, LegalDoc> = {
  pl: {
    title: 'Polityka cookies',
    description: 'Jakie cookies i podobne technologie stosuje neoneon.online i jak nimi zarządzać.',
    updated: 'Ostatnia aktualizacja: 24 listopada 2026 r.',
    sections: [
      {
        title: '1. Czym są cookies i podobne technologie',
        blocks: [
          { type: 'p', text: 'Cookies to małe pliki tekstowe, które strona zapisuje w Twojej przeglądarce. Podobnie działają localStorage i sessionStorage: to miejsce w przeglądarce, w którym strona może zapamiętać ustawienia. Te dane nie trafiają same z siebie na serwer.' },
        ],
      },
      {
        title: '2. Czego używa ta strona',
        blocks: [
          { type: 'table', head: ['Nazwa', 'Rodzaj', 'Jak długo', 'Po co'], rows: [
            ['NEXT_LOCALE', 'cookie', 'do zamknięcia przeglądarki', 'zapamiętuje wybrany język strony'],
            ['neoneon_translation_path', 'sessionStorage', 'do zamknięcia karty', 'pozwala przełączyć język na tej samej stronie'],
          ] },
          { type: 'p', text: 'Osoby zalogowane do panelu redakcyjnego (Sanity Studio) dostają dodatkowo cookies logowania i podglądu szkiców. Nie dotyczy to czytelników strony.' },
          { type: 'p', text: 'Formularz komentarzy pod artykułami chroni przed spamem Cloudflare Turnstile. Działa w osobnej ramce dostawcy i nie zapisuje cookies w domenie neoneon.online. [ZWERYFIKUJ: dane przetwarzane przez Cloudflare]' },
        ],
      },
      {
        title: '3. Analityka',
        blocks: [
          { type: 'p', text: 'Odwiedziny liczy Vercel Web Analytics, a szybkość ładowania mierzy Vercel Speed Insights. Oba narzędzia działają bez cookies i bez zapisów w przeglądarce, a dane są zbiorcze: nie identyfikują odwiedzających i nie śledzą ich między stronami. Strona nie używa cookies analitycznych ani marketingowych.' },
        ],
      },
      {
        title: '4. Podstawa prawna',
        blocks: [
          { type: 'p', text: 'Opisane wyżej cookies i zapisy w przeglądarce są niezbędne do działania funkcji, o które prosisz (język), więc nie wymagają zgody. Dlatego strona nie wyświetla bannera cookies. Jeśli dodam cookies analityczne albo marketingowe, poproszę o zgodę w bannerze z dwoma równorzędnymi przyciskami: „Akceptuję” i „Odrzucam”.' },
        ],
      },
      {
        title: '5. Jak zarządzać cookies',
        blocks: [
          { type: 'p', text: 'Cookies i dane stron możesz w każdej chwili usunąć albo zablokować w ustawieniach przeglądarki (zwykle w sekcji „Prywatność” albo „Dane witryn”). Po zablokowaniu strona nie zapamięta wybranego języka.' },
        ],
      },
      {
        title: '6. Aktualizacja',
        blocks: [{ type: 'p', text: 'Ta polityka opisuje stan z dnia podanego na górze strony. Gdy zmienię narzędzia na stronie, zaktualizuję listę i datę.' }],
      },
    ],
  },
  en: {
    title: 'Cookie policy',
    description: 'Which cookies and similar technologies neoneon.online uses and how to manage them.',
    updated: 'Last updated: 24 November 2026',
    sections: [
      {
        title: '1. What cookies and similar technologies are',
        blocks: [
          { type: 'p', text: 'Cookies are small text files a website stores in your browser. localStorage and sessionStorage work in a similar way: they are places in your browser where a website can remember settings. This data is not sent to the server on its own.' },
        ],
      },
      {
        title: '2. What this website uses',
        blocks: [
          { type: 'table', head: ['Name', 'Type', 'How long', 'Purpose'], rows: [
            ['NEXT_LOCALE', 'cookie', 'until you close the browser', 'remembers the language you chose'],
            ['neoneon_translation_path', 'sessionStorage', 'until you close the tab', 'lets you switch language on the same page'],
          ] },
          { type: 'p', text: 'People logged in to the editorial panel (Sanity Studio) also get login and draft preview cookies. This does not apply to readers.' },
          { type: 'p', text: 'The comment form under articles is protected from spam by Cloudflare Turnstile. It runs in a separate provider frame and does not store cookies on the neoneon.online domain. [TO BE VERIFIED: data processed by Cloudflare]' },
        ],
      },
      {
        title: '3. Analytics',
        blocks: [
          { type: 'p', text: 'Visits are counted by Vercel Web Analytics and page loading speed is measured by Vercel Speed Insights. Both work without cookies or browser storage, and the data is aggregated: it does not identify visitors or track them across websites. The website uses no analytics or marketing cookies.' },
        ],
      },
      {
        title: '4. Legal basis',
        blocks: [
          { type: 'p', text: 'The cookies and browser storage described above are needed for features you ask for (language), so they do not require consent. That is why the website shows no cookie banner. If I add analytics or marketing cookies, I will ask for consent in a banner with two equal buttons: "Accept" and "Reject".' },
        ],
      },
      {
        title: '5. How to manage cookies',
        blocks: [
          { type: 'p', text: 'You can delete or block cookies and site data at any time in your browser settings (usually under "Privacy" or "Site data"). If you block them, the website will not remember your language.' },
        ],
      },
      {
        title: '6. Updates',
        blocks: [{ type: 'p', text: 'This policy describes the state on the date shown at the top. When I change the tools on the website, I will update the list and the date.' }],
      },
    ],
  },
}

export function getLegalDoc(key: LegalKey, locale: Locale): LegalDoc {
  return (key === 'privacy' ? PRIVACY : COOKIES)[locale]
}
