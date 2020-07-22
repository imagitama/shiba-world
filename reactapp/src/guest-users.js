import Cookies from 'js-cookie'
import shortid from 'shortid'
import { firestore } from 'firebase/app'
import { handleError } from './error-handling'
import {
  CollectionNames,
  GuestUsersFieldNames,
  Operators
} from './hooks/useDatabaseQuery'

function generateGuestId() {
  return shortid.generate()
}

const localStorageKey = 'guestid'

function storeGuestIdInLocalStorage(id) {
  localStorage.setItem(localStorageKey, id)
}

function retrieveGuestIdFromLocalStorage() {
  return localStorage.getItem(localStorageKey)
}

const cookieName = 'guestid'

function storeGuestIdInCookie(id) {
  Cookies.set(cookieName, id)
}

function retrieveGuestIdFromCookie() {
  return Cookies.get(cookieName)
}

function parseTraceResponse(txt) {
  return txt
    .split('\n')
    .map(line => line.split('='))
    .reduce(
      (result, [key, val]) => ({
        ...result,
        [key]: val
      }),
      {}
    )
}

async function lookupGuestIdWithIpAddress(ipAddress) {
  if (!ipAddress) {
    throw new Error(
      'Cannot lookup guest ID with IP address: no IP address provided!'
    )
  }

  const { docs } = await firestore()
    .collection(CollectionNames.GuestUsers)
    .where(GuestUsersFieldNames.ipAddress, Operators.EQUALS, ipAddress)
    .get()

  // Comment this out to fix error https://sentry.io/organizations/imagitama/issues/1788950185
  // if (docs.length > 1) {
  //   throw new Error(`Multiple docs found with IP address ${ipAddress}`)
  // }

  if (!docs.length) {
    return null
  }

  const data = docs[0].data()
  return data.id
}

async function storeGuestIdInDatabase(guestId, ipAddress) {
  if (!guestId) {
    throw new Error('Cannot store guest ID in db - no guest ID!')
  }
  if (!ipAddress) {
    throw new Error('Cannot store guest ID in db - no IP address!')
  }

  return firestore()
    .collection(CollectionNames.GuestUsers)
    .doc(guestId)
    .set({
      [GuestUsersFieldNames.ipAddress]: ipAddress,
      [GuestUsersFieldNames.createdAt]: new Date()
    })
}

export async function getUserIp() {
  try {
    const resp = await fetch('https://www.cloudflare.com/cdn-cgi/trace')

    if (!resp.ok) {
      throw new Error('Talking to CloudFlare failed')
    }

    const txt = await resp.text()

    const data = parseTraceResponse(txt)

    return data.ip
  } catch (err) {
    console.error(err)
    handleError(err)
  }
}

export function isReturningGuestUser() {
  const guestIdFromLocalStorage = retrieveGuestIdFromLocalStorage()

  if (guestIdFromLocalStorage) {
    return true
  }

  const guestIdFromCookie = retrieveGuestIdFromCookie()

  if (guestIdFromCookie) {
    return true
  }

  return false
}

export async function storeGuestId(guestId, ipAddress) {
  if (!guestId) {
    throw new Error('Cannot store guest ID: no guest ID provided!')
  }
  if (!ipAddress) {
    throw new Error('Cannot store IP address: no IP address is provided!')
  }

  storeGuestIdInCookie(guestId)
  storeGuestIdInLocalStorage(guestId)

  await storeGuestIdInDatabase(guestId, ipAddress)
}

export async function getGuestIdFromStorage() {
  const guestIdFromLocalStorage = retrieveGuestIdFromLocalStorage()

  if (guestIdFromLocalStorage) {
    return Promise.resolve(guestIdFromLocalStorage)
  }

  const guestIdFromCookie = retrieveGuestIdFromCookie()

  if (guestIdFromCookie) {
    return Promise.resolve(guestIdFromCookie)
  }

  const ipAddress = await getUserIp()

  // Rare but it can happen (https://sentry.io/organizations/imagitama/issues/1795702728/?project=5249930&query=is%3Aunresolved)
  if (ipAddress) {
    const guestIdFromDatabase = await lookupGuestIdWithIpAddress(ipAddress)

    if (guestIdFromDatabase) {
      return Promise.resolve(guestIdFromDatabase)
    }
  }

  const newGuestId = generateGuestId()

  storeGuestId(newGuestId, ipAddress)

  return Promise.resolve(newGuestId)
}
