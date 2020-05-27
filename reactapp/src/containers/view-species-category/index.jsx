import React from 'react'
import Paper from '@material-ui/core/Paper'
import { makeStyles } from '@material-ui/core/styles'
import Markdown from 'react-markdown'
import { Helmet } from 'react-helmet'
import useUserRecord from '../../hooks/useUserRecord'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import speciesMeta from '../../species-meta'
import ErrorMessage from '../../components/error-message'
import tags from '../../tags'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import Heading from '../../components/heading'
import TagChip from '../../components/tag-chip'

function getSpeciesByName(speciesName) {
  if (!speciesMeta[speciesName]) {
    throw new Error(`Invalid species name: ${speciesName}`)
  }
  return speciesMeta[speciesName]
}

function getNameForSpeciesName(speciesName) {
  return getSpeciesByName(speciesName).name
}

function getShortDescriptionForSpeciesName(speciesName) {
  return getSpeciesByName(speciesName).shortDescription
}

function getDescriptionForSpeciesName(speciesName) {
  return getSpeciesByName(speciesName).description
}

function getCategoryDisplayName(category) {
  return `${category.substr(0, 1).toUpperCase()}${category.substr(1)}`
}

const useStyles = makeStyles({
  description: {
    padding: '1rem'
  }
})

function Assets({ speciesName, categoryName }) {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
    [AssetFieldNames.species, Operators.ARRAY_CONTAINS, speciesName],
    [AssetFieldNames.category, Operators.EQUALS, categoryName]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to adult content just to be sure
  if (user && user.enabledAdultContent === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses.length ? whereClauses : undefined
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return (
      <ErrorMessage>
        Failed to get assets by species {speciesName} and category{' '}
        {categoryName}
      </ErrorMessage>
    )
  }

  if (!results.length) {
    return 'No results'
  }

  return <AssetResults assets={results} />
}

export default ({
  match: {
    params: { speciesName, categoryName }
  }
}) => {
  const classes = useStyles()
  return (
    <>
      <Helmet>
        <title>
          {getCategoryDisplayName(categoryName)} |{' '}
          {getNameForSpeciesName(speciesName)} | One of the species with
          accessories, animations, tutorials and avatars. | VRCArena
        </title>
        <meta
          name="description"
          content={getShortDescriptionForSpeciesName(speciesName)}
        />
      </Helmet>
      <Heading variant="h1">{getNameForSpeciesName(speciesName)}</Heading>
      <Heading variant="h2">{getCategoryDisplayName(categoryName)}</Heading>
      <Assets speciesName={speciesName} categoryName={categoryName} />
    </>
  )
}
