import React, { useEffect, useState } from 'react'
import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import Button from '../button'
import LoadingIndicator from '../loading-indicator'
import ErrorMessage from '../error-message'
import useUserRecord from '../../hooks/useUserRecord'
import { UserFieldNames } from '../../hooks/useDatabaseQuery'

const patreonOAuthUrl = `https://www.patreon.com/oauth2/authorize?response_type=code&client_id=${
  process.env.REACT_APP_PATREON_CLIENT_ID
}&redirect_uri=${
  process.env.REACT_APP_PATREON_REDIRECT_URI
}&scope=identity%20campaigns.members`
let oauthCode

const getPatreonUserInfoWithCode = oauthCode => {
  return callFunction('getPatreonUserInfo', {
    code: oauthCode
  })
}

export default () => {
  const [, , user] = useUserRecord()
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isErrored, setIsErrored] = useState(false)

  useEffect(() => {
    async function main() {
      try {
        let queryParams = window.location.search

        if (!queryParams) {
          return
        }

        queryParams = queryParams.replace('?', '')
        queryParams = queryParams.split('&')
        queryParams = queryParams
          .map(paramWithEquals => paramWithEquals.split('='))
          .reduce((params, [key, val]) => ({ ...params, [key]: val }), {})

        if (!queryParams.code) {
          return
        }

        setIsLoading(true)
        setIsErrored(false)

        oauthCode = queryParams.code

        const {
          data: { isOneDollarTierPatron }
        } = await getPatreonUserInfoWithCode(oauthCode)

        setIsLoading(false)
        setIsErrored(false)

        setResult(isOneDollarTierPatron)
      } catch (err) {
        console.error(err)
        setIsLoading(false)
        setIsErrored(true)
        handleError(err)
      }
    }

    main()
  }, [])

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (isErrored) {
    return <ErrorMessage>Failed to talk to Patreon</ErrorMessage>
  }

  if (result === true) {
    return 'We have detected that you are a patron of the $1 tier or more'
  }

  if (result === false) {
    return 'We have detected you are NOT a patron yet'
  }

  return (
    <div>
      {user && user[UserFieldNames.isPatron]
        ? 'You are a Patreon'
        : 'You are not a Patreon'}
      <Button url={patreonOAuthUrl}>Connect with Patreon</Button>
    </div>
  )
}
