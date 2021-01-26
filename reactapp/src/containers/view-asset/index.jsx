import React, { useState } from 'react'
import AssetOverview from '../../components/asset-overview'
import AssetOverviewEditor from '../../components/asset-overview-editor'

export default ({
  match: {
    params: { assetId }
  }
}) => {
  const [isEditorOpen, setIsEditorOpen] = useState(true)
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
