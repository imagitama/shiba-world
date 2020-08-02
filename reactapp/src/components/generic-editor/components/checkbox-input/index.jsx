import React from 'react'
import Checkbox from '@material-ui/core/Checkbox'

export default ({ onChange, value }) => (
  <Checkbox onChange={() => onChange(!value)} checked={value} />
)
