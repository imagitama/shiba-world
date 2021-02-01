import React, { useEffect, useState } from 'react'
import Chip from '@material-ui/core/Chip'
import { makeStyles } from '@material-ui/core/styles'

import Button from '../button'

import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  SpeciesFieldNames,
  OrderDirections,
  options
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  chip: { margin: '0 0.25rem 0.25rem 0' },
  btns: {
    textAlign: 'center',
    marginTop: '1rem'
  }
})

function isSpeciesActive(species, allActiveSpeciesRefs) {
  return allActiveSpeciesRefs.find(
    speciesItem => speciesItem.ref.id === species.id
  )
}

function isSpeciesIdActive(speciesId, allActiveSpeciesRefs) {
  return allActiveSpeciesRefs.find(
    speciesItem => speciesItem.ref.id === speciesId
  )
}

function SpeciesButtons({ activeSpeciesRefs, onClickSpeciesWithId }) {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Species,
    undefined,
    {
      [options.orderBy]: [SpeciesFieldNames.singularName, OrderDirections.ASC],
      [options.queryName]: 'change-species-editor-species-buttons'
    }
  )
  const classes = useStyles()

  if (isLoading) {
    return 'Loading species...'
  }

  if (isErrored || !results || !results.length) {
    return 'Error loading species'
  }

  return (
    <span>
      {results.map(result => (
        <Chip
          key={result.id}
          className={classes.chip}
          label={result[SpeciesFieldNames.singularName]}
          color={
            isSpeciesActive(result, activeSpeciesRefs) ? 'primary' : undefined
          }
          onClick={() => onClickSpeciesWithId(result.id)}
        />
      ))}
    </span>
  )
}

const mapSpeciesToRef = speciesDocs =>
  speciesDocs
    .filter(item => item.id)
    .map(item => createRef(CollectionNames.Species, item.id))

// TODO: Save one query by providing the existing species to this component
export default ({ assetId, actionCategory = '', onDone = null }) => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, result] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId,
    {
      [options.queryName]: 'change-species-editor'
    }
  )
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [newSpeciesRefs, setNewSpeciesRefs] = useState(null)
  const classes = useStyles()

  useEffect(() => {
    if (!result) {
      return
    }

    setNewSpeciesRefs(mapSpeciesToRef(result[AssetFieldNames.species]))
  }, [result !== null])

  if (!userId) {
    return 'You are not logged in'
  }

  if (isLoading || !newSpeciesRefs) {
    return 'Loading...'
  }

  if (isError || !result) {
    return 'Error loading resource'
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isSuccess) {
    return 'Species has been changed'
  }

  if (isFailed) {
    return 'Error saving new species'
  }

  const onClickSpeciesWithId = speciesId => {
    setNewSpeciesRefs(currentVal => {
      if (isSpeciesIdActive(speciesId, newSpeciesRefs)) {
        return currentVal.filter(item => item.ref.id !== speciesId)
      } else {
        return currentVal.concat([
          createRef(CollectionNames.Species, speciesId)
        ])
      }
    })
  }

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save change species button', assetId)

      await save({
        [AssetFieldNames.species]: newSpeciesRefs,
        [AssetFieldNames.lastModifiedAt]: new Date(),
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        )
      })

      if (onDone) {
        onDone()
      }
    } catch (err) {
      console.error(err)
      handleError(err)
    }
  }

  return (
    <>
      <SpeciesButtons
        activeSpeciesRefs={newSpeciesRefs}
        onClickSpeciesWithId={onClickSpeciesWithId}
      />
      <div className={classes.btns}>
        <Button onClick={onSaveBtnClick}>Save</Button>
      </div>
    </>
  )
}
