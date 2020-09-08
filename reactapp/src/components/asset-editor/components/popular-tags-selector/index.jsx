import React from 'react'
import TagChip from '../../../tag-chip'

const popularTags = [
  {
    tag: 'patreon only',
    description:
      'This asset can only be obtained if you are a Patreon subscriber.'
  },
  {
    tag: 'paid model',
    description: 'You must pay money to get this model.'
  },
  {
    tag: 'free model',
    description: 'You do not need to pay any money to get this model.'
  },
  {
    tag: 'wip',
    description:
      'This asset is a work in progress (a big message is shown at the top).'
  },
  {
    tag: 'quest',
    description: 'This asset is Quest compatible.'
  },
  {
    tag: 'sdk3',
    description:
      'This avatar or world is designed for VRCSDK3 (with Udon). It probably will not work with VRCSDK2.'
  },
  {
    tag: 'sdk2',
    description: 'This avatar or world is designed for VRCSDK2.'
  }
]

export default ({ onSelect, currentTags }) =>
  popularTags.map(({ tag: tagName, description }) => (
    <>
      <TagChip
        key={tagName}
        tagName={tagName}
        isDisabled={currentTags.includes(tagName)}
        onClick={() => onSelect(tagName)}
      />{' '}
      {description}
      <br />
    </>
  ))
