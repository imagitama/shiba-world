import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import TagChip from '../tag-chip'
import Button from '../button'
import { cleanupTags, popularTagsByCategory } from '../../utils/tags'

const useStyles = makeStyles({
  textInput: {
    width: '100%',
    margin: '0.5rem 0'
  },
  btns: {
    textAlign: 'center',
    marginTop: '1rem'
  }
})

const convertTextIntoTags = text => (text ? text.split('\n') : [])
const convertTagsIntoText = tags => (tags ? tags.join('\n') : '')

const mergeInNewTags = (currentTags, newTags) => {
  const mergedTags = currentTags.concat(newTags)

  return mergedTags.filter((tag, idx) => mergedTags.indexOf(tag) === idx)
}

// NOTE: onChange does not cleanup tags for you (onDone does)
export default ({ currentTags = [], onChange, onDone, showInfo = true }) => {
  const classes = useStyles()
  const [newTags, setNewTags] = useState(currentTags)

  useEffect(() => {
    if (currentTags) {
      setNewTags(currentVal => mergeInNewTags(currentVal, currentTags))
    }
  }, [currentTags ? currentTags.join('+') : null])

  const onClickPopularTag = tag =>
    setNewTags(currentVal => currentVal.concat([tag]))
  const onClickExistingTag = tag =>
    setNewTags(currentVal => currentVal.filter(item => item !== tag))

  return (
    <>
      {showInfo && (
        <>
          Use tags to help people find your asset. Rules:
          <ul>
            <li>
              tag what you know from the description/source (eg. "quest" if
              quest compatible)
            </li>
            <li>
              tag what you can see in the images (eg. "hat" if it comes with a
              hat)
            </li>
            <li>do not use spaces (use underscores)</li>
            <li>one tag per line</li>
            <li>all lowercase</li>
          </ul>
          Popular tags:
          <br />
          {Object.entries(popularTagsByCategory).map(([category, tags]) => (
            <>
              {category}
              <div>
                {tags.map(tagName => (
                  <TagChip
                    key={tagName}
                    tagName={tagName}
                    isDisabled={newTags.includes(tagName)}
                    onClick={() => onClickPopularTag(tagName)}
                  />
                ))}
              </div>
            </>
          ))}
        </>
      )}
      <TextField
        variant="outlined"
        className={classes.textInput}
        value={convertTagsIntoText(newTags)}
        onChange={e => {
          const newVal = convertTextIntoTags(e.target.value)

          setNewTags(newVal)

          if (onChange) {
            onChange(newVal)
          }
        }}
        rows={10}
        multiline
      />
      Click to remove:{' '}
      {cleanupTags(newTags).map(tagName => (
        <TagChip
          key={tagName}
          tagName={tagName}
          onClick={() => onClickExistingTag(tagName)}
        />
      ))}
      {onDone && (
        <div className={classes.btns}>
          <Button onClick={() => onDone(cleanupTags(newTags))}>Done</Button>
        </div>
      )}
    </>
  )
}
