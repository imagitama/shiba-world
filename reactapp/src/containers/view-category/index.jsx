import React from 'react'
import { Helmet } from 'react-helmet'

import categoryMeta from '../../category-meta'
import Heading from '../../components/heading'
import BodyText from '../../components/body-text'
import CachedView from '../../components/cached-view'
import AssetResults from '../../components/asset-results'

import { AssetCategories, AssetFieldNames } from '../../hooks/useDatabaseQuery'

import AvatarTutorialSection from './components/avatar-tutorial-section'
import { useParams } from 'react-router'
import useIsAdultContentEnabled from '../../hooks/useIsAdultContentEnabled'

const analyticsActionCategory = 'AssetsList'

function getDisplayNameByCategoryName(categoryName) {
  return categoryMeta[categoryName].name
}

function getDescriptionByCategoryName(categoryName) {
  return categoryMeta[categoryName].shortDescription
}

const Renderer = ({ items }) => <AssetResults assets={items} />

export default () => {
  const { categoryName } = useParams()
  const isAdultContentEnabled = useIsAdultContentEnabled()

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

      <div>
        <Heading variant="h1">
          {getDisplayNameByCategoryName(categoryName)}
        </Heading>
        <BodyText>{getDescriptionByCategoryName(categoryName)}</BodyText>
        {categoryName === AssetCategories.tutorial && <AvatarTutorialSection />}
        <CachedView
          viewName={`view-category-${categoryName}_${
            isAdultContentEnabled ? 'nsfw' : 'sfw'
          }`}
          sortKey="view-category"
          sortOptions={[
            {
              label: 'Submission date',
              fieldName: AssetFieldNames.createdAt
            },
            {
              label: 'Title',
              fieldName: AssetFieldNames.title
            }
          ]}
          defaultFieldName={AssetFieldNames.createdAt}>
          <Renderer />
        </CachedView>
      </div>
    </>
  )
}
