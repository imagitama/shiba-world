import React, { useState, useEffect } from 'react'
import AssetOverview from '../../components/asset-overview'
import AssetOverviewEditor from '../../components/asset-overview-editor'
import LoadingIndicator from '../../components/loading-indicator'
import { firestore } from 'firebase/app'
import {
  CollectionNames,
  AssetFieldNames,
  Operators
} from '../../hooks/useDatabaseQuery'
import { handleError } from '../../error-handling'

const getIsInitiallyInEditMode = () => {
  return window.location.search.includes('edit')
}

// maybe use regex here?
const getIsSlug = str => str && str.length > 2 && str.length < 19

export default ({
  match: {
    params: { assetId: assetIdOrSlug }
  }
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(getIsInitiallyInEditMode())
  const switchEditorOpen = () => setIsEditorOpen(!isEditorOpen)
  const isSlug = getIsSlug(assetIdOrSlug)
  const [actualAssetId, setActualAssetId] = useState(
    isSlug ? false : assetIdOrSlug
  )

  useEffect(() => {
    if (!isSlug) {
      return
    }

    async function populateAssetIdForSlug(slug) {
      try {
        console.debug(`Get asset ID for slug "${slug}"`)

        const { docs, size } = await firestore()
          .collection(CollectionNames.Assets)
          .where(AssetFieldNames.slug, Operators.EQUALS, slug)
          .get()

        if (size !== 1) {
          throw new Error(`Could not find an asset for the slug ${slug}!`)
        }

        const firstDoc = docs[0]
        setActualAssetId(firstDoc.id)
      } catch (err) {
        console.error('Failed to search assets for slug', err)
        handleError(err)
      }
    }

    populateAssetIdForSlug(assetIdOrSlug)
  }, [assetIdOrSlug])

  if (!actualAssetId) {
    return <LoadingIndicator />
  }

  return isEditorOpen ? (
    <AssetOverviewEditor
      assetId={actualAssetId}
      switchEditorOpen={switchEditorOpen}
    />
  ) : (
    <AssetOverview
      assetId={actualAssetId}
      switchEditorOpen={switchEditorOpen}
    />
  )
}
