// /pl/polityka-cookies — ⚠️ TREŚĆ ROBOCZA, wymaga weryfikacji prawnej przed publikacją produkcyjną (lib/legal.ts)
import { legalRoute } from '@/components/legal/legalRoute'

const route = legalRoute('cookies', 'pl')
export const generateMetadata = route.generateMetadata
export default route.Page
