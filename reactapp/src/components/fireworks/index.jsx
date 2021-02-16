import React from 'react'
import useStorage, { keys } from '../../hooks/useStorage'
import Message from '../message'
import Button from '../button'
import './fireworks.css'

export default ({ eventName = '', message = '' }) => {
  const [hiddenSpecialEventNames, setHiddenSpecialEventNames] = useStorage(
    keys.hiddenSpecialEventNames,
    []
  )

  if (eventName && hiddenSpecialEventNames.includes(eventName)) {
    return null
  }

  const onBtnClick = () =>
    setHiddenSpecialEventNames(hiddenSpecialEventNames.concat([eventName]))

  return (
    <>
      {message && (
        <Message>
          {message}
          <br />
          <br />
          <Button onClick={onBtnClick}>OK please hide these fireworks</Button>
        </Message>
      )}
      <div className="fireworks">
        <div class="before" />
        <div class="after" />
      </div>
    </>
  )
}
