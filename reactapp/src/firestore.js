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

  console.debug('quickDeleteRecords', collectionName, whereClauses)

  whereClauses.forEach(([fieldName, operator, value]) => {
    if (isRef(value)) {
      value = mapRefToDoc(value)
      console.log('map ref', value, 'to', value.id)
    }

    console.debug(`where`, fieldName, operator, value)

    query.where(fieldName, operator, value)
  })

  const { docs } = await query.get()

  const batch = firebase.firestore().batch()

  for (const doc of docs) {
    console.debug(`deleting doc ${doc.id}`)
    batch.delete(doc.ref)
  }

  await batch.commit()
}

export async function quickDeleteRefs(refs) {
  const batch = firebase.firestore().batch()

  for (let val of refs) {
    console.log('checking is ref', val)
    if (isRef(val)) {
      val = mapRefToDoc(val)
    }
    batch.delete(val)
  }

  await batch.commit()
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
