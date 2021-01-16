import React, { useState, useEffect, useRef } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import CheckIcon from '@material-ui/icons/Check'

import { AssetFieldNames, CollectionNames } from '../../hooks/useDatabaseQuery'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'
import { trackAction } from '../../analytics'

const useStyles = makeStyles(theme => ({
  title: {
    color: theme.palette.primary.light
  },
  saveBtn: {
    cursor: 'pointer'
  }
}))

export default ({ assetId, title, onDone, actionCategory }) => {
  const userId = useFirebaseUserId()
  const [newTitleValue, setNewTitleValue] = useState(title)
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Assets,
    assetId
  )
  const classes = useStyles()
  const titleRef = useRef()

  useEffect(() => {
    titleRef.current.focus()
  }, [])

  const onSaveBtnClick = async () => {
    try {
      if (!newTitleValue) {
        return
      }

      trackAction(actionCategory, 'Click save title button')

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
      <span
        ref={titleRef}
        contentEditable={!isSaving}
        onKeyUp={e => setNewTitleValue(e.target.innerText)}
        className={classes.title}>
        {title}
      </span>{' '}
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
