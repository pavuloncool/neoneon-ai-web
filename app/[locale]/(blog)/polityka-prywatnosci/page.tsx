// /pl/polityka-prywatnosci — ⚠️ TREŚĆ ROBOCZA, wymaga weryfikacji prawnej przed publikacją produkcyjną (lib/legal.ts)
import { legalRoute } from '@/components/legal/legalRoute'

const route = legalRoute('privacy', 'pl')
export const generateMetadata = route.generateMetadata
export default route.Page
