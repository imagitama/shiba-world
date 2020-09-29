import React, { useEffect, useState } from 'react'
import Chip from '@material-ui/core/Chip'
import { makeStyles } from '@material-ui/core/styles'

import Button from '../button'

import useDatabaseQuery, {
  CollectionNames,
  AssetFieldNames,
  SpeciesFieldNames
} from '../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'

import { handleError } from '../../error-handling'
import { trackAction } from '../../analytics'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  chip: { margin: '0 0.25rem 0.25rem 0' }
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
    CollectionNames.Species
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

function convertSpeciesIntoRefs(species) {
  return species.map(item => createRef(CollectionNames.Species, item.id))
}

export default ({ assetId, actionCategory = '', onDone = null }) => {
  const userId = useFirebaseUserId()
  const [isLoading, isError, result] = useDatabaseQuery(
    CollectionNames.Assets,
    assetId
  )
  const [isSaving, isSuccess, isFailed, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const [newSpeciesRefs, setNewSpeciesRefs] = useState(null)

  useEffect(() => {
    if (!result) {
      return
    }

    setNewSpeciesRefs(convertSpeciesIntoRefs(result[AssetFieldNames.species]))
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
    console.log(speciesId)
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
      <Button onClick={onSaveBtnClick}>Save</Button>
    </>
  )
}
