import { useEffect, useState, useRef } from 'react'
import createAlgoliaSearchClient from 'algoliasearch'
import { handleError } from '../error-handling'

let client

export default (indexName, keywords, filters = undefined) => {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isErrored, setIsErrored] = useState(false)
  const timerRef = useRef()
  const indexRef = useRef()
  const activeIndexNameRef = useRef()

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

    if (!keywords) {
      return
    }

    async function doIt() {
      try {
        const { hits } = await indexRef.current.search(
          keywords,
          filters
            ? {
                filters
              }
            : {}
        )

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
          { keywords, filters },
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
  }, [indexName, keywords, filters])

  return [isLoading, isErrored, results]
}
