import React from 'react'
import WarningIcon from '@material-ui/icons/Warning'
import Message from '../message'

export default ({ message }) => (
  <Message>
    <WarningIcon />
    {message}
  </Message>
)
