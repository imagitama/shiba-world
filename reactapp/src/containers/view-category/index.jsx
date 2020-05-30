import React from 'react'
import { Helmet } from 'react-helmet'
import useUserRecord from '../../hooks/useUserRecord'
import LoadingIndicator from '../../components/loading-indicator'
import AssetResults from '../../components/asset-results'
import categoryMeta from '../../category-meta'
import ErrorMessage from '../../components/error-message'
import useDatabaseQuery, {
  Operators,
  CollectionNames,
  AssetFieldNames
} from '../../hooks/useDatabaseQuery'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'

function getDisplayNameByCategoryName(categoryName) {
  return categoryMeta[categoryName].name
}

function getDescriptionByCategoryName(categoryName) {
  return categoryMeta[categoryName].shortDescription
}

function Assets({ categoryName }) {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false],
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
        Failed to get assets by category {categoryName}
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
    params: { categoryName }
  }
}) => {
  return (
    <>
      <Helmet>
        <title>
          {getDisplayNameByCategoryName(categoryName)} |{' '}
          {getDescriptionByCategoryName(categoryName)} | VRCArena
        </title>
        <meta
          name="description"
          content={getDescriptionByCategoryName(categoryName)}
        />
      </Helmet>
      <Heading variant="h1">
        {getDisplayNameByCategoryName(categoryName)}
      </Heading>
      <BodyText>{getDescriptionByCategoryName(categoryName)}</BodyText>
      <Assets categoryName={categoryName} />
    </>
  )
}
