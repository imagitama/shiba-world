import React from 'react'
import useStorage, { keys } from '../../hooks/useStorage'
import { trackAction } from '../../analytics'
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

  const onBtnClick = () => {
    setHiddenSpecialEventNames(hiddenSpecialEventNames.concat([eventName]))
    trackAction('Global', 'Click hide fireworks button', eventName)
  }

  return (
    <>
      {message && (
        <Message style={{ width: '100%' }}>
          <span style={{ width: '100%' }}>
            {message}
            <br />
            <br />
            <Button onClick={onBtnClick}>OK please hide these fireworks</Button>
          </span>
        </Message>
      )}
      <div className="fireworks">
        <div class="before" />
        <div class="after" />
      </div>
    </>
  )
}
