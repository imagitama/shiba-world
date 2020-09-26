import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import AddIcon from '@material-ui/icons/Add'

import Heading from '../../components/heading'
import RecentAssets from '../../components/recent-assets'
import SpeciesBrowser from '../../components/species-browser'
import AllTagsBrowser from '../../components/all-tags-browser'
import Paper from '../../components/paper'
import Button from '../../components/button'

import { AssetCategories } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import * as routes from '../../routes'
import { canEditSpecies } from '../../utils'
import { trackAction } from '../../analytics'

const description =
  'Browse all of the content for all of the species of VRChat including accessories, animations, tutorials avatars and more.'
const analyticsCategory = 'ViewAllSpecies'

export default () => {
  const [, , user] = useUserRecord()
  return (
    <>
      <Helmet>
        <title>View all of the species in the game VRChat | VRCArena</title>
        <meta name="description" content={description} />
      </Helmet>
      <Heading variant="h1">
        <Link to={routes.viewAllSpecies}>All Species</Link>
      </Heading>
      <Paper>{description}</Paper>
      {canEditSpecies(user) && (
        <>
          <Heading variant="h2">Actions</Heading>
          <Button
            url={routes.createSpecies}
            icon={<AddIcon />}
            onClick={() =>
              trackAction(analyticsCategory, 'Click create species button')
            }>
            Create
          </Button>
        </>
      )}
      <SpeciesBrowser />
      <RecentAssets
        limit={5}
        categoryName={AssetCategories.avatar}
        title="Recent Avatars"
      />
      <RecentAssets
        limit={5}
        categoryName={AssetCategories.article}
        title="News"
      />
      <RecentAssets
        limit={5}
        categoryName={AssetCategories.accessory}
        title="Recent Accessories"
      />
      <RecentAssets
        limit={5}
        categoryName={AssetCategories.animation}
        title="Recent Animations"
      />
      <RecentAssets
        limit={5}
        categoryName={AssetCategories.tutorial}
        title="Recent Tutorials"
      />
      <RecentAssets
        limit={5}
        categoryName={AssetCategories.world}
        title="Recent Worlds"
      />
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}
