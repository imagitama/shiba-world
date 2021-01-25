import React, { useState, useEffect } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import TagChip from '../tag-chip'
import Button from '../button'
import { cleanupTags } from '../../utils/tags'

const useStyles = makeStyles({
  textInput: {
    width: '100%',
    margin: '0.5rem 0'
  }
})

const convertTextIntoTags = text => (text ? text.split('\n') : [])
const convertTagsIntoText = tags => (tags ? tags.join('\n') : '')

const mergeInNewTags = (currentTags, newTags) => {
  const mergedTags = currentTags.concat(newTags)

  return mergedTags.filter((tag, idx) => mergedTags.indexOf(tag) === idx)
}

const popularTags = [
  'paid',
  'free',
  'quest',
  'low_poly',
  'sdk2',
  'sdk3',
  'patreon_only',
  'wip',
  'rigged',
  'puppeted',
  'dynamic_bones',
  'full_body_ready',
  'collar',
  'cute'
]

// NOTE: onChange does not cleanup tags for you (onDone does)
export default ({ currentTags = [], onChange, onDone }) => {
  const classes = useStyles()
  const [newTags, setNewTags] = useState(currentTags)

  useEffect(() => {
    if (currentTags) {
      setNewTags(currentVal => mergeInNewTags(currentVal, currentTags))
    }
  }, [currentTags ? currentTags.join('+') : null])

  const onClickPopularTag = tag => setNewTags(newTags.concat([tag]))

  return (
    <>
      Use tags to help people find your asset. Rules:
      <ul>
        <li>
          tag what you know from the description/source (eg. "quest" if quest
          compatible)
        </li>
        <li>
          tag what you can see in the images (eg. "hat" if it comes with a hat)
        </li>
        <li>do not use spaces (use underscores)</li>
        <li>one tag per line</li>
        <li>all lowercase</li>
        <li>do not use the species name, author name or asset name as a tag</li>
      </ul>
      Popular tags:{' '}
      {popularTags.map(tagName => (
        <TagChip
          key={tagName}
          tagName={tagName}
          isDisabled={newTags.includes(tagName)}
          onClick={() => onClickPopularTag(tagName)}
        />
      ))}
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
      {cleanupTags(newTags).map(tagName => (
        <TagChip key={tagName} tagName={tagName} />
      ))}
      {onDone && (
        <Button onClick={() => onDone(cleanupTags(newTags))}>Done</Button>
      )}
    </>
  )
}