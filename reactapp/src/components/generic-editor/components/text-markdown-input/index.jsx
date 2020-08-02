import React from 'react'
import TextField from '@material-ui/core/TextField'
import Markdown from 'react-markdown'

export default ({ onChange, value }) => (
  <>
    <TextField
      onChange={e => onChange(e.target.value)}
      value={value}
      rows={10}
      multiline
    />
    <Markdown source={value} />
  </>
)
