import React from 'react'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import useDatabase from '../../hooks/useDatabase'
import withAuthProfile from '../../hocs/withAuthProfile'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import useDatabaseSave from '../../hooks/useDatabaseSave'
import { trackAction, actions } from '../../analytics'
import { CollectionNames } from '../../hooks/useDatabaseQuery'

export default withAuthProfile(({ auth }) => {
  const userId = auth.uid
  const [isLoading, isErrored, user, forceRefreshUser] = useDatabase(
    CollectionNames.Users,
    userId
  )
  const [isSaving, hasSavingSucceededOrFailed, save] = useDatabaseSave(
    CollectionNames.Users,
    userId
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
                  enabledAdultContent: newSettingValue
                })

                forceRefreshUser()

                trackAction(actions.TOGGLE_ENABLED_ADULT_CONTENT, {
                  newValue: newSettingValue,
                  userId
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
})
