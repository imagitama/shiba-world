import backupShibaInuImageUrl from './assets/images/species/shiba_inu.png'
import backupAvaliImageUrl from './assets/images/species/avali.png'
import backupBestBoiImageUrl from './assets/images/species/best_boi.png'
import backupSergalImageUrl from './assets/images/species/sergal.png'
import backupRexouiumImageUrl from './assets/images/species/rexouium.png'
import backupKangarooImageUrl from './assets/images/species/kangaroo.png'
import backupRacoonImageUrl from './assets/images/species/racoon.png'
import backupOtherSpeciesImageUrl from './assets/images/species/other-species.png'
import backupFoxShibaImageUrl from './assets/images/species/fox_shiba.png'

import optimizedShibaInuImageUrl from './assets/images/species/optimized/shiba_inu.webp'
import optimizedAvaliImageUrl from './assets/images/species/optimized/avali.webp'
import optimizedBestBoiImageUrl from './assets/images/species/optimized/best_boi.webp'
import optimizedSergalImageUrl from './assets/images/species/optimized/sergal.webp'
import optimizedRexouiumImageUrl from './assets/images/species/optimized/rexouium.webp'
import optimizedKangarooImageUrl from './assets/images/species/optimized/kangaroo.webp'
import optimizedRacoonImageUrl from './assets/images/species/optimized/racoon.webp'
import optimizedOtherSpeciesImageUrl from './assets/images/species/optimized/other-species.webp'
import optimizedFoxShibaImageUrl from './assets/images/species/optimized/fox_shiba.webp'

import { species } from './tags'

export default {
  [species.Shiba]: {
    name: 'Shiba Inu',
    shortDescription:
      'A cute squishy anthropomorphic shiba inu avatar created by Pikapetey.',
    description: `An anthropomorphic avatar created by [Pikapetey](https://www.patreon.com/pikapetey). It costs $5 and you can purchase it by visiting links in the Avatars section for this species. We recommend the Corpse shiba over the original model as it contains performance improvements and bug fixes.`,
    backupThumbnailUrl: backupShibaInuImageUrl,
    optimizedThumbnailUrl: optimizedShibaInuImageUrl
  },
  [species.FoxShiba]: {
    name: 'Fox Shiba',
    shortDescription:
      'A fox using the Shiba Inu avatar originally by Pikapetey.',
    description: `An anthropomorphic fox that was created using the Shiba Inu avatar originally by [Pikapetey](https://www.patreon.com/pikapetey). It requires access to the original Shiba Inu avatar by visiting the links in the Avatars section.`,
    backupThumbnailUrl: backupFoxShibaImageUrl,
    optimizedThumbnailUrl: optimizedFoxShibaImageUrl
  },
  [species.Avali]: {
    name: 'Avali',
    shortDescription: `A small fluffy bird-like creature from a RimWorld mod.`,
    description: `The Avali are a race of small fluffy nomadic pack hunters with bad temper and specific comfort temperature range.
    
They were originally a [RimWorld mod](https://rimworldbase.com/avali-mod/) but have since been made into a VRChat avatar and is very popular amongst players.

Useful links:
- [The Official Avali Wiki](https://avali.fandom.com/wiki/The_Official_Avali_Wiki)`,
    backupThumbnailUrl: backupAvaliImageUrl,
    optimizedThumbnailUrl: optimizedAvaliImageUrl
  },
  [species.BestBoi]: {
    name: 'Best Boi',
    shortDescription: `A fox-like creature that is the best of the bois.`,
    description: `The foxdragon is a fox-like creature that stands on their hind legs. They were created for VRChat.
    
Useful links:
- [Model website](https://bestbois.com)
- [Best Boi Discord](https://discord.com/invite/sRrXpyZ)
- [Best Boi VRChat world](https://vrchat.com/home/world/wrld_05be1d4a-72ae-489b-93bd-489d2b78abc5)`,
    backupThumbnailUrl: backupBestBoiImageUrl,
    optimizedThumbnailUrl: optimizedBestBoiImageUrl
  },
  [species.sergal]: {
    name: 'Sergal',
    shortDescription: `A tall, shark-like fictional alien species.`,
    description: `The sergal is a fictional alien species created by [Mick Ono](https://en.wikifur.com/wiki/Trancy_MICK). They have a shark-like head and are nicknamed "cheese wedge" by some.

Useful links:
- [Wikifur Sergal page](https://en.wikifur.com/wiki/Sergal)
- [VR Sergal Friends Discord](https://discord.gg/zaQfcwP)`,
    backupThumbnailUrl: backupSergalImageUrl,
    optimizedThumbnailUrl: optimizedSergalImageUrl
  },
  [species.rexouium]: {
    name: 'Rexouium',
    shortDescription: `A tall fictional species with the name meaning king (rex) care-taker (ouium).`,
    description: `A tall fictional species with the name meaning king (rex) care-taker (ouium). Created by [RacoonRezillo](https://www.furaffinity.net/view/36134921). They are the king care-takers of their world. They can climb well and are fast.

Useful links:
- [VRChat World](https://www.vrchat.com/home/launch?worldId=wrld_3a278e64-36c3-4c19-9e2a-f8bac7bbd9c4)`,
    backupThumbnailUrl: backupRexouiumImageUrl,
    optimizedThumbnailUrl: optimizedRexouiumImageUrl
  },
  [species.kangaroo]: {
    name: 'Kangaroo',
    shortDescription: `A smooth, curvy anthro kangaroo.`,
    description: `An anthropomorphic kangaroo avatar created by [Spaghet](https://gumroad.com/spaghet_vr).

Useful links:
- [Kanga World](https://www.vrcw.net/world/detail/wrld_4366831d-ada2-4f68-8ab8-6df1d118e50c)`,
    backupThumbnailUrl: backupKangarooImageUrl,
    optimizedThumbnailUrl: optimizedKangarooImageUrl
  },
  [species.racoon]: {
    name: 'Racoon',
    shortDescription: `A big-eyed anthro racoon.`,
    description: `An anthropomorphic racoon model created by [YellowStumps](https://www.furaffinity.net/user/yellowstumps).
    
Useful links:
- [FurAffinity page](https://www.furaffinity.net/view/32997273)
- [Download the base model](https://drive.google.com/drive/folders/1gny4og32AwilVQcjhSFa-PsxbYEwbXBd)`,
    backupThumbnailUrl: backupRacoonImageUrl,
    optimizedThumbnailUrl: optimizedRacoonImageUrl
  },
  [species.otherSpecies]: {
    name: 'Other Species',
    shortDescription: `Assets that have tags not matching the popular ones.`,
    description: `Assets that have tags not matching the popular ones.`,
    backupThumbnailUrl: backupOtherSpeciesImageUrl,
    optimizedThumbnailUrl: optimizedOtherSpeciesImageUrl
  }
}
