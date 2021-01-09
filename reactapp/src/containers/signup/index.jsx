import React from 'react'
import useUserRecord from '../../hooks/useUserRecord'
import ErrorMessage from '../../components/error-message'

export default ({ history: { push } }) => {
  const [, , user] = useUserRecord()

  // useEffect(() => {
  //   if (user) {
  //     trackAction('Signup', 'User visited but already logged in')
  //   }
  // }, [user === null])

  if (user) {
    return <ErrorMessage>You are already logged in</ErrorMessage>
  }

  return (
    <ErrorMessage>
      The site is in read-only mode so you cannot sign-up
    </ErrorMessage>
  )
}
