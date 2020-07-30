import React, { useState } from 'react'
import TextField from '@material-ui/core/TextField'
import { makeStyles } from '@material-ui/core/styles'

import useDatabaseQuery, {
  CollectionNames,
  AuthorFieldNames,
  OrderDirections
} from '../../../../hooks/useDatabaseQuery'
import useDatabaseSave from '../../../../hooks/useDatabaseSave'
import useFirebaseUserId from '../../../../hooks/useFirebaseUserId'
import Button from '../../../button'
import Paper from '../../../paper'
import Heading from '../../../heading'
import { createRef } from '../../../../utils'
import { handleError } from '../../../../error-handling'

const useStyles = makeStyles({
  heading: {
    margin: 0
  }
})

function AuthorList({ onSelect }) {
  const [isLoading, isErrored, results] = useDatabaseQuery(
    CollectionNames.Authors,
    undefined,
    undefined,
    [AuthorFieldNames.name, OrderDirections.ASC]
  )

  if (isLoading) {
    return 'Loading...'
  }

  if (isErrored) {
    return 'Error!'
  }

  if (!results.length) {
    return 'No authors found'
  }

  return (
    <>
      {results.map(result => (
        <Button
          key={result.id}
          onClick={() => onSelect(result)}
          variant="default">
          {result[AuthorFieldNames.name]}
        </Button>
      ))}
    </>
  )
}

function AddAuthorForm() {
  const [isSaving, isSuccess, isErrored, save] = useDatabaseSave(
    CollectionNames.Authors
  )
  const [formFields, setFormFields] = useState({
    [AuthorFieldNames.name]: ''
  })
  const userId = useFirebaseUserId()

  const onFormFieldChanged = (fieldName, fieldValue) => {
    setFormFields(currentFields => ({
      ...currentFields,
      [fieldName]: fieldValue
    }))
  }

  const onSaveBtnClick = async () => {
    try {
      await save({
        ...formFields,
        [AuthorFieldNames.createdAt]: new Date(),
        [AuthorFieldNames.createdBy]: createRef(CollectionNames.Users, userId)
      })
    } catch (err) {
      handleError(err)
    }
  }

  if (isSaving) {
    return 'Saving...'
  }

  if (isErrored) {
    return 'Failed to save. Please try again later'
  }

  if (isSuccess) {
    return 'Success! It should now be in the list to choose from'
  }

  return (
    <>
      Enter their name:
      <TextField
        onChange={e =>
          onFormFieldChanged(AuthorFieldNames.name, e.target.value)
        }
      />
      <Button onClick={onSaveBtnClick}>Save</Button>
    </>
  )
}

export default ({ onNewAuthorId, author = null }) => {
  const [isAuthorListExpanded, setIsAuthorListExpanded] = useState(false)
  const [isAddAuthorFormVisible, setIsAddAuthorFormVisible] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const classes = useStyles()

  return (
    <Paper>
      <Heading variant="h3" className={classes.heading}>
        Author
      </Heading>
      <p>
        Select an author from the list below. Create a new one if you cannot
        find the author. This feature is new and will be improved over time.
      </p>
      {author || selectedAuthor
        ? `Selected author "${author ? author.name : selectedAuthor.name}"`
        : 'No author selected'}
      <br />
      <br />
      {isAuthorListExpanded ? (
        <AuthorList
          onSelect={doc => {
            onNewAuthorId(doc.id)
            setSelectedAuthor(doc)
            setIsAuthorListExpanded(false)
          }}
        />
      ) : (
        <Button onClick={() => setIsAuthorListExpanded(true)}>
          Load authors
        </Button>
      )}
      <br />
      <br />
      {isAddAuthorFormVisible ? (
        <AddAuthorForm />
      ) : (
        <Button
          onClick={() => setIsAddAuthorFormVisible(true)}
          variant="default">
          Create New Author
        </Button>
      )}
    </Paper>
  )
}
