// /pl/polityka-prywatnosci — treść w Sanity (Studio → „Polityki”), odczyt: lib/legal.ts
import { legalRoute } from '@/components/legal/legalRoute'

const route = legalRoute('privacy', 'pl')
export const generateMetadata = route.generateMetadata
export default route.Page
