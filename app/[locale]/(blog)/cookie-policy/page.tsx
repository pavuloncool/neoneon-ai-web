// /en/cookie-policy — treść w Sanity (Studio → „Polityki”), odczyt: lib/legal.ts
import { legalRoute } from '@/components/legal/legalRoute'

const route = legalRoute('cookies', 'en')
export const generateMetadata = route.generateMetadata
export default route.Page
