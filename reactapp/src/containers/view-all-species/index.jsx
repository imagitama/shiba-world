import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'

import Heading from '../../components/heading'
import RecentAssets from '../../components/recent-assets'
import SpeciesBrowser from '../../components/species-browser'

import { AssetCategories } from '../../hooks/useDatabaseQuery'

import categoryMeta from '../../category-meta'
import * as routes from '../../routes'

function RecentAssetDescription({ categoryName }) {
  return <p>{categoryMeta[categoryName].shortDescription}</p>
}

const description =
  'Browse all of the content for all of the species of VRChat including accessories, animations, tutorials avatars and more.'
export default () => (
  <>
    <Helmet>
      <title>View all of the species in the game VRChat | VRCArena</title>
      <meta name="description" content={description} />
    </Helmet>
    <Heading variant="h1">
      <Link to={routes.viewAllSpecies}>All Species</Link>
    </Heading>
    <p>{description}</p>
    <SpeciesBrowser />
    <Heading variant="h2">
      <Link
        to={routes.viewCategoryWithVar.replace(
          ':categoryName',
          AssetCategories.avatar
        )}>
        Avatars
      </Link>
    </Heading>
    <RecentAssetDescription categoryName={AssetCategories.avatar} />
    <RecentAssets limit={5} categoryName={AssetCategories.avatar} />
    <Heading variant="h2">
      <Link
        to={routes.viewCategoryWithVar.replace(
          ':categoryName',
          AssetCategories.article
        )}>
        News
      </Link>
    </Heading>
    <RecentAssetDescription categoryName={AssetCategories.article} />
    <RecentAssets limit={5} categoryName={AssetCategories.article} />
    <Heading variant="h2">
      <Link
        to={routes.viewCategoryWithVar.replace(
          ':categoryName',
          AssetCategories.accessory
        )}>
        Recent Accessories
      </Link>
    </Heading>
    <RecentAssetDescription categoryName={AssetCategories.accessory} />
    <RecentAssets limit={5} categoryName={AssetCategories.accessory} />
    <Heading variant="h2">
      <Link
        to={routes.viewCategoryWithVar.replace(
          ':categoryName',
          AssetCategories.animation
        )}>
        Recent Animations
      </Link>
    </Heading>
    <RecentAssetDescription categoryName={AssetCategories.animation} />
    <RecentAssets limit={5} categoryName={AssetCategories.animation} />
    <Heading variant="h2">
      <Link
        to={routes.viewCategoryWithVar.replace(
          ':categoryName',
          AssetCategories.tutorial
        )}>
        Recent Tutorials
      </Link>
    </Heading>
    <RecentAssetDescription categoryName={AssetCategories.tutorial} />
    <RecentAssets limit={5} categoryName={AssetCategories.tutorial} />
    <Heading variant="h2">
      <Link
        to={routes.viewCategoryWithVar.replace(
          ':categoryName',
          AssetCategories.showcase
        )}>
        Avatar Showcase
      </Link>
    </Heading>
    <RecentAssetDescription categoryName={AssetCategories.showcase} />
    <RecentAssets limit={5} categoryName={AssetCategories.showcase} />
  </>
)
