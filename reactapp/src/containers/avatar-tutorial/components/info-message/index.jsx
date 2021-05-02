import React from 'react'
import InfoIcon from '@material-ui/icons/Info'
import Message from '../message'

export default ({ message }) => (
  <Message>
    <InfoIcon />
    {message}
  </Message>
)
