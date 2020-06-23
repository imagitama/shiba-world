import React from 'react'
import moment from 'moment'

export default ({ date, isRelative = true }) => (
  <span title={moment(date).toString()}>
    {isRelative ? moment(date).fromNow() : moment(date).toString()}
  </span>
)
