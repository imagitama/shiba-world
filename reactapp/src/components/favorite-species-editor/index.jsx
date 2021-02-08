import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

import useDatabaseQuery, {
  CollectionNames,
  ProfileFieldNames,
  options,
  SpeciesFieldNames,
  OrderDirections
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'

const useStyles = makeStyles({
  dropdown: {
    width: '100%'
  },
  controls: {
    textAlign: 'center',
    marginTop: '0.5rem'
  }
})

export default ({ analyticsCategoryName, saveOnSelect = false }) => {
  const classes = useStyles()
  const userId = useFirebaseUserId()
  const [isLoadingProfile, isErroredLoadingProfile, profile] = useDatabaseQuery(
    CollectionNames.Profiles,
    userId,
    {
      [options.queryName]: 'favorite-species-editor-profile'
    }
  )
  const [isLoadingSpecies, isErroredLoadingSpecies, species] = useDatabaseQuery(
    CollectionNames.Species,
    undefined,
    {
      [options.orderBy]: [SpeciesFieldNames.singularName, OrderDirections.ASC],
      [options.queryName]: 'favorite-species-editor-species'
    }
  )
  const [isSaving, isSaveSuccess, isSaveErrored, save] = useDatabaseSave(
    CollectionNames.Profiles,
    userId
  )
  const [newFavoriteSpeciesId, setNewFavoriteSpeciesId] = useState(null)

  useEffect(() => {
    // Check if "bio" is undefined otherwise throws Firebase error
    if (!profile) {
      return
    }
    setNewFavoriteSpeciesId(
      profile[ProfileFieldNames.favoriteSpecies]
        ? profile[ProfileFieldNames.favoriteSpecies].id
        : null
    )
  }, [profile && profile.id])

  const onSaveBtnClick = async overrideSpeciesId => {
    try {
      trackAction(
        analyticsCategoryName,
        'Click save favorite species',
        newFavoriteSpeciesId
      )

      const speciesIdToUse = overrideSpeciesId || newFavoriteSpeciesId

      await save({
        [ProfileFieldNames.favoriteSpecies]: speciesIdToUse
          ? createRef(CollectionNames.Species, speciesIdToUse)
          : null,
        [ProfileFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [ProfileFieldNames.lastModifiedAt]: new Date()
      })
    } catch (err) {
      console.error('Failed to save social media fields to database', err)
      handleError(err)
    }
  }

  if (isLoadingProfile || isLoadingSpecies || !species) {
    return <LoadingIndicator />
  }

  if (isSaving) {
    return <LoadingIndicator message="Saving..." />
  }

  if (isErroredLoadingProfile) {
    return <ErrorMessage>Failed to lookup your user profile</ErrorMessage>
  }

  if (isErroredLoadingSpecies) {
    return <ErrorMessage>Failed to load species</ErrorMessage>
  }

  return (
    <>
      <p>Select your favorite species (optional):</p>
      <Select
        className={classes.dropdown}
        value={newFavoriteSpeciesId}
        variant="outlined"
        onChange={e => {
          const newSpeciesId = e.target.value
          setNewFavoriteSpeciesId(newSpeciesId)

          trackAction(
            analyticsCategoryName,
            'Select different species',
            e.target.value
          )

          if (saveOnSelect) {
            onSaveBtnClick(newSpeciesId)
          }
        }}>
        {species.map(speciesDoc => (
          <MenuItem key={speciesDoc.id} value={speciesDoc.id}>
            {speciesDoc[SpeciesFieldNames.singularName]}
          </MenuItem>
        ))}
      </Select>
      {saveOnSelect !== true && (
        <div className={classes.controls}>
          <Button onClick={onSaveBtnClick}>Save</Button>
          {isSaveSuccess ? ' Saved!' : isSaveErrored ? ' Error' : ''}
        </div>
      )}
    </>
  )
}
