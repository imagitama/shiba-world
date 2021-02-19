import React from 'react'
import TextInput from '../../../text-input'
import Markdown from '../../../markdown'

export default ({ onChange, value }) => (
  <>
    <TextInput
      onChange={e => onChange(e.target.value)}
      value={value}
      rows={10}
      multiline
    />
    <Markdown source={value} />
  </>
)
