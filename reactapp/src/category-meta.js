import { AssetCategories } from './hooks/useDatabaseQuery'

export default {
  [AssetCategories.accessory]: {
    name: 'Accessories',
    nameSingular: 'Accessory',
    shortDescription: `Prefabs, models, textures and other accessories for your avatar. Most accessories should have instructions for attaching them.`
  },
  [AssetCategories.animation]: {
    name: 'Animations',
    nameSingular: 'Animation',
    shortDescription:
      'Make your avatar dance, wave or run on the spot using one of these pre-made animations.'
  },
  [AssetCategories.avatar]: {
    name: 'Avatars',
    nameSingular: 'Avatar',
    shortDescription: `Download the base model or find links to download them.`
  },
  [AssetCategories.showcase]: {
    name: 'Avatar Showcase',
    nameSingular: 'Avatar Showcase',
    shortDescription: `Custom avatars built using the base model for this species. Use it to showcase your work with photos or link to public worlds where you can clone the avatar.`
  },
  [AssetCategories.tutorial]: {
    name: 'Tutorials',
    nameSingular: 'Tutorial',
    shortDescription: `Learn how to use software such as Unity, Blender or Substance Painter. Learn how to make changes to your avatar or build worlds.`
  },
  [AssetCategories.article]: {
    name: 'News',
    nameSingular: 'Article',
    shortDescription: `Read recent news article about VRChat and the different species.`
  },
  [AssetCategories.world]: {
    name: 'Worlds',
    nameSingular: 'World',
    shortDescription: `Worlds you can visit that are related to the species of VRChat.`
  }
}
