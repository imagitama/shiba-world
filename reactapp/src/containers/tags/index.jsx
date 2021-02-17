import React from 'react'
import { Helmet } from 'react-helmet'

import useDatabaseQuery, {
  CollectionNames,
  options
} from '../../hooks/useDatabaseQuery'

import LoadingIndicator from '../../components/loading-indicator'
import ErrorMessage from '../../components/error-message'
import Heading from '../../components/heading'
import TagChip from '../../components/tag-chip'
import NoResultsMessage from '../../components/no-results-message'

import { popularTagsByCategory } from '../../utils/tags'

const otherTagsCategoryName = 'Uncategorized'

function sortTagEntry(tagEntryA, tagEntryB) {
  if (tagEntryB[0] === otherTagsCategoryName) {
    return -1
  }

  return tagEntryA[0] - tagEntryB[0]
}

function sortByAlpha(a, b) {
  return a.localeCompare(b)
}

function sortTagsInEntry([categoryName, tags]) {
  return [categoryName, tags.sort(sortByAlpha)]
}

function getCategoryForTag(tag) {
  const entries = Object.entries(popularTagsByCategory)

  for (const [categoryName, tagsInCategory] of entries) {
    if (tagsInCategory.includes(tag)) {
      return categoryName
    }
  }

  return ''
}

function Tags() {
  const [isLoading, isErrored, record] = useDatabaseQuery(
    CollectionNames.Summaries,
    'tags',
    {
      [options.queryName]: 'tags'
    }
  )

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored || !record || !record.allTags) {
    return <ErrorMessage>Failed to load tags</ErrorMessage>
  }

  if (!record.allTags.length) {
    return <NoResultsMessage />
  }

  const tagsSortedByCategory = record.allTags.reduce((tagsByCat, tag) => {
    const categoryName = getCategoryForTag(tag) || otherTagsCategoryName
    return {
      ...tagsByCat,
      [categoryName]:
        categoryName in tagsByCat
          ? tagsByCat[categoryName].concat([tag])
          : [tag]
    }
  }, {})

  return (
    <>
      {Object.entries(tagsSortedByCategory)
        .map(sortTagsInEntry)
        .sort(sortTagEntry)
        .map(([categoryName, tagsInCategory]) => (
          <div key={categoryName}>
            <strong>{categoryName}</strong>
            <ul>
              {tagsInCategory.map(tag => (
                <TagChip key={tag} tagName={tag} />
              ))}
            </ul>
          </div>
        ))}
    </>
  )
}

export default () => {
  return (
    <>
      <Helmet>
        <title>Browse tags | VRCArena</title>
        <meta
          name="description"
          content={`See a list of all of the popular tags used on the site.`}
        />
      </Helmet>
      <Heading variant="h1">Browse tags</Heading>
      <Tags />
    </>
  )
}
