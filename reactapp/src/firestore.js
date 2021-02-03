import firebase from 'firebase/app'
import { isRef, mapRefToDoc } from './utils'

// intended for simple, one-time FIRE AND FORGET delete of a record eg. notifications
// do NOT use for anything else - use a React hook with nice UI
export function quickDeleteRecord(collectionName, id) {
  return firebase
    .firestore()
    .collection(collectionName)
    .doc(id)
    .delete()
}

// as above - one-time FIRE AND FORGET delete of records eg. clear all notifications
export async function quickDeleteRecords(collectionName, whereClauses) {
  const query = firebase.firestore().collection(collectionName)

  if (!whereClauses || !whereClauses.length) {
    throw new Error('Need where clauses')
  }

  whereClauses.forEach(([fieldName, operator, value]) => {
    if (isRef(value)) {
      value = mapRefToDoc(value)
    }

    query.where(fieldName, operator, value)
  })

  const { docs } = await query.get()

  console.log(docs)

  return Promise.all(docs.map(doc => doc.ref.delete()))
}

export async function quickReadRecord(collectionName, id) {
  const doc = await firebase
    .firestore()
    .collection(collectionName)
    .doc(id)
    .get()

  return doc.data()
}

export async function doesDocumentExist(collectionName, id) {
  const doc = await firebase
    .firestore()
    .collection(collectionName)
    .doc(id)
    .get()

  return doc.exists
}
