import React from 'react'
import { Helmet } from 'react-helmet'
import { makeStyles } from '@material-ui/core/styles'

import SimpleResultsItem from '../../components/simple-results-item'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import CachedView from '../../components/cached-view'

import categoryMeta from '../../category-meta'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'
import * as routes from '../../routes'
import { AssetCategories, AssetFieldNames } from '../../hooks/useDatabaseQuery'

const useStyles = makeStyles({
  articles: {
    marginTop: '1rem'
  }
})

const Renderer = ({ items }) => {
  const classes = useStyles()
  return (
    <div className={classes.articles}>
      {items.map(
        ({
          id,
          title,
          description,
          createdAt,
          createdBy,
          thumbnailUrl,
          [AssetFieldNames.slug]: slug
        }) => (
          <SimpleResultsItem
            key={id}
            url={routes.viewAssetWithVar.replace(':assetId', slug || id)}
            title={title}
            description={description}
            author={createdBy}
            date={createdAt}
            thumbnailUrl={thumbnailUrl}
          />
        )
      )}
    </div>
  )
}

export default () => {
  const title = categoryMeta[AssetCategories.article].name
  const desc = categoryMeta[AssetCategories.article].shortDescription
  const isAdultContentEnabled = useIsAdultContentEnabled()

  return (
    <div>
      <Helmet>
        <title>
          {title} | {desc} | VRCArena
        </title>
        <meta name="description" content={desc} />
      </Helmet>
      <Heading variant="h1">{title}</Heading>
      <BodyText>{desc}</BodyText>
      <CachedView
        viewName={`news_${isAdultContentEnabled ? 'nsfw' : 'sfw'}`}
        sortKey="news"
        defaultFieldName={AssetFieldNames.createdAt}>
        <Renderer />
      </CachedView>
    </div>
  )
}
