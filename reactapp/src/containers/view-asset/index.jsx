import React from 'react'
import AssetOverview from '../../components/asset-overview'

export default ({ match: { params } }) => (
  <AssetOverview assetId={params.assetId} />
)
