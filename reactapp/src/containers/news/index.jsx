import React from 'react'
import { Helmet } from 'react-helmet'
import useDatabaseQuery, {
  CollectionNames,
  AssetCategories,
  AssetFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'
import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Article from '../../components/article'
import Heading from '../../components/heading'
import categoryMeta from '../../category-meta'

function Articles() {
  const [, , user] = useUserRecord()

  let whereClauses = [
    [AssetFieldNames.category, Operators.EQUALS, AssetCategories.article],
    [AssetFieldNames.isApproved, Operators.EQUALS, true],
    [AssetFieldNames.isAdult, Operators.EQUALS, false]
  ]

  // NSFW content is super risky and firebase doesnt have a != operator
  // so default to adult content just to be sure
  if (user && user.enabledAdultContent === true) {
    whereClauses = whereClauses.filter(
      ([fieldName]) => fieldName !== AssetFieldNames.isAdult
    )
  }

  const [isLoading, isErrored, articles] = useDatabaseQuery(
    CollectionNames.Assets,
    whereClauses
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to load articles</ErrorMessage>
  }

  if (!articles.length) {
    return 'No articles found'
  }

  return (
    <div>
      {articles.map(article => (
        <Article key={article.id} article={article} />
      ))}
    </div>
  )
}

export default () => {
  const title = categoryMeta[AssetCategories.article].name
  const desc = categoryMeta[AssetCategories.article].shortDescription
  return (
    <div>
      <Helmet>
        <title>
          {title} | {desc} | VRCArena
        </title>
        <meta name="description" content={desc} />
      </Helmet>
      <Heading variant="h1">{title}</Heading>
      <p>{desc}</p>
      <Articles />
    </div>
  )
}
