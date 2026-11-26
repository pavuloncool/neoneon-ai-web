# neoneon.online — backlog i historia projektu

> Plik dla Claude (i dla właściciela). Cel: mieć w jednym miejscu fakty o projekcie — co powstało, jak, w jakiej
> kolejności, jakie decyzje zapadły i co zostało do zrobienia. Najbliższe użycie: **aktualizacja artykułu
> „Jak zbudowałem tę stronę – nie będąc programistą” / „How I Built This Website — not Being a Developer”**.
> Stan na: 25 listopada 2026 (dzień startu nowej wersji na neoneon.online).

---

## 1. Zasady, których trzeba się trzymać (przy pisaniu i przy kodzie)

1. **Bez danych o dawnym pracodawcy.** Na stronie nie pojawia się nazwa magazynu, w którym pracował autor,
   ani informacja o wykształceniu/pracy tłumacza czy filologa, ani lata 2009–2013. Dotyczy też artykułów.
   Uwaga: obecna wersja artykułu „Jak zbudowałem tę stronę” zawiera zdania „Jestem z wykształcenia tłumaczem…”
   i „…projektu, który będzie rozwijał filolog 🥲” — **do usunięcia przy aktualizacji**.
2. **Głos tekstów: klient w centrum.** Ani agencyjne „my”, ani nachalne „ja robię, ja pomogę”. Tekst mówi o tym,
   co dostaje czytelnik/klient. W artykule blogowym pierwsza osoba jest naturalna (to relacja autora), ale bez
   przechwałek — konkret, decyzje, błędy.
3. **Strona jest dwujęzyczna (PL/EN)** — każdy artykuł ma osobny dokument w każdym języku (tłumaczenia łączy
   wtyczka document-internationalization w Sanity). Aktualizacja artykułu = dwie wersje.
4. **Ruch jest częścią projektu.** Animacje (GSAP) nie są dodatkiem — przy każdej zmianie wyglądu przenosimy je,
   nie wycinamy.
5. **Treści edytuje się w Sanity Studio:** https://neoneon.online/studio (projekt Sanity `yj3w3w1l`, dataset
   `production`). Stary projekt Sanity `n81gbqh8` jest archiwalny — nie dotykać.
6. **W repozytorium:** pliki dodawać do commitu po nazwie; nie commitować `components/blog/ArticleScroll.tsx`,
   `package-lock.json`, `stary.tar.gz`, `guides/` (prywatne, niezatwierdzone zmiany właściciela).

---

## 2. Projekt w skrócie

- **Co to jest:** strona usługowa (one-pager) + blog. Oferta: teksty na strony, strony budowane z AI
  „od decyzji do wdrożenia”, treści i widoczność w wyszukiwarkach/asystentach AI.
- **Adres:** https://neoneon.online (PL: `/pl`, EN: `/en`). Repozytorium: `pavuloncool/neoneon-ai-web`
  (gałąź produkcyjna `main`).
- **Autor/właściciel:** Paweł Kuligowski — nie jest programistą; kod powstaje z AI (Claude Code), decyzje,
  teksty i odbiór każdej iteracji należą do niego.
- **Hosting:** Vercel (projekt `neoneon-ai-web`; poprzednia wersja strony została w osobnym projekcie
  `neoneon` jako zapas na wypadek wycofania).

### Stack (stan na start 25.11.2026)

| Warstwa | Technologia | Po co |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript | strona, trasy, renderowanie po stronie serwera |
| Treści | Sanity 6 (Studio wbudowane pod `/studio`) | artykuły, kategorie, FAQ, wyceny, ustawienia strony, wiadomości z formularza |
| Języki | next-intl 4 | PL/EN, przełącznik języka, adresy w obu językach |
| Ruch | GSAP 3.15 (ScrollTrigger, SplitText, ScrambleText, DrawSVG, Flip) | animacje, przypinane sekcje, koło-nawigacja |
| Style | CSS Modules + Tailwind 3 | wygląd „Sygnał” |
| Kroje | Archivo (zmienny) + IBM Plex Mono, z własnego serwera (OFL) | bez Google Fonts CDN |
| Poczta | Resend (nadawca i odbiorca: web@neoneon.online) | powiadomienia z formularza kontaktowego |
| Analityka | Vercel Web Analytics, Vercel Speed Insights, Umami | bez cookies |
| Walidacja | zod | formularz kontaktowy (te same reguły w przeglądarce i na serwerze) |

---

## 3. Oś czasu

Liczby commitów z historii repozytorium (łącznie 223 na dzień startu).

| Kiedy | Etap | Co się wydarzyło |
|---|---|---|
| 7–9.03.2026 | Pierwsza wersja | Start projektu (Create Next App), blog dwujęzyczny. ~35 commitów w trzy dni. |
| 21–23.03.2026 | Publikacja | Artykuł „Jak zbudowałem tę stronę…” (PL 21.03, EN 22.03). |
| 24.06.2026 | Drobne zmiany | 3 commity. |
| 28.10–3.11.2026 | Rozwój bloga | ~22 commity. |
| 9–12.11.2026 | Porządki techniczne | ~93 commity: aktualizacja zależności, zmienne środowiskowe, jedna lista języków, kategorie jako dokumenty Sanity z przekierowaniami, Speed Insights. Szczegóły: `CHANGELOG.md`. |
| 24.11.2026 | One-pager usługowy | Brief „neoneon-AI-web” v1.0 → iteracje 0–14, każda zamknięta przeglądem właściciela: hero, rola AI, problem, dla kogo, usługi, proces, wyceny z Sanity, O mnie, FAQ (z JSON-LD), Z bloga, CTA, formularz kontaktowy (zod, honeypot, limit), polityki prywatności i cookies, SEO techniczne. Nowy projekt Sanity `yj3w3w1l` (kopia treści ze starego). ~31 commitów. |
| 25.11.2026 | Redesign „Sygnał” + start | Ocena właściciela: wygląd za bardzo generyczny → nowy kierunek wizualny, prototyp, przebudowa całego serwisu, porządek treści, wydajność, start na neoneon.online. ~25 commitów (każdy to większa iteracja). |

---

## 4. Redesign 25.11.2026 — jak powstał „Sygnał” (materiał do artykułu)

### 4.1 Punkt wyjścia
- Właściciel uznał, że strona po iteracjach 0–14 wygląda **generycznie** („beżowe tło i prostokątna siatka”),
  mimo animacji GSAP.
- Materiał wejściowy: dwa artykuły o trendach web designu 2026 i o nawigacji (PDF-y w `guides/`).

### 4.2 Droga przez kierunki (makiety na kanwie, zanim powstał kod)
1. **„Szpalta”** — strona jak korekta prasowa (papier, numeracja paragrafów, znaki korektorskie). Wersja
   spokojna zaakceptowana… i odrzucona po chwili jako wciąż zbyt bezpieczna.
2. **Trzy odważne kierunki:** A „Szyld” (neon na ciemnym tle), B „Multiplayer” (kursory AI i człowieka,
   komentarze, historia wersji), C „Orbita” (strona jako koło, nawigacja-tarcza).
3. **„Orbita”** rozwinięta w pełny zestaw ekranów (koło jako jedyna nawigacja, bez menu) — odrzucona jako
   „zabawka z przedszkola”: za dużo kół, za mało dojrzałości.
4. **„Sygnał”** — ostateczny kierunek: *design feel* przeniesiony z własnej aplikacji właściciela
   (NeonEdge Studio): kosmiczna czerń `#0A0A0B`, neonowa limonka `#CCFF00`, mgła, ciężki grotesk wersalikami,
   etykiety w monospace, przejścia z rozmycia w ostrość. Z „Orbity” zostaje **jedno koło** jako nawigacja.

### 4.3 Kluczowe decyzje
- **Jedno koło zamiast menu.** Na stronie głównej koło startuje duże w hero, przy przewijaniu zjeżdża do
  prawego dolnego rogu; pokazuje postęp czytania i bieżącą sekcję; po kliknięciu otwiera mapę strony
  (lista sekcji, blog, wyszukiwarka, język). W artykule koło pokazuje śródtytuły tekstu.
- **Pływające koło (eksperyment, który został):** na górze strony koło płynie za kursorem i „oświetla”
  napis NEONEON; z pierwszym przewinięciem ucieka do rogu i **zostaje tam** podczas czytania; wraca dopiero,
  gdy użytkownik sam podjedzie do niego kursorem (potwierdzona intencja — inaczej byłoby irytujące).
- **Głos:** nagłówek „Wiesz, co oferujesz. Teraz to sprzedaj.” — tekst o kliencie, nie o autorze.
- **Ścieżka wdrożenia:** prototyp pod ukrytym adresem (`/pl/sygnal`, noindex) → przebudowa bloga z tymi samymi
  adresami (B1–B4) → strona główna (H1–H2) → porządek treści (tor C) → wydajność → start.
- **Wersja odniesienia:** tag git `sygnal-v1` (z pływającym kołem); poprzedni stan: `sygnal-v1-bez-kola`.

### 4.4 Ruch („sygnał wyłania się z szumu”)
- Napisy mono „rozszyfrowują się” (scramble), nagłówki wyjeżdżają linia po linii z rozmycia.
- Sekcje z sekwencją **zatrzymują się na ekranie, aż pojawi się ostatni tekst** (przewijanie steruje animacją):
  rola AI (kreski kart rysowane po kolei), „pusta strona” (ogólnikowe zdanie skreślane limonką na żywo,
  potem konkretne wersje), „dla kogo” (branże zapalają się jak neon), proces (pięć etapów z rozmycia),
  rozmowa (nagłówek pisany litera po literze, migający kursor pchany przez litery).
- Rozwijane listy „+” (usługi, FAQ) otwierają się płynnie; znak obraca się w kółku.
- Przy systemowym „Ogranicz ruch” strona nie staje się statyczna — znikają tylko przesunięcia i przypinanie.

### 4.5 Porządek treści (tor C)
- Kategorie: „Strategie UX” → **„Strony zbudowane z AI”** (EN „AI-assisted web development”),
  „Tworzenie treści” → **„Web Content”**; stare adresy przekierowują (308).
- Jeden wpis usunięty (wspominał dawnego pracodawcę); jego adresy przekierowują do kategorii.
- CTA pod każdym artykułem, dopasowane do kategorii.
- Komentarze pod artykułami w „zamrażarce” (kod i dane zostają, na stronie ich nie ma).

### 4.6 Liczby
- **Lighthouse mobile** (lokalny build produkcyjny, symulacja jak PageSpeed): strona główna 39 → **68**
  (CLS 0,27 → **0**, TBT 1,19 s → 0,69 s), blog **86**, artykuł **79**, dostępność 96–100.
- **Adresy:** wszystkie 27 adresów z mapy starej strony działa na nowej (200 albo jedno przekierowanie).
- **Tempo:** cały redesign od pierwszej makiety do startu na domenie — jeden dzień pracy z AI
  (25.11.2026), z przeglądem właściciela po każdym etapie.

### 4.7 Błędy i lekcje (materiał na sekcję „Błędy, które mnie czegoś nauczyły”)
1. **Przebudowa wyglądu zabiła ruch.** Przy przenoszeniu sekcji na nowy wygląd animacje zostały wycięte —
   strona stała się „statyczna”. Lekcja: lista animacji idzie razem z sekcją do nowej wersji.
2. **„Ogranicz ruch” w telefonie** wyłączał całą animację; właściciel widział martwą stronę. Teraz to tryb lżejszy,
   nie wyłącznik.
3. **Koło wracało za kursorem po każdym zatrzymaniu przewijania** — technicznie sprytne, w praktyce męczące.
   Lekcja: interakcja ma wynikać z intencji użytkownika, nie z tego, co da się zrobić.
4. **Formularz „działał”, a maile nie wychodziły:** nieważny klucz Resend lokalnie, brak kluczy w Vercel —
   nadawca widział sukces, bo wiadomość zapisywała się w Sanity. Lekcja: test „od formularza do skrzynki”.
5. **Produkcja pokazywała starą stronę**, bo cała nowa praca była na osobnej gałęzi — celowo, do akceptacji.
   Lekcja: jasno mówić, która wersja jest gdzie.
6. **Wydajność:** setup animacji i podział nagłówków na linie przy starcie blokował stronę; koło pokazywane
   przed pomiarem przesuwało układ. Rozwiązanie: ruch ładowany osobno, po pierwszym malowaniu, nagłówki dzielone
   dopiero przed wejściem na ekran.
7. **Polityka prywatności** — strona czyta ją z kodu, a w Studio został stary, nieużywany dokument o tej samej
   nazwie (pułapka dla edytora).

---

## 5. Artykuł „Jak zbudowałem tę stronę…” — stan i propozycja aktualizacji

### 5.1 Stan obecny (w Sanity)
- PL: `moja-strona-z-ai`, kategoria „Strony zbudowane z AI”, opublikowany 21.03.2026, ~1290 słów.
- EN: `my-ai-assisted-website`, kategoria „AI-assisted web development”, opublikowany 22.03.2026, ~1290 słów.
- Śródtytuły (PL): Dlaczego nie gotowa platforma · Jak zbudowałem stronę przy pomocy AI? · Stack: co i dlaczego ·
  Decyzje projektowe, które miały znaczenie (Typografia jako fundament · System tagów w bazie danych ·
  Embedy z Instagrama · Favicon bez konfiguracji · Panel admina bez lokalizacji) · Błędy, które mnie czegoś
  nauczyły · Co to wszystko oznacza.
- **Nieaktualne / do usunięcia:**
  - wzmianki o wykształceniu tłumacza i o „filologu” (zasada nr 1);
  - opis stacku z marca (m.in. „PostgreSQL w chmurze”, tłumaczenia przez pliki JSON jako główny mechanizm) —
    dziś treści są w Sanity, wygląd i ruch zupełnie inne;
  - typografia z pierwszej wersji (Cormorant/DM Sans) — dziś Archivo + IBM Plex Mono.
- Artykuł jest linkowany z sekcji „O mnie” na stronie głównej („Przeczytaj, jak zbudowałem tę stronę z AI”)
  — adres nie może się zmienić (slug zostaje).

### 5.2 Propozycja nowej struktury (do decyzji właściciela)
1. **Lead:** od pierwszej wersji w marcu do startu „Sygnału” w listopadzie — co się zmieniło w podejściu.
2. **Dlaczego nie gotowa platforma** — zostaje, skrócone.
3. **Jak wygląda praca z AI w praktyce:** brief → iteracje → przegląd po każdej; AI pisze kod, decyzje zostają
   po stronie człowieka (to samo, co obiecuje oferta).
4. **Stack dziś** — tabela z sekcji 2 (wersja dla czytelnika, bez szczegółów technicznych).
5. **Redesign w jeden dzień:** droga Szpalta → Orbita → Sygnał (sekcja 4.2), jedno koło zamiast menu.
6. **Decyzje, które miały znaczenie:** wybrane z 4.3–4.5 (koło i intencja użytkownika, ruch jako treść,
   porządek kategorii z przekierowaniami, komentarze w zamrażarce).
7. **Błędy, które mnie czegoś nauczyły:** 3–4 punkty z 4.7.
8. **Liczby:** Lighthouse, 27/27 adresów, jeden dzień.
9. **Co to oznacza dla klienta** (zamiast „Co to wszystko oznacza”): czego może się spodziewać, zamawiając
   stronę budowaną z AI — z CTA do rozmowy (CTA pod artykułem dodaje się samo).

Długość: podobna jak dziś (1200–1600 słów). Obie wersje językowe. FAQ artykułu (pole „FAQ” w Sanity) można
uzupełnić 3–5 pytaniami — trafiają do danych strukturalnych FAQPage.

---

## 6. Backlog (otwarte sprawy)

### Treści (właściciel, w Studio)
- [ ] Aktualizacja artykułu „Jak zbudowałem tę stronę…” PL/EN (sekcja 5).
- [ ] Nagłówek i tytuł strony bloga („Tworzenie treści i strategie UX”, tytuł karty „Strona główna”).
- [ ] Podtytuł hero EN (propozycja: „AI writes the code. A human makes the decisions.”).
- [ ] Weryfikacja godzin w przykładach wycen, nagłówka FAQ, czasów w FAQ i w procesie („60–90 minut”).
- [ ] Teksty w głosie „ja” na stronie głównej (np. „Dla kogo pracuję”, „Jak pracuję”, „Kto: Ty i ja”) — do przeredagowania.
- [ ] Profile do danych strukturalnych (`sameAs`, np. LinkedIn) — podać adresy.
- [ ] Usunąć testowe wiadomości kontaktowe w Studio i nieużywane dokumenty stron „Polityka prywatności”
      (`page-privacy-pl/en`), które strona i tak pomija.

### Po starcie
- [ ] Google Search Console: ponowne zgłoszenie `https://neoneon.online/sitemap.xml`.
- [ ] Przegląd polityki prywatności przez prawnika (tekst przygotowany na podstawie dokumentów dostawców).
- [ ] Szczegółowy test na iPhonie przy okazji edycji tekstów (przypinane sekcje w Safari).

### Kod (Claude)
- [ ] Wersja angielska przykładów wycen (dziś sekcja wycen jest tylko po polsku).
- [ ] Rezerwacja terminu rozmowy (kalendarz) — w projekcie „Sygnał” przewidziana, niezrobiona.
- [x] Polityki przeniesione do Sanity (Studio → „Polityki”, 26.11.2026).
- [ ] Komentarze: decyzja, czy wracają z zamrażarki (`COMMENTS_ENABLED` w `lib/site.ts`).

---

## 7. Gdzie co jest (dla Claude)

| Co | Gdzie |
|---|---|
| Strona główna (sekcje „Sygnał”) | `app/[locale]/(blog)/page.tsx`, `components/sygnal/home/*`, `components/sygnal/HomeSignal.tsx` |
| Ruch | `components/sygnal/motionKit.ts`, `components/sygnal/home/homeMotion.ts`, `components/sygnal/SiteMotion.tsx` |
| Koło i mapa | `components/sygnal/SignalDial.tsx`, `SignalMap.tsx`, `SiteChrome.tsx` |
| Artykuł | `app/[locale]/(blog)/[...segments]/page.tsx`, `components/sygnal/ArticleCta.tsx` |
| Teksty strony głównej (PL/EN) | Studio → „Strona główna — teksty” (homeCopy-pl/en) |
| Polityki | Studio → „Polityki” (legal-privacy/cookies-pl/en) |
| Pozostałe copy (koło, pasek, stopka, formularze, 404, a11y, embed…) | Studio → „Teksty interfejsu” (uiStrings-pl/en) |
| Definicja wszystkich pól copy | `sanity/copyFields.ts` → schemat Studio + `types/messages.d.ts` (`npm run copy:types`) |
| Pilnowanie „zero copy w kodzie” | `npm run lint` (ESLint `react/jsx-no-literals` + `scripts/audit-copy.ts`) |
| Adresy e-mail, przełącznik komentarzy | `lib/site.ts` |
| Przekierowania | `next.config.ts` + `previousSlugs` kategorii w Sanity |
| Historia porządków technicznych | `CHANGELOG.md` |
