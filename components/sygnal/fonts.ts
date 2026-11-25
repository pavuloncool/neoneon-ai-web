import { Archivo, IBM_Plex_Mono } from 'next/font/google'

// Prototyp „Sygnał”: kroje z next/font/google — Next pobiera je przy buildzie i serwuje z naszej domeny
// (bez CDN Google w przeglądarce). Przy wdrożeniu docelowym przenieść do styles/fonts/ jak resztę krojów.

export const archivo = Archivo({
  subsets: ['latin', 'latin-ext'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

export const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
})
