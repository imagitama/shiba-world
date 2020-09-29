import { useState } from 'react'
import firebase from 'firebase/app'
import 'firebase/firestore'
import { handleError } from '../error-handling'
import { isRef, getDocument } from '../utils'

function mapRefsToDocuments(fields) {
  const newFields = {}

  for (const fieldName in fields) {
    const fieldValue = fields[fieldName]

    if (isRef(fieldValue)) {
      newFields[fieldName] = getDocument(
        fieldValue.ref.collectionName,
        fieldValue.ref.id
      )
    } else if (Array.isArray(fieldValue)) {
      newFields[fieldName] = fieldValue.map(item => {
        if (isRef(item)) {
          return getDocument(item.ref.collectionName, item.ref.id)
        }
        return item
      })
    } else {
      newFields[fieldName] = fieldValue
    }
  }

  return newFields
}

export default (collectionName, documentId = null) => {
  if (!collectionName) {
    throw new Error('Cannot save to database: no collection name provided!')
  }

  const [isSaving, setIsSaving] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isErrored, setIsErrored] = useState(false)

  const save = async fields => {
    setIsSuccess(false)
    setIsErrored(false)
    setIsSaving(true)

    let document

    try {
      const fieldsWithDocs = mapRefsToDocuments(fields)

      const collection = firebase.firestore().collection(collectionName)

      if (documentId) {
        await collection.doc(documentId).set(fieldsWithDocs, { merge: true })
      } else {
        document = await collection.add(fieldsWithDocs)
      }

      setIsSuccess(true)
      setIsErrored(false)
      setIsSaving(false)

      return [documentId ? documentId : document.id]
    } catch (err) {
      setIsSuccess(false)
      setIsErrored(true)
      setIsSaving(false)
      console.error('Failed to save document', err)
      handleError(err)
    }
  }

  return [isSaving, isSuccess, isErrored, save]
}
