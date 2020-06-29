import React, { Fragment } from 'react'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import { makeStyles } from '@material-ui/core/styles'
import Hint from '../form-field-hint'

const useStyles = makeStyles({
  formFieldRoot: { padding: '2rem' },
  fileAttacherItem: { margin: '0 0 1rem 0', padding: '2rem' },
  fileAttacherUploader: { padding: '2rem' },
  advancedModeBtn: { margin: '0.5rem 0' },
  controls: { marginTop: '2rem', textAlign: 'center' },
  accidentalUploadMsg: {
    padding: '2rem',
    fontWeight: 'bold',
    fontSize: '150%'
  }
})

export const formFieldType = {
  text: 'text',
  checkbox: 'checkbox',
  dropdown: 'dropdown'
}

export default ({
  label,
  type = formFieldType.text,
  value,
  hint,
  convertToValidField,
  options,
  onChange,
  isRequired,
  ...textFieldProps
}) => {
  const classes = useStyles()
  return (
    <Paper className={classes.formFieldRoot}>
      <FormControl fullWidth>
        {type === formFieldType.text ? (
          <TextField
            label={label}
            value={value || ''}
            onChange={event =>
              onChange(
                convertToValidField
                  ? convertToValidField(event.target.value)
                  : event.target.value
              )
            }
            {...textFieldProps}
          />
        ) : type === formFieldType.dropdown ? (
          <Select
            label={label}
            value={value}
            onChange={event =>
              onChange(
                convertToValidField
                  ? convertToValidField(event.target.value)
                  : event.target.value
              )
            }
            {...textFieldProps}>
            {options.map(option => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <FormControlLabel
            control={
              <Checkbox
                checked={value}
                onChange={event => onChange(event.target.checked)}
              />
            }
            label={label}
          />
        )}
        <Hint>
          {typeof hint === 'string'
            ? hint.split('\n').map((hint, idx) => (
                <Fragment key={hint}>
                  {idx !== 0 && <br />}
                  {hint}
                </Fragment>
              ))
            : hint}
        </Hint>
      </FormControl>
    </Paper>
  )
}
