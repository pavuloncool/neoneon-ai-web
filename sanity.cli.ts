import { defineCliConfig } from 'sanity/cli'
import { dataset, projectId } from './sanity/env'

export default defineCliConfig({
  api: { projectId, dataset },
  // appId Studio starego projektu (n81gbqh8) usunięty — po wdrożeniu nowej wersji zarejestruj Studio:
  // npx sanity deploy --external --url https://<domena>/studio
})
