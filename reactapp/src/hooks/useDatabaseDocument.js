import { useEffect, useState } from 'react'
import firebase from 'firebase/app'

export default (collectionName, documentId) => {
  if (!collectionName) {
    throw new Error('Cannot use database document: no collection name provided')
  }

  const [document, setDocument] = useState(null)

  useEffect(() => {
    if (!documentId) {
      return
    }

    const doc = firebase
      .firestore()
      .collection(collectionName)
      .doc(documentId)

    setDocument(doc)
  }, [collectionName, documentId])

  return [document]
}
