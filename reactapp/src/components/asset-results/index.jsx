import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AssetResultsItem from '../asset-results-item'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' }
})

export default ({
  assets,
  showCategory = false,
  showPinned = false,
  showCost = true,
  showIsNsfw = true,
  hoverOnEffect = false
}) => {
  const classes = useStyles()
  let allAssets

  if (showPinned) {
    const { pinnedAssets, unpinnedAssets } = assets.reduce(
      ({ pinnedAssets, unpinnedAssets }, asset) => {
        if (asset.isPinned) {
          return {
            pinnedAssets: pinnedAssets.concat([asset]),
            unpinnedAssets
          }
        }
        return {
          pinnedAssets,
          unpinnedAssets: unpinnedAssets.concat([asset])
        }
      },
      { pinnedAssets: [], unpinnedAssets: [] }
    )

    allAssets = pinnedAssets.concat(unpinnedAssets)
  } else {
    allAssets = assets
  }

  return (
    <div className={classes.root}>
      {allAssets.map(asset => (
        <AssetResultsItem
          key={asset.id}
          asset={asset}
          showCategory={showCategory}
          showPinned={showPinned}
          showCost={showCost}
          showIsNsfw={showIsNsfw}
          hoverOnEffect={hoverOnEffect}
        />
      ))}
    </div>
  )
}
