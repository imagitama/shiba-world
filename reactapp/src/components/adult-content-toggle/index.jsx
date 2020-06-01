import React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { trackAction, actions } from '../../analytics'
import { CollectionNames, UserFieldNames } from '../../hooks/useDatabaseQuery'
import useUserRecord from '../../hooks/useUserRecord'

export default () => {
  const [isLoading, isErrored, user] = useUserRecord()
  const [isSaving, hasSavingSucceededOrFailed, save] = useDatabaseSave(
    CollectionNames.Users,
    user && user.id
  )

  if (isLoading || !user || isSaving) {
    return <LoadingIndicator />
  }

  if (isErrored || hasSavingSucceededOrFailed === false) {
    return (
      <ErrorMessage>
        {isErrored
          ? 'Failed to load user account'
          : hasSavingSucceededOrFailed === false
          ? 'Failed to save your changes'
          : 'Unknown'}
      </ErrorMessage>
    )
  }

  return (
    <FormControl>
      <FormControlLabel
        control={
          <Checkbox
            checked={user.enabledAdultContent}
            onChange={async event => {
              const newSettingValue = event.target.checked

              try {
                await save({
                  [UserFieldNames.enabledAdultContent]: newSettingValue
                })

                trackAction(actions.TOGGLE_ENABLED_ADULT_CONTENT, {
                  newValue: newSettingValue,
                  userId: user.id
                })
              } catch (err) {
                console.error('Failed to save user to toggle adult flag', err)
              }
            }}
          />
        }
        label="I am over 18 and I want to view adult content."
      />
      {hasSavingSucceededOrFailed === true && 'Saved successfully'}
    </FormControl>
  )
}
