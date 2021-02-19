import React, { useState, useEffect } from 'react'
import Markdown from '../markdown'
import { makeStyles } from '@material-ui/core/styles'
import TextField from '@material-ui/core/TextField'

import useDatabaseQuery, {
  CollectionNames,
  ProfileFieldNames,
  options
} from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'

import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import Button from '../button'

import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

const useStyles = makeStyles({
  bioTextField: {
    width: '100%'
  },
  controls: {
    textAlign: 'center',
    marginTop: '0.5rem'
  }
})

export default ({ onSaveClick = null }) => {
  const classes = useStyles()
  const userId = useFirebaseUserId()
  const [isLoadingProfile, isErroredLoadingProfile, profile] = useDatabaseQuery(
    CollectionNames.Profiles,
    userId,
    {
      [options.queryName]: 'bio-editor'
    }
  )
  const [isSaving, isSuccess, isErrored, save] = useDatabaseSave(
    CollectionNames.Profiles,
    userId
  )

  const [bioValue, setBioValue] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Check if "bio" is undefined otherwise throws Firebase error
    if (!profile || !profile.bio) {
      return
    }
    setBioValue(profile.bio)
  }, [profile && profile.id])

  const onSaveBtnClick = async () => {
    try {
      if (onSaveClick) {
        onSaveClick()
      }

      await save({
        [ProfileFieldNames.bio]: bioValue,
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

  if (isLoadingProfile) {
    return <LoadingIndicator />
  }

  if (isErroredLoadingProfile) {
    return <ErrorMessage>Failed to lookup your user profile</ErrorMessage>
  }

  return (
    <>
      <TextField
        value={bioValue}
        onChange={e => setBioValue(e.target.value)}
        rows={5}
        multiline
        variant="outlined"
        className={classes.bioTextField}
      />
      <p>
        You can use markdown to <strong>format</strong> <em>your</em> content.
        It is the same as Discord. A guide is here:{' '}
        <a
          href="https://www.markdownguide.org/basic-syntax/"
          target="_blank"
          rel="noopener noreferrer">
          Markdown
        </a>
      </p>
      {isSaving && 'Saving...'}
      {isSuccess
        ? 'Success!'
        : isErrored
        ? 'Failed to save. Maybe try again?'
        : null}
      {showPreview === true && <Markdown source={bioValue} />}
      <div className={classes.controls}>
        {showPreview === false && (
          <>
            <Button onClick={() => setShowPreview(true)} color="default">
              Show Preview
            </Button>{' '}
          </>
        )}
        <Button onClick={onSaveBtnClick} isDisabled={isSaving}>
          Save
        </Button>
      </div>
    </>
  )
}
