import { AssetCategories } from './hooks/useDatabaseQuery'

import accessoryImageUrl from './assets/images/categories/accessory.png'
import animationImageUrl from './assets/images/categories/animation.png'
import articleImageUrl from './assets/images/categories/article.png'
import avatarImageUrl from './assets/images/categories/avatar.png'
import tutorialImageUrl from './assets/images/categories/tutorial.png'
import worldImageUrl from './assets/images/categories/world.png'
import toolImageUrl from './assets/images/categories/tool.png'

import accessoryOptimizedImageUrl from './assets/images/categories/optimized/accessory.webp'
import animationOptimizedImageUrl from './assets/images/categories/optimized/animation.webp'
import articleOptimizedImageUrl from './assets/images/categories/optimized/article.webp'
import avatarOptimizedImageUrl from './assets/images/categories/optimized/avatar.webp'
import tutorialOptimizedImageUrl from './assets/images/categories/optimized/tutorial.webp'
import worldOptimizedImageUrl from './assets/images/categories/optimized/world.webp'
import toolOptimizedImageUrl from './assets/images/categories/optimized/tool.webp'

export default {
  [AssetCategories.accessory]: {
    name: 'Accessories',
    nameSingular: 'Accessory',
    shortDescription: `Prefabs, models, textures and other accessories for your avatar. Most accessories should have instructions for attaching them.`,
    imageUrl: accessoryImageUrl,
    optimizedImageUrl: accessoryOptimizedImageUrl
  },
  [AssetCategories.animation]: {
    name: 'Animations',
    nameSingular: 'Animation',
    shortDescription:
      'Make your avatar dance, wave or run on the spot using one of these pre-made animations.',
    imageUrl: animationImageUrl,
    optimizedImageUrl: animationOptimizedImageUrl
  },
  [AssetCategories.avatar]: {
    name: 'Avatars',
    nameSingular: 'Avatar',
    shortDescription: `Download base models or find links to download them.`,
    imageUrl: avatarImageUrl,
    optimizedImageUrl: avatarOptimizedImageUrl
  },
  [AssetCategories.tutorial]: {
    name: 'Tutorials',
    nameSingular: 'Tutorial',
    shortDescription: `Learn how to use software such as Unity, Blender or Substance Painter. Learn how to make changes to your avatar or build worlds.`,
    imageUrl: tutorialImageUrl,
    optimizedImageUrl: tutorialOptimizedImageUrl
  },
  [AssetCategories.article]: {
    name: 'News',
    nameSingular: 'Article',
    shortDescription: `Read recent news article about VRChat and the different species.`,
    imageUrl: articleImageUrl,
    optimizedImageUrl: articleOptimizedImageUrl
  },
  [AssetCategories.world]: {
    name: 'Worlds',
    nameSingular: 'World',
    shortDescription: `Worlds you can visit that are related to the species of VRChat.`,
    imageUrl: worldImageUrl,
    optimizedImageUrl: worldOptimizedImageUrl
  },
  [AssetCategories.tool]: {
    name: 'Tools',
    nameSingular: 'Tool',
    shortDescription: 'Utilities and tools to help you build VRChat mods.',
    imageUrl: toolImageUrl,
    optimizedImageUrl: toolOptimizedImageUrl
  }
}
