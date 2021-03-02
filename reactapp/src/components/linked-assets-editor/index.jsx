import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import TextInput from '../text-input'
import Button from '../button'

import { CollectionNames, AssetFieldNames } from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useAlgoliaSearch from '../../hooks/useAlgoliaSearch'
import { searchIndexNames } from '../../modules/app'
import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'
import AssetResultsItem from '../asset-results-item'

const useStyles = makeStyles({
  textInput: {
    width: '100%'
  },
  row: {
    marginTop: '1rem'
  },
  assets: {
    display: 'flex'
  }
})

function LinkedAsset({ asset, onRemove }) {
  return (
    <div>
      <AssetResultsItem asset={asset} />
      <Button onClick={onRemove} color="default">
        Remove
      </Button>
    </div>
  )
}

function SearchForm({ searchTerm, onSelectIdWithDetails }) {
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

  if (!results || !results.length) {
    return 'No results!'
  }

  return (
    <>
      {results.map(result => (
        <Button
          key={result.id}
          onClick={() => onSelectIdWithDetails(result.id, result)}
          variant="default">
          {result[AssetFieldNames.title]}
        </Button>
      ))}
    </>
  )
}

const convertLinkedAssetsForDoc = linkedAssets =>
  linkedAssets.map(linkedAsset =>
    createRef(CollectionNames.Assets, linkedAsset.id)
  )

export default ({
  assetId,
  linkedAssets = [],
  actionCategory,
  onSave = null,
  onDone = null
}) => {
  const userId = useFirebaseUserId()
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [searchTerm, setSearchTerm] = useState(null)
  const [newLinkedAssets, setNewLinkedAssets] = useState(linkedAssets)
  const classes = useStyles()

  if (!userId) {
    return 'You are not logged in'
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isSuccess) {
    return 'Asset saved successfully'
  }

  if (isFailed) {
    return 'Error saving author'
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save linked assets button', assetId)

      const newChildren = convertLinkedAssetsForDoc(newLinkedAssets)

      if (onSave) {
        onSave(newChildren)
        return
      }

      await save({
        [AssetFieldNames.children]: newChildren,
        lastModifiedAt: new Date(),
        lastModifiedBy: createRef(CollectionNames.Users, userId)
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  const onSelectIdWithDetails = (id, details) => {
    setNewLinkedAssets(currentVal =>
      currentVal.concat([
        {
          id,
          ...details
        }
      ])
    )
  }

  const removeAssetById = id => {
    setNewLinkedAssets(currentVal =>
      currentVal.filter(asset => asset.id !== id)
    )
  }

  console.log('newLinkedAssets', newLinkedAssets)

  return (
    <>
      {newLinkedAssets.length ? (
        <div className={classes.assets}>
          {newLinkedAssets.map(linkedAsset => (
            <LinkedAsset
              key={linkedAsset.id}
              asset={linkedAsset}
              onRemove={() => removeAssetById(linkedAsset.id)}
            />
          ))}
        </div>
      ) : (
        'No linked assets yet'
      )}
      <>
        <div className={classes.row}>
          {searchTerm && (
            <>
              <SearchForm
                searchTerm={searchTerm}
                onSelectIdWithDetails={onSelectIdWithDetails}
              />
            </>
          )}
        </div>

        <div className={classes.row}>
          Search asset titles:
          <TextInput
            onChange={e => setSearchTerm(e.target.value)}
            value={searchTerm}
            variant="filled"
            className={classes.textInput}
          />
        </div>

        <div className={classes.row}>
          <Button onClick={onSaveBtnClick}>Save</Button>
        </div>
      </>
    </>
  )
}
