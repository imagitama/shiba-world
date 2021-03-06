import { SpeciesFieldNames } from './hooks/useDatabaseQuery'
import otherSpeciesThumbnailUrl from './assets/images/other-species.webp'
import otherSpeciesFallbackThumbnailUrl from './assets/images/other-species.png'

export const BUSINESS_NAME = 'VRC Arena' // privacy policy, TOS, DMCA, etc.
export const WEBSITE_FULL_URL = 'https://www.vrcarena.com'
export const TWITTER_URL = 'https://twitter.com/VRCArena'
export const DISCORD_URL = 'https://discord.gg/UVs9V58'
export const PATREON_BECOME_PATRON_URL =
  'https://www.patreon.com/bePatron?u=43812267'
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

export const alreadyOver18Key = 'already-over-18'
export const activeSearchFilterNamesKey = 'search-filters'

export const paths = {
  assetThumbnailDir: 'asset-thumbnails',
  assetBannerDir: 'asset-banners'
}

export const formHideDelay = 2000

export const searchFilterNames = {
  tags: 'tags'
}

export const searchFilters = [
  {
    name: searchFilterNames.tags,
    label: 'Tags'
  }
]

export const ContentTypes = {
  IMAGE: 'IMAGE',
  YOUTUBE_VIDEO: 'YOUTUBE_VIDEO',
  TWEET: 'TWEET'
}

export const importantTags = {
  neosvr_compatible: 'neosvr_compatible',
  chilloutvr_compatible: 'chilloutvr_compatible',
  free: 'free'
}
