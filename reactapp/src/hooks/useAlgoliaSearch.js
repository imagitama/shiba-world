import { useEffect, useState, useRef } from 'react'
import createAlgoliaSearchClient from 'algoliasearch'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { handleError } from '../error-handling'
import { searchIndexNames } from '../modules/app'
import { CollectionNames, UserFieldNames } from './useDatabaseQuery'

let client

// source: https://stackoverflow.com/a/65642284/1215393
const splitStringByMultiple = (str, splitters) =>
  splitters.reduce((old, c) => old.map(v => v.split(c)).flat(), [str])

const getTagsFilter = keywords => {
  const tagsToSearch = splitStringByMultiple(keywords, [' ', ',']).map(tag =>
    tag.trim().toLowerCase()
  )
  //return `tags:"${tagsToSearch.join(' ')}"`
  return `(${tagsToSearch.map(tag => `tags:"${tag}"`).join(' AND ')})`
}

const getCollectionNameForIndexName = indexName => {
  switch (indexName) {
    case searchIndexNames.USERS:
      return CollectionNames.Users
  }
}

const performDevelopmentSearch = async (indexName, searchTerm) => {
  const query = firebase
    .firestore()
    .collection(getCollectionNameForIndexName(indexName))

  switch (indexName) {
    case searchIndexNames.USERS:
      // query.where('username', '==', searchTerm)
      const { docs } = await query.get()
      return docs.map(doc => ({ id: doc.id, ...doc.data() }))
  }
}

export default (
  indexName,
  keywords,
  filters = undefined,
  filterByTags = false
) => {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isErrored, setIsErrored] = useState(false)
  const timerRef = useRef()
  const indexRef = useRef()
  const activeIndexNameRef = useRef()

  // filter out "undefined"
  const filtersStr =
    typeof filters === 'string'
      ? filters
      : filters
      ? filters.filter(item => item).join(' AND ')
      : ''

  useEffect(() => {
    if (!client) {
      client = createAlgoliaSearchClient(
        process.env.REACT_APP_ALGOLIA_APP_ID,
        process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY
      )
    }

    if (
      !activeIndexNameRef.current ||
      activeIndexNameRef.current !== indexName
    ) {
      activeIndexNameRef.current = indexName
      indexRef.current = client.initIndex(activeIndexNameRef.current)
    }

    async function doIt() {
      try {
        console.debug(
          `search "${indexName}" with "${keywords}" filter "${filtersStr}"`
        )

        if (process.env.NODE_ENV === 'development') {
          const hitsWithId = await performDevelopmentSearch(indexName, keywords)
          setResults(hitsWithId)
          setIsLoading(false)
          setIsErrored(false)
          return
        }

        let hits = []

        if (filterByTags) {
          const tagsFilter = getTagsFilter(keywords)

          console.debug(`filtering by tags: ${tagsFilter}`)

          await indexRef.current.browseObjects({
            query: '',
            filters: filtersStr
              ? `${filtersStr} AND ${tagsFilter}`
              : tagsFilter,
            batch: batch => {
              hits = hits.concat(batch)
            }
          })
        } else {
          const result = await indexRef.current.search(keywords, {
            filters: filtersStr,
            hitsPerPage: 100
          })
          hits = result.hits
        }

        const hitsWithId = hits.map(hit => ({
          ...hit,
          id: hit.objectID
        }))

        setResults(hitsWithId)
        setIsLoading(false)
        setIsErrored(false)
      } catch (err) {
        console.error(
          'Failed to search with algolia',
          { keywords, filtersStr },
          err
        )
        setIsLoading(false)
        setIsErrored(true)
        handleError(err)
      }
    }

    setIsLoading(true)
    setIsErrored(false)

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => doIt(), 500)
  }, [indexName, keywords, filtersStr, filterByTags])

  return [isLoading, isErrored, results]
}
