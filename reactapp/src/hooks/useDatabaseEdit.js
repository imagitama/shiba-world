import { useState, useEffect } from 'react'
import { firestore } from 'firebase/app'
import { handleError } from '../error-handling'

const secondsToDate = seconds => new Date(seconds * 1000)

const mapDates = doc => {
  const entries = Object.entries(doc)

  const newDoc = entries.reduce((finalDoc, [key, value]) => {
    return {
      ...finalDoc,
      [key]:
        value && value.hasOwnProperty('seconds')
          ? secondsToDate(value.seconds)
          : value
    }
  }, {})

  return newDoc
}

export default (collectionName, documentId) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isErrored, setIsErrored] = useState(false)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (!documentId) {
      return
    }

    const getData = async () => {
      setIsLoading(true)

      try {
        const doc = await firestore()
          .collection(collectionName)
          .doc(documentId)
          .get()
        const data = await doc.data()

        if (!data) {
          setIsLoading(false)
          setResult(null)
          return
        }

        const docsWithDates = mapDates(data)

        setIsLoading(false)
        setResult(docsWithDates)
        return
      } catch (err) {
        setIsErrored(true)
        setIsLoading(false)
        console.error('Failed to use database for editing', err)
        handleError(err)
      }
    }

    getData()
  }, [documentId])

  return [isLoading, isErrored, result]
}
