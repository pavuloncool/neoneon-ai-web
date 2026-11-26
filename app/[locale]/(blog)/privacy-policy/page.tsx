// /en/privacy-policy — treść w Sanity (Studio → „Polityki”), odczyt: lib/legal.ts
import { legalRoute } from '@/components/legal/legalRoute'

const route = legalRoute('privacy', 'en')
export const generateMetadata = route.generateMetadata
export default route.Page
