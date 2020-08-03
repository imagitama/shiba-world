import React from 'react'
import TagChip from '../../../tag-chip'

const popularTags = ['patreon only', 'paid model', 'free model', 'wip']

export default ({ onSelect, currentTags }) =>
  popularTags.map(tagName => (
    <TagChip
      key={tagName}
      tagName={tagName}
      isDisabled={currentTags.includes(tagName)}
      onClick={() => onSelect(tagName)}
    />
  ))
