import { categories } from './tags'

export default {
  [categories.accessory]: {
    name: 'Accessories',
    shortDescription: `Prefabs, models, textures and other accessories for your avatar. Most accessories should have instructions for attaching them.`
  },
  [categories.animation]: {
    name: 'Animations',
    shortDescription:
      'Make your avatar dance, wave or run on the spot using one of these pre-made animations.'
  },
  [categories.avatar]: {
    name: 'Avatar Showcase',
    shortDescription: `Custom avatars built using the base model for this species. Use it to showcase your work with photos or link to public worlds where you can clone the avatar.`
  },
  [categories.tutorial]: {
    name: 'Tutorials',
    shortDescription: `Learn how to use software such as Unity, Blender or Substance Painter. Learn how to make changes to your avatar or build worlds.`
  }
}
