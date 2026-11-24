// /en/privacy-policy — ⚠️ TREŚĆ ROBOCZA, wymaga weryfikacji prawnej przed publikacją produkcyjną (lib/legal.ts)
import { legalRoute } from '@/components/legal/legalRoute'

const route = legalRoute('privacy', 'en')
export const generateMetadata = route.generateMetadata
export default route.Page
