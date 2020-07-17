import { useState, useEffect, useRef } from 'react'
import { firestore } from 'firebase/app'

import { CollectionNames } from './useDatabaseQuery'
import useFirebaseUserId from './useFirebaseUserId'

import { getGuestIdFromStorage, getUserIp } from '../guest-users'
import { handleError } from '../error-handling'

async function getData() {
  try {
    isGettingData = true

    let knownGuestId = await getGuestIdFromStorage()

    const guestDoc = await firestore()
      .collection(CollectionNames.GuestUsers)
      .doc(knownGuestId)

    const snapshot = await guestDoc.get()

    if (!snapshot.exists) {
      const ip = await getUserIp()

      // If IP lookup fails
      if (!ip) {
        return
      }

      await guestDoc.set({
        ipAddress: ip,
        createdAt: new Date()
      })
    }

    const data = await snapshot.data()

    lastKnownData = {
      id: snapshot.id,
      ...data
    }

    isGettingData = false

    callbacks.forEach(cb => cb(lastKnownData))
  } catch (err) {
    console.error('Failed to use guest user record', err)
    handleError(err)

    // Throw so hook can render error state
    throw err
  }
}

let isGettingData = false
let lastKnownData = null

let callbacks = []

function addCallback(cb) {
  callbacks.push(cb)
}

function removeCallback(cb) {
  callbacks = callbacks.filter(callbackUnderTest => callbackUnderTest !== cb)
}

export default () => {
  const userId = useFirebaseUserId()
  const [isLoading] = useState(false)
  const [isErrored] = useState(false)
  const [data, setData] = useState(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    // Only ever do this hook stuff if you are logged out
    if (userId) {
      return
    }

    async function callback(data) {
      if (!isMountedRef.current) {
        return
      }
      setData(data)
    }

    addCallback(callback)

    if (lastKnownData) {
      setData(lastKnownData)
    }

    // If first hook to demand data, start it
    if (!isGettingData && !lastKnownData) {
      getData()
    }

    return () => {
      removeCallback(callback)
      isMountedRef.current = false
    }
  }, [userId])

  return [isLoading, isErrored, data]
}
