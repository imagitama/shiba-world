import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'
import TextInput from '../text-input'

const useStyles = makeStyles(theme => ({
  title: {
    color: theme.palette.primary.light,
    '&:focus': {
      outline: 'none'
    }
  },
  saveBtn: {
    cursor: 'pointer'
  }
}))

export default ({
  assetId,
  title,
  onDone,
  actionCategory,
  showSimpleInput = false
}) => {
  const userId = useFirebaseUserId()
  const [newTitleValue, setNewTitleValue] = useState(title)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const titleRef = useRef()

  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.focus()
    }
  }, [])

  const onSaveBtnClick = async () => {
    try {
      trackAction(actionCategory, 'Click save title button')

      if (newTitleValue === title) {
        console.log(
          'Cannot save the asset title: new title is the same as the original'
        )
        onDone()
        return
      }

      await save({
        [AssetFieldNames.title]: newTitleValue,
        [AssetFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          userId
        ),
        [AssetFieldNames.lastModifiedAt]: new Date()
      })

      onDone()
    } catch (err) {
      console.error('Failed to save asset title', err)
      handleError(err)
    }
  }

  return (
    <>
      {showSimpleInput ? (
        <TextInput
          value={newTitleValue}
          onChange={e => setNewTitleValue(e.target.value)}
        />
      ) : (
        <span
          ref={titleRef}
          contentEditable={!isSaving}
          onKeyUp={e => setNewTitleValue(e.target.innerText)}
          className={classes.title}>
          {title}
        </span>
      )}{' '}
      {isSaving ? (
        'Saving...'
      ) : isSaveSuccess ? (
        'Success!'
      ) : isSaveError ? (
        'Error'
      ) : (
        <CheckIcon className={classes.saveBtn} onClick={onSaveBtnClick} />
      )}
    </>
  )
}
