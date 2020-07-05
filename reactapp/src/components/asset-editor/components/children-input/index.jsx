import React, { useState, useEffect } from 'react'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseDocument from '../../../../hooks/useDatabaseDocument'
import {
  CollectionNames,
  formatRawDoc
} from '../../../../hooks/useDatabaseQuery'
import Button from '../../../button'
import AssetResultsItem from '../../../asset-results-item'

const useStyles = makeStyles({
  root: {
    padding: '1rem'
  }
})

function ChildAsset({ assetDoc, onDelete }) {
  const [asset, setAsset] = useState(null)

  useEffect(() => {
    async function main() {
      const record = await assetDoc.get()
      const formattedRecord = await formatRawDoc(record)
      setAsset(formattedRecord)
    }

    main()
  }, [])

  if (!asset) {
    return null
  }

  return (
    <div>
      {asset.title}
      <Button onClick={onDelete}>Remove</Button>
    </div>
  )
}

function removeChildAsset(assets, childAsset) {
  return assets.filter(asset => asset !== childAsset)
}

function addChildAsset(assets, childAsset) {
  return assets.concat([childAsset])
}

export default ({ assetChildren, onChange }) => {
  const [assetIdValue, setAssetIdValue] = useState('')
  const [assetDoc] = useDatabaseDocument(CollectionNames.Assets, assetIdValue)
  const [assetRecord, setAssetRecord] = useState(null)
  const classes = useStyles()

  useEffect(() => {
    if (!assetDoc) {
      return
    }

    async function main() {
      const record = await assetDoc.get()
      const formattedRecord = await formatRawDoc(record)
      setAssetRecord(formattedRecord)
    }

    main()
  }, [assetIdValue, assetDoc === null])

  const onAddBtnClick = () => {
    onChange(addChildAsset(assetChildren, assetDoc))
  }

  return (
    <Paper className={classes.root}>
      <strong>Children</strong>
      <br />
      <p>
        Link other assets to this asset by listing them as "children". They will
        be listed under the description.
      </p>
      Current children:
      <div>
        {assetChildren.map(childAssetDoc => (
          <ChildAsset
            key={childAssetDoc.id}
            assetDoc={childAssetDoc}
            onDelete={() =>
              onChange(removeChildAsset(assetChildren, childAssetDoc))
            }
          />
        ))}
      </div>
      Add a new child by entering a valid ID:
      <TextField
        onChange={e => setAssetIdValue(e.target.value)}
        value={assetIdValue}
      />
      <br />
      {assetRecord ? <AssetResultsItem asset={assetRecord} /> : null}
      <br />
      <Button onClick={onAddBtnClick}>Add</Button>
    </Paper>
  )
}
