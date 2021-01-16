import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'
import { firestore } from 'firebase/app'

import useAlgoliaSearch from '../../hooks/useAlgoliaSearch'
import { CollectionNames, formatRawDoc } from '../../hooks/useDatabaseQuery'
import Button from '../button'
import Paper from '../paper'
import Heading from '../heading'
import { searchIndexNames } from '../../modules/app'
import { mapRefToDoc } from '../../utils'

const useStyles = makeStyles({
  heading: {
    margin: 0
  }
})

function ChildAsset({ assetDoc, onDelete }) {
  const [asset, setAsset] = useState(null)

  useEffect(() => {
    async function main() {
      const ref = mapRefToDoc(assetDoc)

      const record = await ref.get()
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

function SearchForm({ searchTerm, onSelectId }) {
  const [isSearching, isErrored, results] = useAlgoliaSearch(
    searchIndexNames.ASSETS,
    searchTerm
  )

  if (isSearching) {
    return 'Searching...'
  }

  if (isErrored) {
    return 'Errored'
  }

  if (!results) {
    return null
  }

  if (!results.length) {
    return 'No results!'
  }

  return (
    <>
      {results.map(result => (
        <Button
          key={result.id}
          onClick={() => onSelectId(result.id)}
          variant="default">
          {result.title}
        </Button>
      ))}
    </>
  )
}

function convertDocIdToDocRef(docId) {
  return firestore()
    .collection(CollectionNames.Assets)
    .doc(docId)
}

function AddChildForm({ onAddDoc }) {
  const [searchTerm, setSearchTerm] = useState('')

  const onSelectId = docId => {
    const docRef = convertDocIdToDocRef(docId)
    onAddDoc(docRef)
  }

  return (
    <>
      {searchTerm && (
        <SearchForm searchTerm={searchTerm} onSelectId={onSelectId} />
      )}
      <br />
      Search:
      <TextField
        onChange={e => setSearchTerm(e.target.value)}
        value={searchTerm}
      />
    </>
  )
}

export default ({ assetChildren, onChange }) => {
  const classes = useStyles()

  const onAddDoc = doc => {
    onChange(addChildAsset(assetChildren, doc))
  }

  return (
    <Paper className={classes.root}>
      <Heading variant="h3" className={classes.heading}>
        Linked Assets
      </Heading>
      <p>
        Link other assets to this one. All links will be listed on the asset's
        page.
      </p>
      <strong>Current links:</strong>
      <div>
        {assetChildren && assetChildren.length
          ? assetChildren.map(childAssetDoc => (
              <ChildAsset
                key={childAssetDoc.id}
                assetDoc={childAssetDoc}
                onDelete={() =>
                  onChange(removeChildAsset(assetChildren, childAssetDoc))
                }
              />
            ))
          : 'No links yet'}
      </div>
      <br />
      <strong>Add link:</strong>
      <br />
      <AddChildForm onAddDoc={onAddDoc} />
    </Paper>
  )
}
