import { article } from './article'
import { blockContent } from './blockContent'
import { category } from './category'
import { comment } from './comment'
import { contactMessage } from './contactMessage'
import { faqEntry } from './faqEntry'
import { homeCopy } from './homeCopy'
import { hourlyRate } from './hourlyRate'
import { legalDoc } from './legalDoc'
import { link, navItem } from './link'
import { page } from './page'
import { pricingExample } from './pricingExample'
import { pricingSettings } from './pricingSettings'
import { sectionSchemas } from './sections'
import { siteSettings } from './siteSettings'
import { tag } from './tag'
import { uiStrings } from './uiStrings'

export const schemaTypes = [
  article,
  category,
  tag,
  page,
  siteSettings,
  uiStrings,
  homeCopy,
  legalDoc,
  hourlyRate,
  pricingExample,
  pricingSettings,
  faqEntry,
  comment,
  contactMessage,
  blockContent,
  link,
  navItem,
  ...sectionSchemas,
]
