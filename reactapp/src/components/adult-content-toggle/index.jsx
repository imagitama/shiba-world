import React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'

import useDatabaseSave from '../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../hooks/useFirebaseUserId'
import { CollectionNames, UserFieldNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

import { trackAction, actions } from '../../analytics'
import { handleError } from '../../error-handling'
import { createRef } from '../../utils'

export default () => {
  const myUserId = useFirebaseUserId()
  const [isLoadingUser, isErroredUser, user] = useUserRecord()
  const [isSaving, isSaveSuccess, isSaveError, save] = useDatabaseSave(
    CollectionNames.Users,
    user && user.id
  )

  if (isLoadingUser || !user || isSaving) {
    return <LoadingIndicator />
  }

  if (isErroredUser) {
    return <ErrorMessage>Failed to load user account</ErrorMessage>
  }

  if (isSaveError) {
    return <ErrorMessage>Failed to save your changes</ErrorMessage>
  }

  const { [UserFieldNames.enabledAdultContent]: enabledAdultContent } = user

  const onCheckboxChange = async event => {
    const newSettingValue = event.target.checked

    try {
      await save({
        [UserFieldNames.enabledAdultContent]: newSettingValue,
        [UserFieldNames.lastModifiedBy]: createRef(
          CollectionNames.Users,
          myUserId
        ),
        [UserFieldNames.lastModifiedAt]: new Date()
      })

      trackAction(actions.TOGGLE_ENABLED_ADULT_CONTENT, {
        newValue: newSettingValue,
        userId: user.id
      })
    } catch (err) {
      console.error('Failed to save user to toggle adult flag', err)
      handleError(err)
    }
  }

  return (
    <FormControl>
      <FormControlLabel
        control={
          <Checkbox checked={enabledAdultContent} onChange={onCheckboxChange} />
        }
        label="I am over 18 and I want to view adult content."
      />
      {isSaveSuccess && 'Saved successfully'}
    </FormControl>
  )
}
