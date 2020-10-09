import { SpeciesFieldNames } from './hooks/useDatabaseQuery'
import otherSpeciesThumbnailUrl from './assets/images/other-species.webp'
import otherSpeciesFallbackThumbnailUrl from './assets/images/other-species.png'

export const TWITTER_URL = 'https://twitter.com/VRCArena'
export const DISCORD_URL = 'https://discord.gg/UVs9V58'
export const EMAIL = 'contact@vrcarena.com'

export const BANNER_WIDTH = 1280
export const BANNER_HEIGHT = 300

export const THUMBNAIL_WIDTH = 300
export const THUMBNAIL_HEIGHT = 300

export const AVATAR_WIDTH = THUMBNAIL_WIDTH
export const AVATAR_HEIGHT = THUMBNAIL_HEIGHT

export const otherSpeciesKey = 'other-species'
export const otherSpeciesMeta = {
  [SpeciesFieldNames.pluralName]: 'Other Species',
  [SpeciesFieldNames.singularName]: 'Other Species',
  [SpeciesFieldNames.description]: 'Assets that do not have a species.',
  [SpeciesFieldNames.shortDescription]: 'Assets that do not have a species.',
  [SpeciesFieldNames.thumbnailSourceUrl]: otherSpeciesThumbnailUrl,
  [SpeciesFieldNames.fallbackThumbnailUrl]: otherSpeciesFallbackThumbnailUrl
}
