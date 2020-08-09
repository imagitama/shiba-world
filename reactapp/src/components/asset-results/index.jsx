import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AssetResultsItem from '../asset-results-item'

const useStyles = makeStyles({
  root: { marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap' }
})

export default ({ assets }) => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      {assets.map(asset => (
        <AssetResultsItem key={asset.id} asset={asset} />
      ))}
    </div>
  )
}
