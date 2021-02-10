import React from 'react'
import { Helmet } from 'react-helmet'
import { Link } from 'react-router-dom'
import AddIcon from '@material-ui/icons/Add'

import Heading from '../../components/heading'
import AllTagsBrowser from '../../components/all-tags-browser'
import Paper from '../../components/paper'
import Button from '../../components/button'
import SpeciesVsSelector from '../../components/species-vs-selector'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'

import useUserRecord from '../../hooks/useUserRecord'
import useDatabaseQuery, {
  CollectionNames,
  ViewCacheNames
} from '../../hooks/useDatabaseQuery'

import * as routes from '../../routes'
import { canEditSpecies } from '../../utils'
import { trackAction } from '../../analytics'

const description =
  'Browse all of the content for all of the species of VRChat including accessories, animations, tutorials avatars and more.'
const analyticsCategory = 'ViewAllSpecies'

const mapSpeciesItemsForRender = speciesItems =>
  speciesItems.map(item => ({
    id: item.species.id,
    ...item
  }))

function Species() {
  const [isLoading, isError, cacheResult] = useDatabaseQuery(
    CollectionNames.ViewCache,
    ViewCacheNames.ViewAllSpecies
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isError || !cacheResult) {
    return <ErrorMessage>Failed to find species</ErrorMessage>
  }

  if (!cacheResult.species || !cacheResult.species.length) {
    return <ErrorMessage>No species found</ErrorMessage>
  }

  return (
    <SpeciesVsSelector
      species={mapSpeciesItemsForRender(cacheResult.species)}
    />
  )
}

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
      <Species />
      <Heading variant="h2">Tags</Heading>
      <AllTagsBrowser lazyLoad />
    </>
  )
}
