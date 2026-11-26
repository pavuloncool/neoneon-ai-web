import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

// Copy strony jest wyłącznie w Sanity (sanity/copyFields.ts) — tekst wpisany w JSX to błąd.
// Dozwolone są tylko znaki typograficzne i kody, które nie są copy.
const ALLOWED_JSX_LITERALS = ['→', '←', '↓', '·', '—', '——', '|', '*', ':', '00', '01', 'PL', 'EN']

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    files: ['app/**/*.tsx', 'components/**/*.tsx'],
    rules: {
      'react/jsx-no-literals': ['error', { noStrings: false, ignoreProps: true, allowedStrings: ALLOWED_JSX_LITERALS }],
    },
  },
]

export default eslintConfig
