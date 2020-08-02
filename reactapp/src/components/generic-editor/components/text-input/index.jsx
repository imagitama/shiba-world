import React from 'react'
import TextField from '@material-ui/core/TextField'

export default ({ onChange, value }) => (
  <TextField onChange={e => onChange(e.target.value)} value={value} />
)
