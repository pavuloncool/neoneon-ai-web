'use client'

// components/layout/BootScript.tsx
// Skrypt inline wykonywany przed hydracją (HTML z serwera). Przy zmianie języka React montuje layout
// [locale] od nowa po stronie klienta; zwykły <script> zgłasza wtedy błąd „Encountered a script tag…”
// (taki skrypt i tak się nie wykona). Po stronie klienta dostaje więc type="text/plain" — React traktuje
// go jak blok danych, bez błędu. Różnicę atrybutu przy hydracji wycisza suppressHydrationWarning;
// skrypt zdążył się już wykonać z HTML serwera. Klasy na <html> po zmianie języka przywraca HtmlClassGuard.

export const CLIENT_SCRIPT_TYPE = typeof window === 'undefined' ? undefined : 'text/plain'

export function BootScript({ code }: { code: string }) {
  return <script type={CLIENT_SCRIPT_TYPE} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: code }} />
}
