import { AssetCategories } from './hooks/useDatabaseQuery'

import accessoryOptimizedImageUrl from './assets/images/categories/optimized/accessory.webp'
import animationOptimizedImageUrl from './assets/images/categories/optimized/animation.webp'
import articleOptimizedImageUrl from './assets/images/categories/optimized/article.webp'
import avatarOptimizedImageUrl from './assets/images/categories/optimized/avatar.webp'
import tutorialOptimizedImageUrl from './assets/images/categories/optimized/tutorial.webp'
import worldOptimizedImageUrl from './assets/images/categories/optimized/world.webp'
import toolOptimizedImageUrl from './assets/images/categories/optimized/tool.webp'
import alterationOptimizedImageUrl from './assets/images/categories/optimized/alteration.webp'

export default {
  [AssetCategories.accessory]: {
    name: 'Accessories',
    nameSingular: 'Accessory',
    shortDescription: `Prefabs, models, textures and other accessories for your avatar. Most accessories should have instructions for attaching them.`,
    optimizedImageUrl: accessoryOptimizedImageUrl
  },
  [AssetCategories.animation]: {
    name: 'Animations',
    nameSingular: 'Animation',
    shortDescription:
      'Make your avatar dance, wave or run on the spot using one of these pre-made animations.',
    optimizedImageUrl: animationOptimizedImageUrl
  },
  [AssetCategories.avatar]: {
    name: 'Avatars',
    nameSingular: 'Avatar',
    shortDescription: `Download base models or find links to download them.`,
    optimizedImageUrl: avatarOptimizedImageUrl
  },
  [AssetCategories.tutorial]: {
    name: 'Tutorials',
    nameSingular: 'Tutorial',
    shortDescription: `Learn how to use software such as Unity, Blender or Substance Painter. Learn how to make changes to your avatar or build worlds.`,
    optimizedImageUrl: tutorialOptimizedImageUrl
  },
  [AssetCategories.article]: {
    name: 'News',
    nameSingular: 'Article',
    shortDescription: `Read recent news article about VRChat and the different species.`,
    optimizedImageUrl: articleOptimizedImageUrl
  },
  [AssetCategories.world]: {
    name: 'Worlds',
    nameSingular: 'World',
    shortDescription: `Worlds you can visit that are related to the species of VRChat.`,
    optimizedImageUrl: worldOptimizedImageUrl
  },
  [AssetCategories.tool]: {
    name: 'Tools',
    nameSingular: 'Tool',
    shortDescription: 'Utilities and tools to help you build VRChat mods.',
    optimizedImageUrl: toolOptimizedImageUrl
  },
  [AssetCategories.alteration]: {
    name: 'Alterations',
    nameSingular: 'Alteration',
    shortDescription:
      'An alteration or modification of an existing avatar or accessory.',
    optimizedImageUrl: alterationOptimizedImageUrl
  }
}
