import React from 'react'
import { writeStorage } from '@rehooks/local-storage'
import { useDispatch } from 'react-redux'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormControl from '@material-ui/core/FormControl'
import useStorage, { keys } from '../../hooks/useStorage'
import { trackAction, actions } from '../../analytics'
import { toggleDarkMode } from '../../modules/app'

export default () => {
  const [isDarkModeEnabled] = useStorage(keys.darkModeEnabled, false)
  const dispatch = useDispatch()

  const onCheckboxChange = () => {
    const newValue = !isDarkModeEnabled
    writeStorage(keys.darkModeEnabled, newValue)

    dispatch(toggleDarkMode())

    trackAction(actions.TOGGLE_DARK_MODE, {
      newValue
    })
  }

  return (
    <FormControl>
      <FormControlLabel
        control={
          <Checkbox checked={isDarkModeEnabled} onChange={onCheckboxChange} />
        }
        label="Dark mode enabled"
      />
    </FormControl>
  )
}
