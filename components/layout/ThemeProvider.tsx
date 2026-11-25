'use client'

// components/layout/ThemeProvider.tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { CLIENT_SCRIPT_TYPE } from './BootScript'

// Motyw narzucony całemu serwisowi; używa go też HtmlClassGuard (przywracanie klasy przed malowaniem)
export const FORCED_THEME = 'dark' as const

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      // Kierunek „Sygnał”: cały serwis w ciemnym motywie (decyzja o jasnym trybie czytania — iteracja B4)
      forcedTheme={FORCED_THEME}
      disableTransitionOnChange={false}
      // Skrypt motywu: po stronie klienta jako blok danych (bez błędu „Encountered a script tag…”) — patrz BootScript
      scriptProps={{ type: CLIENT_SCRIPT_TYPE }}
    >
      {children}
    </NextThemesProvider>
  )
}
