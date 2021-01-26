import React, { useState } from 'react'
import AssetOverview from '../../components/asset-overview'
import AssetOverviewEditor from '../../components/asset-overview-editor'

const getIsInitiallyInEditMode = () => {
  return window.location.search.includes('edit')
}

export default ({
  match: {
    params: { assetId }
  }
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(getIsInitiallyInEditMode())
  const switchEditorOpen = () => setIsEditorOpen(!isEditorOpen)
  return isEditorOpen ? (
    <AssetOverviewEditor
      assetId={assetId}
      switchEditorOpen={switchEditorOpen}
    />
  ) : (
    <AssetOverview assetId={assetId} switchEditorOpen={switchEditorOpen} />
  )
}
