import { useEffect, useState, useRef } from 'react'
import createAlgoliaSearchClient from 'algoliasearch'
import { handleError } from '../error-handling'

export const Indexes = {
  // TODO: Prod/etc. should come from env vars
  Assets: 'prod_ASSETS'
}

let client

export default (indexName, keywords, filters = undefined) => {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isErrored, setIsErrored] = useState(false)
  const timerRef = useRef()
  const indexRef = useRef()

  useEffect(() => {
    if (!client) {
      client = createAlgoliaSearchClient(
        process.env.REACT_APP_ALGOLIA_APP_ID,
        process.env.REACT_APP_ALGOLIA_SEARCH_API_KEY
      )
    }

    if (!indexRef.current) {
      indexRef.current = client.initIndex(indexName)
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

        setResults(hits)
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
