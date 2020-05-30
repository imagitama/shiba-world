import React from 'react'
import { connect } from 'react-redux'
import LoadingIndicator from '../components/loading-indicator'
import NoPermissionMessage from '../components/no-permission-message'
import ErrorMessage from '../components/error-message'
import useDatabase from '../hooks/useDatabase'
import { CollectionNames } from '../hooks/useDatabaseQuery'

const mapStateToProps = ({ firebase: { auth } }) => ({ auth })

export default (Component, whichFlagName, showMustLoginMessage = true) =>
  connect(mapStateToProps)(({ auth, ...otherProps }) => {
    if (!whichFlagName) {
      return (
        <ErrorMessage>
          Cannot restrict access to user flag: no flag name provided
        </ErrorMessage>
      )
    }

    // On fresh load of a page we wait until firebase gets back to us
    if (!auth || !auth.isLoaded) {
      return <LoadingIndicator />
    }

    if (!auth.uid) {
      if (showMustLoginMessage) {
        return <NoPermissionMessage>You are not logged in</NoPermissionMessage>
      } else {
        return null
      }
    }

    const [isLoading, isErrored, user] = useDatabase(
      CollectionNames.Users,
      auth.uid
    )

    if (isLoading) {
      return <LoadingIndicator />
    }

    if (isErrored || !user) {
      return <ErrorMessage>Error fetching your details</ErrorMessage>
    }

    if (user[whichFlagName] !== true) {
      return (
        <NoPermissionMessage>
          You do not satisfy the condition of {whichFlagName}
        </NoPermissionMessage>
      )
    }

    return <Component {...otherProps} />
  })
