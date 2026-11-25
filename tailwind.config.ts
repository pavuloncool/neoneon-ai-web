import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      fontFamily: {
        // „Sygnał”: Archivo (nagłówki i tekst) i IBM Plex Mono (etykiety, kod) — @font-face w globals.css
        display: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-archivo)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
        // Odręczny — notatki redaktora na marginesie (klasa: font-hand; @font-face w styles/globals.css)
        hand: ['Caveat', 'cursive'],
      },
      colors: {
        ink: '#0f0f0f',
        paper: '#fafaf8',
        muted: '#6b6b6b',
        accent: '#c8a96e',       // złoto — subtelny akcent
        border: '#e5e5e0',
        // Tokeny one-pagera — wartości w styles/globals.css (:root / .dark)
        'accent-ai': 'var(--accent-ai)',
        'accent-edit': 'var(--accent-edit)',
      },
      typography: {
        DEFAULT: {
          css: {
            color: '#0f0f0f',
            fontFamily: 'var(--font-archivo)',
            'h1, h2, h3, h4': {
              fontFamily: 'var(--font-archivo)',
              fontWeight: '600',
            },
            a: {
              color: '#0f0f0f',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            },
            'a:hover': {
              color: '#c8a96e',
            },
            blockquote: {
              borderLeftColor: '#c8a96e',
              fontStyle: 'italic',
              fontFamily: 'var(--font-archivo)',
              fontSize: '1.25rem',
            },
          },
        },
      },
    },
  },
  plugins: [
    typography,
  ],
}

export default config
