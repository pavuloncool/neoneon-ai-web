'use client'

// components/layout/ThemeProvider.tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { CLIENT_SCRIPT_TYPE } from './BootScript'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange={false}
      // Skrypt motywu: po stronie klienta jako blok danych (bez błędu „Encountered a script tag…”) — patrz BootScript
      scriptProps={{ type: CLIENT_SCRIPT_TYPE }}
    >
      {children}
    </NextThemesProvider>
  )
}
